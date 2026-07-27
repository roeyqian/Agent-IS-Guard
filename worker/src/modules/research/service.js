import { json, requireAdmin, requireAuth, getSession } from "../../app/http.js";
import { getLocaleFromRequest } from "../shop/utils.js";

export async function trackBehavior({ request, env }) {
  const token = requireAuth(request);
  const session = await getSession(token, env);
  const body = await request.json();
  const { behaviorType, productId, durationMs, metadata } = body;

  if (session.role === 'admin') {
    return json({ message: "Admin behavior ignored", skipped: true });
  }

  if (!behaviorType) {
    throw { status: 400, message: "Behavior type required" };
  }

  if (behaviorType === 'click') {
    return json({ message: "Click behavior ignored", skipped: true });
  }

  const validTypes = ['view_product', 'add_cart', 'remove_cart', 'place_order', 'chat_ai', 'search', 'intervention_check'];
  if (!validTypes.includes(behaviorType)) {
    throw { status: 400, message: "Invalid behavior type" };
  }

  const behaviorId = `beh_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const reservedFields = new Set(['behaviorType', 'productId', 'durationMs', 'metadata']);
  const derivedMetadata = Object.fromEntries(
    Object.entries(body).filter(([key]) => !reservedFields.has(key)),
  );
  const metadataJson = JSON.stringify({
    ...derivedMetadata,
    ...(metadata && typeof metadata === 'object' ? metadata : {}),
  });

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
    metadataJson
  ).run();

  return json({ message: "Behavior tracked", behaviorId });
}

export async function getSummary({ request, env, url }) {
  await requireAdmin(request, env);
  const locale = getLocaleFromRequest(request, url);

  const userRow = await env.db.prepare("SELECT COUNT(*) as value FROM users WHERE role = 'user'").first();
  const orderRow = await env.db.prepare("SELECT COUNT(*) as value FROM orders o JOIN users u ON u.id = o.user_id WHERE u.role = 'user'").first();
  const revenueRow = await env.db.prepare("SELECT COALESCE(SUM(o.final_amount), 0) as value FROM orders o JOIN users u ON u.id = o.user_id WHERE u.role = 'user' AND o.status != 'cancelled'").first();
  const conversationRow = await env.db.prepare("SELECT COUNT(*) as value FROM ai_conversations ac JOIN users u ON u.id = ac.user_id WHERE u.role = 'user'").first();
  const productRow = await env.db.prepare("SELECT COUNT(*) as value FROM products").first();
  const behaviorRow = await env.db.prepare("SELECT COUNT(*) as value FROM user_behaviors ub JOIN users u ON u.id = ub.user_id WHERE u.role = 'user'").first();
  const sessionRow = await env.db.prepare("SELECT COUNT(DISTINCT ub.session_id) as value FROM user_behaviors ub JOIN users u ON u.id = ub.user_id WHERE u.role = 'user'").first();
  const todayBehaviorRow = await env.db.prepare("SELECT COUNT(*) as value FROM user_behaviors ub JOIN users u ON u.id = ub.user_id WHERE u.role = 'user' AND date(ub.timestamp) = date('now')").first();
  const todayConversationRow = await env.db.prepare("SELECT COUNT(*) as value FROM ai_conversations ac JOIN users u ON u.id = ac.user_id WHERE u.role = 'user' AND date(ac.timestamp) = date('now')").first();
  const behaviorBreakdownRows = await env.db.prepare(
    `SELECT ub.behavior_type, COUNT(*) as value
     FROM user_behaviors ub
     JOIN users u ON u.id = ub.user_id
     WHERE u.role = 'user'
     GROUP BY ub.behavior_type
     ORDER BY value DESC`
  ).all();
  const topProductRows = await env.db.prepare(
    `SELECT p.id, p.name, p.name_en, p.price, p.rating, p.stock,
            COUNT(ub.id) as view_count
     FROM products p
     LEFT JOIN user_behaviors ub ON ub.product_id = p.id
       AND ub.behavior_type = 'view_product'
       AND ub.user_id IN (SELECT id FROM users WHERE role = 'user')
     GROUP BY p.id
     ORDER BY view_count DESC, p.sales_count DESC
     LIMIT 6`
  ).all();
  const dailyBehaviorRows = await env.db.prepare(
    `SELECT date(ub.timestamp) as day, COUNT(*) as value
     FROM user_behaviors ub
     JOIN users u ON u.id = ub.user_id
     WHERE u.role = 'user' AND ub.timestamp >= date('now', '-6 days')
     GROUP BY date(ub.timestamp)
     ORDER BY day ASC`
  ).all();
  const recentSessionRows = await env.db.prepare(
    `SELECT ub.session_id,
            MAX(ub.timestamp) as last_seen,
            COUNT(*) as event_count,
            COUNT(DISTINCT ub.user_id) as user_count
     FROM user_behaviors ub
     JOIN users u ON u.id = ub.user_id
     WHERE u.role = 'user'
     GROUP BY ub.session_id
     ORDER BY last_seen DESC
     LIMIT 8`
  ).all();
  const aiUsageRows = await env.db.prepare(
    `SELECT ac.ai_type, COUNT(*) as value
     FROM ai_conversations ac
     JOIN users u ON u.id = ac.user_id
     WHERE u.role = 'user' AND ac.role = 'user'
     GROUP BY ac.ai_type`
  ).all();
  const interventionRows = await env.db.prepare(
    `SELECT json_extract(ub.metadata_json, '$.strategy') as strategy,
            COUNT(*) as value
     FROM user_behaviors ub
     JOIN users u ON u.id = ub.user_id
     WHERE u.role = 'user' AND ub.behavior_type = 'intervention_check'
     GROUP BY strategy
     ORDER BY value DESC`
  ).all();

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
      name: locale === 'en-US' && row.name_en ? row.name_en : row.name,
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
    interventions: interventionRows.results.map((row) => ({
      strategy: row.strategy || 'unknown',
      value: Number(row.value || 0),
    })),
  });
}
