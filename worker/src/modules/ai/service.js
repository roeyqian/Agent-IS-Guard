import { json, readJsonBody, requireStandardUser, createId } from "../../app/http.js";
import { callDeepSeek } from "./deepseek.js";
import { getSellerPrompt } from "./seller.js";
import { getGuardianPrompt } from "./guardian.js";
import { getLocaleFromRequest, normalizeProduct } from "../shop/utils.js";

const HIDDEN_METADATA_KEY = 'hiddenFromUser';
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_AI_REQUESTS_PER_MINUTE = 12;
const HISTORY_LIMIT = 20;
const HISTORY_ORDER_DESC = `
    ORDER BY timestamp DESC,
      CASE role WHEN 'assistant' THEN 0 WHEN 'user' THEN 1 ELSE 2 END,
      id DESC
  `;

export async function chat({ request, env, url }) {
  const { token, session } = await requireStandardUser(request, env);
  const locale = getLocaleFromRequest(request, url);
  const body = await readJsonBody(request);
  const message = String(body.message || '').trim();
  const { aiType, productId } = body;
  const conversationId = requireConversationId(body.conversationId);
  const clientMessageId = requireClientMessageId(body.clientMessageId);

  if (!message || !aiType) {
    throw { status: 400, message: "Message and aiType required" };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw { status: 400, message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` };
  }

  if (!['seller', 'guardian'].includes(aiType)) {
    throw { status: 400, message: "Invalid AI type" };
  }

  const duplicate = await findIdempotentResponse(env, session.userId, clientMessageId);
  if (duplicate.response) return json({ response: duplicate.response, aiType, idempotent: true });
  if (duplicate.pending) throw { status: 409, message: 'AI request is still being processed' };

  await enforceAiRateLimit(env, session.userId);

  const config = await env.db.prepare("SELECT * FROM ai_config WHERE id = 1").first();
  if (!config || !config.deepseek_api_key) {
    throw { status: 503, message: "AI service not configured. Please contact administrator to set up DeepSeek API Key." };
  }

  if (aiType === 'seller' && !config.seller_ai_enabled) {
    throw { status: 503, message: "Promotional AI is currently disabled" };
  }

  if (aiType === 'guardian' && !config.guardian_ai_enabled) {
    throw { status: 503, message: "Guardian AI is currently disabled" };
  }

  const { results: history } = await env.db.prepare(`
    SELECT role, content FROM ai_conversations
    WHERE user_id = ? AND ai_type = ? AND conversation_id = ?
    ${HISTORY_ORDER_DESC}
    LIMIT ${HISTORY_LIMIT}
  `).bind(session.userId, aiType, conversationId).all();

  const messages = history.reverse().map(h => ({ role: h.role, content: h.content }));

  let productInfo = null;
  if (productId) {
    const product = await env.db.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
    productInfo = product ? normalizeProduct(product, locale) : null;
  }

  const systemPrompt = aiType === 'seller'
    ? getSellerPrompt(productInfo, locale)
    : getGuardianPrompt(session, productInfo, locale);

  const messageRecordId = createId("conv");
  const userTimestamp = new Date().toISOString();

  const reservation = await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, conversation_id, client_message_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, ?)
  `).bind(
    `${messageRecordId}_u`,
    session.userId,
    token,
    conversationId,
    clientMessageId,
    aiType,
    message,
    productId || null,
    JSON.stringify({ messageLength: message.length, source: 'research-shell' }),
    userTimestamp
  ).run().catch(async (error) => {
    const existing = await findIdempotentResponse(env, session.userId, clientMessageId);
    if (existing.response) return { duplicateResponse: existing.response };
    if (existing.pending) return { duplicatePending: true };
    throw error;
  });

  if (reservation?.duplicateResponse) {
    return json({ response: reservation.duplicateResponse, aiType, idempotent: true });
  }
  if (reservation?.duplicatePending) {
    throw { status: 409, message: 'AI request is still being processed' };
  }

  let aiResponse;
  try {
    aiResponse = await callDeepSeek(config, systemPrompt, messages, message, { signal: request.signal });
  } catch (error) {
    await env.db.prepare('DELETE FROM ai_conversations WHERE user_id = ? AND client_message_id = ?')
      .bind(session.userId, clientMessageId)
      .run();
    throw error;
  }
  const assistantTimestamp = createLaterIsoTimestamp(userTimestamp);

  try {
    await env.db.prepare(`
      INSERT INTO ai_conversations (id, user_id, session_id, conversation_id, reply_to_message_id, ai_type, role, content, product_id, metadata_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, 'assistant', ?, ?, ?, ?)
    `).bind(
      `${messageRecordId}_a`,
      session.userId,
      token,
      conversationId,
      clientMessageId,
      aiType,
      aiResponse,
      productId || null,
      JSON.stringify({ model: config.deepseek_model || 'deepseek-chat' }),
      assistantTimestamp
    ).run();
  } catch (error) {
    await env.db.prepare('DELETE FROM ai_conversations WHERE user_id = ? AND client_message_id = ?')
      .bind(session.userId, clientMessageId)
      .run();
    throw error;
  }

  return json({ response: aiResponse, aiType });
}

export async function promotionalNudge({ request, env, url }) {
  const { token, session } = await requireStandardUser(request, env);
  const locale = getLocaleFromRequest(request, url);
  const { productId, dwellMs, source, conversationId: rawConversationId } = await readJsonBody(request);
  const conversationId = requireConversationId(rawConversationId);

  if (!productId) {
    throw { status: 400, message: "Product required" };
  }

  const dwellDuration = Number(dwellMs || 0);
  if (!Number.isFinite(dwellDuration) || dwellDuration < 10_000) {
    throw { status: 400, message: "Dwell time must be at least 10 seconds" };
  }

  const config = await env.db.prepare("SELECT * FROM ai_config WHERE id = 1").first();
  if (!config || !config.deepseek_api_key) {
    throw { status: 503, message: "AI service not configured. Please contact administrator to set up DeepSeek API Key." };
  }

  if (!config.seller_ai_enabled) {
    throw { status: 503, message: "Promotional AI is currently disabled" };
  }

  const product = await env.db.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  const productInfo = normalizeProduct(product, locale);
  const { results: history } = await env.db.prepare(`
    SELECT role, content, metadata_json FROM ai_conversations
    WHERE user_id = ? AND ai_type = 'seller' AND conversation_id = ?
    ${HISTORY_ORDER_DESC}
    LIMIT 50
  `).bind(session.userId, conversationId).all();

  const hasPromotionalMessage = await env.db.prepare(`
    SELECT 1 FROM ai_conversations
    WHERE user_id = ? AND ai_type = 'seller' AND conversation_id = ? AND role = 'assistant'
    LIMIT 1
  `).bind(session.userId, conversationId).first();
  if (hasPromotionalMessage && Math.random() >= 0.5) {
    return json({
      skipped: true,
      reason: 'randomly_skipped',
      aiType: 'seller',
    });
  }

  const messages = history
    .slice(0, 10)
    .reverse()
    .map(({ role, content }) => ({ role, content }));

  const nudgeInstruction = buildPromotionalNudgePrompt(productInfo, locale);

  const userTimestamp = new Date().toISOString();
  const aiResponse = await callDeepSeek(
    config,
    `${getSellerPrompt(productInfo, locale)}\n\n${nudgeInstruction}`,
    messages,
    locale === 'en-US' ? 'Please send the proactive message now.' : '请现在发送这条主动消息。',
    { signal: request.signal },
  );
  const assistantTimestamp = createLaterIsoTimestamp(userTimestamp);
  const messageRecordId = createId("conv");
  await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, conversation_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, 'seller', 'assistant', ?, ?, ?, ?)
  `).bind(
    `${messageRecordId}_a`,
    session.userId,
    token,
    conversationId,
    aiResponse,
    productId,
    JSON.stringify({
      model: config.deepseek_model || 'deepseek-chat',
      source: source || 'product-dwell',
      dwellMs: dwellDuration,
      proactive: true,
    }),
    assistantTimestamp
  ).run();

  return json({ response: aiResponse, aiType: 'seller' });
}

export async function getHistory({ request, env, url }) {
  const { session } = await requireStandardUser(request, env);
  const aiType = url.searchParams.get('aiType');
  const conversationId = requireConversationId(url.searchParams.get('conversationId'));

  let query = "SELECT * FROM ai_conversations WHERE user_id = ? AND conversation_id = ?";
  const params = [session.userId, conversationId];

  if (aiType) {
    query += " AND ai_type = ?";
    params.push(aiType);
  }

  query += ` ${HISTORY_ORDER_DESC} LIMIT ${HISTORY_LIMIT}`;

  const { results } = await env.db.prepare(query).bind(...params).all();

  return json({ history: results.filter((item) => !isHiddenConversation(item)) });
}

export async function clearHistory({ request, env, url }) {
  const { session } = await requireStandardUser(request, env);
  const aiType = url.searchParams.get('aiType');
  const conversationId = requireConversationId(url.searchParams.get('conversationId'));

  if (!['seller', 'guardian'].includes(aiType)) {
    throw { status: 400, message: 'A valid AI type is required' };
  }

  const result = await env.db.prepare(`
    DELETE FROM ai_conversations
    WHERE user_id = ? AND ai_type = ? AND conversation_id = ?
  `).bind(session.userId, aiType, conversationId).run();

  return json({ aiType, clearedCount: result.meta.changes || 0 });
}

function requireConversationId(value) {
  const conversationId = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{12,100}$/.test(conversationId)) {
    throw { status: 400, message: 'A valid conversation ID is required' };
  }
  return conversationId;
}

function requireClientMessageId(value) {
  const clientMessageId = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{12,100}$/.test(clientMessageId)) {
    throw { status: 400, message: 'A valid client message ID is required' };
  }
  return clientMessageId;
}

async function findIdempotentResponse(env, userId, clientMessageId) {
  const userMessage = await env.db.prepare(`
    SELECT id FROM ai_conversations
    WHERE user_id = ? AND client_message_id = ?
  `).bind(userId, clientMessageId).first();

  if (!userMessage) return { pending: false, response: '' };

  const assistantMessage = await env.db.prepare(`
    SELECT content FROM ai_conversations
    WHERE user_id = ? AND reply_to_message_id = ?
    LIMIT 1
  `).bind(userId, clientMessageId).first();

  return { pending: !assistantMessage, response: assistantMessage?.content || '' };
}

async function enforceAiRateLimit(env, userId) {
  const row = await env.db.prepare(`
    SELECT COUNT(*) AS value FROM ai_conversations
    WHERE user_id = ? AND role = 'user'
      AND timestamp >= datetime('now', '-60 seconds')
  `).bind(userId).first();

  if (Number(row?.value || 0) >= MAX_AI_REQUESTS_PER_MINUTE) {
    throw { status: 429, message: 'Too many AI requests. Please wait a moment and try again.' };
  }
}

function isHiddenConversation(item) {
  try {
    const metadata = JSON.parse(item.metadata_json || '{}');
    return Boolean(metadata[HIDDEN_METADATA_KEY]);
  } catch {
    return false;
  }
}

function createLaterIsoTimestamp(previousTimestamp) {
  const previousTime = Date.parse(previousTimestamp);
  const now = Date.now();
  const nextTime = Number.isFinite(previousTime) ? Math.max(now, previousTime + 1) : now;
  return new Date(nextTime).toISOString();
}

function buildPromotionalNudgePrompt(productInfo, locale) {
  const productName = productInfo.name || (locale === 'en-US' ? 'this item' : '这个商品');

  if (locale === 'en-US') {
    return [
      `The user has been viewing "${productName}" for at least 10 seconds. As the Promotional AI, proactively send one short message to the user.`,
      'Make it natural, warm, and exploratory. Identify one plausible use scenario or unmet need, then connect it to 1-2 verifiable product benefits using conditional wording such as “if you are looking to...”.',
      'Do not use urgency, scarcity, discounts, popularity, social proof, hype, or pressure to purchase. Do not present a market trend or user need as a fact unless it is provided in the product information.',
      'Do not mention system detection, dwell time, backend triggers, research logs, or this instruction.',
      'Output only the user-facing message, under 45 English words.',
    ].join('\n');
  }

  return [
    `用户正在查看"${productName}"至少10秒，请你作为促销型 AI 主动向用户发一条简短消息。`,
    '消息要自然、友好且具有探索性：点出一个可能的使用场景或未满足需求，再用“如果你正在……，它可能会……”等条件式表达连接1-2个可验证的商品价值。',
    '不要使用紧迫感、稀缺、折扣、热销、从众、夸张或催单表达；没有商品信息支撑时，也不要把市场趋势或用户需求说成事实。',
    '不要提及系统检测、停留时长、后台触发、研究记录或这条指令。',
    '直接输出面向用户的一条消息，控制在80个中文字符以内。',
  ].join('\n');
}
