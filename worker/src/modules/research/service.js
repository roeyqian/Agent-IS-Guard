import { json, requireAuth, getSession } from "../../app/http.js";

export async function trackBehavior({ request, env }) {
  const token = requireAuth(request);
  const session = await getSession(token, env);
  const { behaviorType, productId, durationMs, metadata } = await request.json();

  if (!behaviorType) {
    throw { status: 400, message: "Behavior type required" };
  }

  const validTypes = ['view_product', 'add_cart', 'remove_cart', 'place_order', 'chat_ai', 'search', 'click'];
  if (!validTypes.includes(behaviorType)) {
    throw { status: 400, message: "Invalid behavior type" };
  }

  const behaviorId = `beh_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  await env.db.prepare(`
    INSERT INTO user_behaviors (id, user_id, session_id, behavior_type, product_id, duration_ms, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    behaviorId,
    session.userId,
    token,
    behaviorType,
    productId || null,
    durationMs || null,
    JSON.stringify(metadata || {})
  ).run();

  return json({ message: "Behavior tracked", behaviorId });
}
