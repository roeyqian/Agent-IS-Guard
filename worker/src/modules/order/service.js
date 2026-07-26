import { json, requireAuth, getSession } from "../../app/http.js";

export async function createOrder({ request, env }) {
  const token = requireAuth(request);
  const session = await getSession(token, env);
  const { items, shippingAddress } = await request.json();

  if (!items || items.length === 0) {
    throw { status: 400, message: "Order must contain at least one item" };
  }

  if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
    throw { status: 400, message: "Invalid shipping address" };
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await env.db.prepare(
      "SELECT id, name, price, stock, image_url FROM products WHERE id = ?"
    ).bind(item.productId).first();

    if (!product) {
      throw { status: 404, message: `Product ${item.productId} not found` };
    }

    if (product.stock < item.quantity) {
      throw { status: 400, message: `Insufficient stock for ${product.name}` };
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const orderNo = `ORD${Date.now()}`;

  await env.db.prepare(`
    INSERT INTO orders (id, order_no, user_id, total_amount, final_amount, status, shipping_address_json, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, datetime('now'))
  `).bind(orderId, orderNo, session.userId, totalAmount, totalAmount, JSON.stringify(shippingAddress)).run();

  for (const item of orderItems) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await env.db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(itemId, orderId, item.productId, item.productName, item.productImage, item.price, item.quantity, item.subtotal).run();

    await env.db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ?"
    ).bind(item.quantity, item.productId).run();
  }

  await env.db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(session.userId).run();

  return json({ orderId, orderNo, totalAmount });
}

export async function getOrders({ request, env }) {
  const token = requireAuth(request);
  const session = await getSession(token, env);

  const { results } = await env.db.prepare(`
    SELECT id, order_no, total_amount, final_amount, status, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(session.userId).all();

  return json({ orders: results });
}

export async function getOrderById({ request, env, params }) {
  const token = requireAuth(request);
  const session = await getSession(token, env);

  const order = await env.db.prepare(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?"
  ).bind(params.id, session.userId).first();

  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  const { results: items } = await env.db.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  ).bind(params.id).all();

  return json({
    order: {
      ...order,
      shippingAddress: JSON.parse(order.shipping_address_json),
      items,
    }
  });
}
