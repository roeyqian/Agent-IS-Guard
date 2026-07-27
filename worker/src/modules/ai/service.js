import { json, readJsonBody, requireStandardUser, createId } from "../../app/http.js";
import { callDeepSeek } from "./deepseek.js";
import { getSellerPrompt } from "./seller.js";
import { getGuardianPrompt } from "./guardian.js";
import { getLocaleFromRequest, normalizeProduct } from "../shop/utils.js";

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
    ORDER BY timestamp DESC LIMIT 10
  `).bind(session.userId, aiType).all();

  const messages = history.reverse().map(h => ({ role: h.role, content: h.content }));

  let productInfo = null;
  if (productId) {
    const product = await env.db.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
    productInfo = product ? normalizeProduct(product, locale) : null;
  }

  const systemPrompt = aiType === 'seller'
    ? getSellerPrompt(productInfo)
    : getGuardianPrompt(session, productInfo);

  const aiResponse = await callDeepSeek(config, systemPrompt, messages, message);

  const conversationId = createId("conv");
  const timestamp = new Date().toISOString();

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
    timestamp
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
    timestamp
  ).run();

  return json({ response: aiResponse, aiType });
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

  query += " ORDER BY timestamp DESC LIMIT 50";

  const { results } = await env.db.prepare(query).bind(...params).all();

  return json({ history: results });
}
