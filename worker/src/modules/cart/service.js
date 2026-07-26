import { json, requireStandardUser } from "../../app/http.js";
import { getProductImageUrl } from "../shop/utils.js";

export async function getCart({ request, env }) {
  const { session } = await requireStandardUser(request, env);

  const { results } = await env.db.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.added_at DESC
  `).bind(session.userId).all();

  const items = results.map((item) => ({
    ...item,
    image_url: getProductImageUrl(item.product_id),
  }));

  return json({ items });
}

export async function addToCart({ request, env }) {
  const { session } = await requireStandardUser(request, env);
  const { productId, quantity = 1 } = await request.json();

  if (!productId) {
    throw { status: 400, message: "Product ID required" };
  }

  const product = await env.db.prepare("SELECT id, stock FROM products WHERE id = ?").bind(productId).first();
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  if (product.stock < quantity) {
    throw { status: 400, message: "Insufficient stock" };
  }

  const existing = await env.db.prepare(
    "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?"
  ).bind(session.userId, productId).first();

  if (existing) {
    const newQuantity = existing.quantity + quantity;
    await env.db.prepare(
      "UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(newQuantity, existing.id).run();
  } else {
    const itemId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await env.db.prepare(`
      INSERT INTO cart_items (id, user_id, product_id, quantity, added_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(itemId, session.userId, productId, quantity).run();
  }

  return json({ message: "Added to cart" });
}

export async function updateCartItem({ request, env, params }) {
  const { session } = await requireStandardUser(request, env);
  const { quantity } = await request.json();

  if (quantity < 1) {
    throw { status: 400, message: "Quantity must be at least 1" };
  }

  await env.db.prepare(
    "UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).bind(quantity, params.itemId, session.userId).run();

  return json({ message: "Cart updated" });
}

export async function removeCartItem({ request, env, params }) {
  const { session } = await requireStandardUser(request, env);

  await env.db.prepare(
    "DELETE FROM cart_items WHERE id = ? AND user_id = ?"
  ).bind(params.itemId, session.userId).run();

  return json({ message: "Item removed" });
}
