import { json, readJsonBody, requireStandardUser, createId } from "../../app/http.js";
import { getProductImageUrl } from "../shop/utils.js";

export async function createOrder({ request, env }) {
  const { session } = await requireStandardUser(request, env);
  const { items, shippingAddress } = await readJsonBody(request);

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
      productImage: getProductImageUrl(product.id),
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const orderId = createId("order");
  const orderNo = `ORD${Date.now()}`;
  const statements = [
    env.db.prepare(`
      INSERT INTO orders (id, order_no, user_id, total_amount, final_amount, status, shipping_address_json, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, datetime('now'))
    `).bind(orderId, orderNo, session.userId, totalAmount, totalAmount, JSON.stringify(shippingAddress)),
    env.db.prepare(`
      INSERT INTO order_events (id, order_id, event_type, status, note, actor_user_id, created_at)
      VALUES (?, ?, 'created', 'pending', ?, ?, datetime('now'))
    `).bind(createId("ordevt"), orderId, 'Order created by customer', session.userId),
    ...orderItems.flatMap((item) => [
      env.db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(createId("item"), orderId, item.productId, item.productName, item.productImage, item.price, item.quantity, item.subtotal),
      env.db.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?"
      ).bind(item.quantity, item.productId),
    ]),
    env.db.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(session.userId),
  ];

  await env.db.batch(statements);

  return json({ orderId, orderNo, totalAmount });
}

export async function getOrders({ request, env }) {
  const { session } = await requireStandardUser(request, env);

  const { results } = await env.db.prepare(`
    SELECT o.id, o.order_no, o.total_amount, o.final_amount, o.status, o.created_at,
           COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).bind(session.userId).all();

  return json({ orders: results });
}

export async function getOrderById({ request, env, params }) {
  const { session } = await requireStandardUser(request, env);

  const order = await env.db.prepare(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?"
  ).bind(params.id, session.userId).first();

  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  const { results: items } = await env.db.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  ).bind(params.id).all();

  const { results: events } = await env.db.prepare(
    `SELECT oe.*, u.username AS actor_name
     FROM order_events oe
     LEFT JOIN users u ON u.id = oe.actor_user_id
     WHERE oe.order_id = ?
     ORDER BY oe.created_at ASC`
  ).bind(params.id).all();

  return json({
    order: {
      ...order,
      shippingAddress: JSON.parse(order.shipping_address_json),
      items,
      events: events.map((event) => ({
        ...event,
        note: event.note || '',
      })),
    }
  });
}
