import { json } from "../../app/http.js";
import { getLocaleFromRequest, getProductImage, normalizeCategory, normalizeProduct } from "./utils.js";

export async function getProducts({ request, env, url }) {
  const locale = getLocaleFromRequest(request, url);
  const category = url.searchParams.get('category');
  const limit = clampInt(url.searchParams.get('limit'), 20, 1, 100);
  const offset = Math.max(0, clampInt(url.searchParams.get('offset'), 0, 0, Number.MAX_SAFE_INTEGER));

  let where = "WHERE 1=1";
  const params = [];

  if (category) {
    where += " AND category_id = ?";
    params.push(category);
  }

  const totalRow = await env.db.prepare(`SELECT COUNT(*) as total FROM products ${where}`).bind(...params).first();
  const total = Number(totalRow?.total || 0);

  const { results } = await env.db.prepare(`
    SELECT *
    FROM products
    ${where}
    ORDER BY is_hot DESC, sales_count DESC, updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  const products = results.map((product) => normalizeProduct(product, locale));

  return json({
    products,
    total,
    pageInfo: {
      limit,
      offset,
      hasMore: offset + results.length < total,
    },
  });
}

export async function getProductById({ request, env, params, url }) {
  const locale = getLocaleFromRequest(request, url);
  const product = await env.db.prepare(
    "SELECT * FROM products WHERE id = ?"
  ).bind(params.id).first();

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  const productDetail = normalizeProduct(product, locale);

  return json({ product: productDetail });
}

export async function getCategories({ request, env, url }) {
  const locale = getLocaleFromRequest(request, url);
  const { results } = await env.db.prepare(
    "SELECT * FROM categories ORDER BY sort_order"
  ).all();

  return json({ categories: results.map((category) => normalizeCategory(category, locale)) });
}

export async function getProductInsights({ request, env, params, url }) {
  const locale = getLocaleFromRequest(request, url);
  const product = await env.db.prepare(
    "SELECT * FROM products WHERE id = ?"
  ).bind(params.id).first();

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  const [
    viewRow,
    cartRow,
    orderRow,
    revenueRow,
    aiRows,
    recentBehaviorRows,
    relatedRows,
  ] = await Promise.all([
    env.db.prepare(
      `SELECT COUNT(*) as value
       FROM user_behaviors ub
       JOIN users u ON u.id = ub.user_id
       WHERE u.role = 'user' AND ub.product_id = ? AND ub.behavior_type = 'view_product'`
    ).bind(params.id).first(),
    env.db.prepare(
      `SELECT COUNT(*) as value
       FROM user_behaviors ub
       JOIN users u ON u.id = ub.user_id
       WHERE u.role = 'user' AND ub.product_id = ? AND ub.behavior_type = 'add_cart'`
    ).bind(params.id).first(),
    env.db.prepare(
      `SELECT COUNT(*) as value
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN users u ON u.id = o.user_id
       WHERE u.role = 'user' AND oi.product_id = ?`
    ).bind(params.id).first(),
    env.db.prepare(
      `SELECT COALESCE(SUM(oi.subtotal), 0) as value
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN users u ON u.id = o.user_id
       WHERE u.role = 'user' AND oi.product_id = ? AND o.status != 'cancelled'`
    ).bind(params.id).first(),
    env.db.prepare(
      `SELECT ac.ai_type, COUNT(*) as value
       FROM ai_conversations ac
       JOIN users u ON u.id = ac.user_id
       WHERE u.role = 'user' AND ac.product_id = ? AND ac.role = 'user'
       GROUP BY ac.ai_type`
    ).bind(params.id).all(),
    env.db.prepare(
      `SELECT ub.behavior_type, ub.session_id, ub.timestamp, ub.metadata_json, u.username
       FROM user_behaviors ub
       JOIN users u ON u.id = ub.user_id
       WHERE u.role = 'user' AND ub.product_id = ?
       ORDER BY ub.timestamp DESC
       LIMIT 8`
    ).bind(params.id).all(),
    env.db.prepare(
      `SELECT id, category_id, name, name_en, subtitle, subtitle_en, description, description_en,
              price, original_price, rating, stock, sales_count, image_url, images_json, specs_json, tags_json
       FROM products
       WHERE category_id = ? AND id != ?
       ORDER BY sales_count DESC, rating DESC
       LIMIT 4`
    ).bind(product.category_id, params.id).all(),
  ]);

  const aiUsage = aiRows.results.map((row) => ({
    aiType: row.ai_type,
    value: row.value,
  }));

  return json({
    product: normalizeProduct(product, locale),
    summary: {
      views: Number(viewRow?.value || 0),
      addToCart: Number(cartRow?.value || 0),
      orders: Number(orderRow?.value || 0),
      revenue: Number(revenueRow?.value || 0),
      aiUsage,
      recentSessions: new Set(recentBehaviorRows.results.map((item) => item.session_id)).size,
      conversionRate: calculateRate(Number(viewRow?.value || 0), Number(orderRow?.value || 0)),
    },
    recentBehaviors: recentBehaviorRows.results.map((row) => ({
      ...row,
      metadata: parseJson(row.metadata_json, {}),
    })),
    relatedProducts: relatedRows.results.map((item) => normalizeProduct(item, locale)),
  });
}

export { getProductImage };

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function calculateRate(views, orders) {
  if (!views) return 0;
  return Number(((orders / views) * 100).toFixed(1));
}
