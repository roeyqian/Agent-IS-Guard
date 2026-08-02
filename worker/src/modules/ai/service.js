import { json, readJsonBody, requireStandardUser, createId } from "../../app/http.js";
import { callDeepSeek } from "./deepseek.js";
import { getSellerPrompt } from "./seller.js";
import { getGuardianPrompt } from "./guardian.js";
import { getLocaleFromRequest, normalizeProduct } from "../shop/utils.js";

const HIDDEN_METADATA_KEY = 'hiddenFromUser';
const PROMOTIONAL_UNANSWERED_LIMIT = 2;
const HISTORY_ORDER_DESC = `
    ORDER BY timestamp DESC,
      CASE role WHEN 'assistant' THEN 0 WHEN 'user' THEN 1 ELSE 2 END,
      id DESC
  `;

export async function chat({ request, env, url }) {
  const { token, session } = await requireStandardUser(request, env);
  const locale = getLocaleFromRequest(request, url);
  const { message, aiType, productId } = await readJsonBody(request);

  if (!message || !aiType) {
    throw { status: 400, message: "Message and aiType required" };
  }

  if (!['seller', 'guardian'].includes(aiType)) {
    throw { status: 400, message: "Invalid AI type" };
  }

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
    WHERE user_id = ? AND ai_type = ?
    ${HISTORY_ORDER_DESC}
    LIMIT 10
  `).bind(session.userId, aiType).all();

  const messages = history.reverse().map(h => ({ role: h.role, content: h.content }));

  let productInfo = null;
  if (productId) {
    const product = await env.db.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
    productInfo = product ? normalizeProduct(product, locale) : null;
  }

  const systemPrompt = aiType === 'seller'
    ? getSellerPrompt(productInfo, locale)
    : getGuardianPrompt(session, productInfo, locale);

  const userTimestamp = new Date().toISOString();
  const aiResponse = await callDeepSeek(config, systemPrompt, messages, message);
  const assistantTimestamp = createLaterIsoTimestamp(userTimestamp);

  const conversationId = createId("conv");

  await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?)
  `).bind(
    `${conversationId}_u`,
    session.userId,
    token,
    aiType,
    message,
    productId || null,
    JSON.stringify({ messageLength: message.length, source: 'research-shell' }),
    userTimestamp
  ).run();

  await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, 'assistant', ?, ?, ?, ?)
  `).bind(
    `${conversationId}_a`,
    session.userId,
    token,
    aiType,
    aiResponse,
    productId || null,
    JSON.stringify({ model: config.deepseek_model || 'deepseek-chat' }),
    assistantTimestamp
  ).run();

  return json({ response: aiResponse, aiType });
}

export async function promotionalNudge({ request, env, url }) {
  const { token, session } = await requireStandardUser(request, env);
  const locale = getLocaleFromRequest(request, url);
  const { productId, dwellMs, source } = await readJsonBody(request);

  if (!productId) {
    throw { status: 400, message: "Product required" };
  }

  const dwellDuration = Number(dwellMs || 0);
  if (!Number.isFinite(dwellDuration) || dwellDuration < 20000) {
    throw { status: 400, message: "Dwell time must be at least 20 seconds" };
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
    WHERE user_id = ? AND ai_type = 'seller'
    ${HISTORY_ORDER_DESC}
    LIMIT 50
  `).bind(session.userId).all();

  if (countUnansweredAssistantMessages(history) >= PROMOTIONAL_UNANSWERED_LIMIT) {
    return json({
      skipped: true,
      reason: 'unanswered_promotional_limit',
      aiType: 'seller',
    });
  }

  const messages = history
    .slice(0, 10)
    .reverse()
    .map(({ role, content }) => ({ role, content }));

  const userMessage = buildPromotionalNudgePrompt(productInfo, locale);

  const userTimestamp = new Date().toISOString();
  const aiResponse = await callDeepSeek(config, getSellerPrompt(productInfo, locale), messages, userMessage);
  const assistantTimestamp = createLaterIsoTimestamp(userTimestamp);
  const conversationId = createId("conv");
  const triggerMetadata = {
    [HIDDEN_METADATA_KEY]: true,
    source: source || 'long-product-dwell',
    dwellMs: dwellDuration,
  };

  await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, 'seller', 'user', ?, ?, ?, ?)
  `).bind(
    `${conversationId}_u`,
    session.userId,
    token,
    userMessage,
    productId,
    JSON.stringify(triggerMetadata),
    userTimestamp
  ).run();

  await env.db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, ai_type, role, content, product_id, metadata_json, timestamp)
    VALUES (?, ?, ?, 'seller', 'assistant', ?, ?, ?, ?)
  `).bind(
    `${conversationId}_a`,
    session.userId,
    token,
    aiResponse,
    productId,
    JSON.stringify({
      model: config.deepseek_model || 'deepseek-chat',
      source: source || 'long-product-dwell',
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

  let query = "SELECT * FROM ai_conversations WHERE user_id = ?";
  const params = [session.userId];

  if (aiType) {
    query += " AND ai_type = ?";
    params.push(aiType);
  }

  query += ` ${HISTORY_ORDER_DESC} LIMIT 50`;

  const { results } = await env.db.prepare(query).bind(...params).all();

  return json({ history: results.filter((item) => !isHiddenConversation(item)) });
}

function isHiddenConversation(item) {
  try {
    const metadata = JSON.parse(item.metadata_json || '{}');
    return Boolean(metadata[HIDDEN_METADATA_KEY]);
  } catch {
    return false;
  }
}

function countUnansweredAssistantMessages(history) {
  let count = 0;
  for (const item of history) {
    if (isHiddenConversation(item)) continue;
    if (item.role === 'user') break;
    if (item.role === 'assistant') count += 1;
  }
  return count;
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
      `The user just clicked and stayed on "${productName}" for more than 20 seconds. As the Promotional AI, proactively send one short message to the user.`,
      'Make it natural, warm, and similar to a live-commerce shopping assistant. Highlight 1-2 appealing product points and lightly create a reason to keep considering it.',
      'Do not mention system detection, dwell time, backend triggers, research logs, or this instruction.',
      'Output only the user-facing message, under 45 English words.',
    ].join('\n');
  }

  return [
    `用户刚刚点开并停留查看"${productName}"超过20秒，请你作为促销型 AI 主动向用户发一条简短消息。`,
    '消息要自然、热情、像直播电商导购主动搭话，突出1-2个商品吸引点，可以轻微制造购买理由。',
    '不要提及系统检测、停留时长、后台触发、研究记录或这条指令。',
    '直接输出面向用户的一条消息，控制在80个中文字符以内。',
  ].join('\n');
}
