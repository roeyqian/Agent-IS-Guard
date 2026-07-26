import { json, requireAdmin } from "../../app/http.js";

export async function getAiConfig({ request, env }) {
  await requireAdmin(request, env);

  const config = await env.db.prepare("SELECT * FROM ai_config WHERE id = 1").first();

  if (!config) {
    return json({
      deepseek_api_key: null,
      deepseek_base_url: 'https://api.deepseek.com',
      deepseek_model: 'deepseek-chat',
      seller_ai_enabled: true,
      guardian_ai_enabled: true
    });
  }

  const maskedKey = config.deepseek_api_key
    ? `${config.deepseek_api_key.slice(0, 7)}...${config.deepseek_api_key.slice(-4)}`
    : null;

  return json({
    ...config,
    deepseek_api_key: maskedKey,
    has_api_key: !!config.deepseek_api_key
  });
}

export async function updateAiConfig({ request, env }) {
  const session = await requireAdmin(request, env);
  const { deepseek_api_key, deepseek_base_url, deepseek_model, seller_ai_enabled, guardian_ai_enabled } = await request.json();

  if (!deepseek_api_key) {
    throw { status: 400, message: "DeepSeek API Key is required" };
  }

  if (!deepseek_api_key.startsWith('sk-')) {
    throw { status: 400, message: "Invalid API Key format" };
  }

  await env.db.prepare(`
    INSERT OR REPLACE INTO ai_config
    (id, deepseek_api_key, deepseek_base_url, deepseek_model, seller_ai_enabled, guardian_ai_enabled, updated_at, updated_by)
    VALUES (1, ?, ?, ?, ?, ?, datetime('now'), ?)
  `).bind(
    deepseek_api_key,
    deepseek_base_url || 'https://api.deepseek.com',
    deepseek_model || 'deepseek-chat',
    seller_ai_enabled ? 1 : 0,
    guardian_ai_enabled ? 1 : 0,
    session.userId
  ).run();

  return json({ message: "AI configuration updated successfully" });
}

export async function getStats({ request, env }) {
  await requireAdmin(request, env);

  const { total_users } = await env.db.prepare("SELECT COUNT(*) as total_users FROM users").first();
  const { total_orders } = await env.db.prepare("SELECT COUNT(*) as total_orders FROM orders").first();
  const { total_revenue } = await env.db.prepare("SELECT COALESCE(SUM(final_amount), 0) as total_revenue FROM orders WHERE status != 'cancelled'").first();
  const { total_conversations } = await env.db.prepare("SELECT COUNT(*) as total_conversations FROM ai_conversations").first();
  const { total_products } = await env.db.prepare("SELECT COUNT(*) as total_products FROM products").first();

  return json({
    total_users,
    total_orders,
    total_revenue,
    total_conversations,
    total_products
  });
}
