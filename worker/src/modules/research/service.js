import { json, requireAdmin, requireAuth, getSession } from "../../app/http.js";

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

export async function getSummary({ request, env }) {
  await requireAdmin(request, env);

  const [
    userRow,
    orderRow,
    revenueRow,
    conversationRow,
    productRow,
    behaviorRow,
    sessionRow,
    todayBehaviorRow,
    todayConversationRow,
    behaviorBreakdownRows,
    topProductRows,
    dailyBehaviorRows,
    recentSessionRows,
    aiUsageRows,
  ] = await Promise.all([
    env.db.prepare("SELECT COUNT(*) as value FROM users").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM orders").first(),
    env.db.prepare("SELECT COALESCE(SUM(final_amount), 0) as value FROM orders WHERE status != 'cancelled'").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM ai_conversations").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM products").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM user_behaviors").first(),
    env.db.prepare("SELECT COUNT(DISTINCT session_id) as value FROM user_behaviors").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM user_behaviors WHERE date(timestamp) = date('now')").first(),
    env.db.prepare("SELECT COUNT(*) as value FROM ai_conversations WHERE date(timestamp) = date('now')").first(),
    env.db.prepare(
      `SELECT behavior_type, COUNT(*) as value
       FROM user_behaviors
       GROUP BY behavior_type
       ORDER BY value DESC`
    ).all(),
    env.db.prepare(
      `SELECT p.id, p.name, p.price, p.rating, p.stock,
              COUNT(ub.id) as view_count
       FROM products p
       LEFT JOIN user_behaviors ub ON ub.product_id = p.id AND ub.behavior_type = 'view_product'
       GROUP BY p.id
       ORDER BY view_count DESC, p.sales_count DESC
       LIMIT 6`
    ).all(),
    env.db.prepare(
      `SELECT date(timestamp) as day, COUNT(*) as value
       FROM user_behaviors
       WHERE timestamp >= date('now', '-6 days')
       GROUP BY date(timestamp)
       ORDER BY day ASC`
    ).all(),
    env.db.prepare(
      `SELECT session_id,
              MAX(timestamp) as last_seen,
              COUNT(*) as event_count,
              COUNT(DISTINCT user_id) as user_count
       FROM user_behaviors
       GROUP BY session_id
       ORDER BY last_seen DESC
       LIMIT 8`
    ).all(),
    env.db.prepare(
      `SELECT ai_type, COUNT(*) as value
       FROM ai_conversations
       WHERE role = 'user'
       GROUP BY ai_type`
    ).all(),
  ]);

  return json({
    totals: {
      users: Number(userRow?.value || 0),
      orders: Number(orderRow?.value || 0),
      revenue: Number(revenueRow?.value || 0),
      conversations: Number(conversationRow?.value || 0),
      products: Number(productRow?.value || 0),
      behaviors: Number(behaviorRow?.value || 0),
      sessions: Number(sessionRow?.value || 0),
      todayBehaviors: Number(todayBehaviorRow?.value || 0),
      todayConversations: Number(todayConversationRow?.value || 0),
    },
    behaviorBreakdown: behaviorBreakdownRows.results.map((row) => ({
      key: row.behavior_type,
      value: row.value,
    })),
    topProducts: topProductRows.results.map((row) => ({
      ...row,
      view_count: Number(row.view_count || 0),
    })),
    dailyBehavior: dailyBehaviorRows.results.map((row) => ({
      day: row.day,
      value: Number(row.value || 0),
    })),
    recentSessions: recentSessionRows.results.map((row) => ({
      ...row,
      event_count: Number(row.event_count || 0),
      user_count: Number(row.user_count || 0),
    })),
    aiUsage: aiUsageRows.results.map((row) => ({
      aiType: row.ai_type,
      value: Number(row.value || 0),
    })),
  });
}
