import { json } from "../../app/http.js";

export async function getProducts({ request, env, url }) {
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category_id = ?";
    params.push(category);
  }

  query += " ORDER BY is_hot DESC, sales_count DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const { results } = await env.db.prepare(query).bind(...params).all();

  const products = results.map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    specs: JSON.parse(p.specs_json || '{}'),
    tags: JSON.parse(p.tags_json || '[]'),
  }));

  return json({ products, total: results.length });
}

export async function getProductById({ env, params }) {
  const product = await env.db.prepare(
    "SELECT * FROM products WHERE id = ?"
  ).bind(params.id).first();

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  const productDetail = {
    ...product,
    images: JSON.parse(product.images_json || '[]'),
    specs: JSON.parse(product.specs_json || '{}'),
    tags: JSON.parse(product.tags_json || '[]'),
  };

  return json({ product: productDetail });
}

export async function getCategories({ env }) {
  const { results } = await env.db.prepare(
    "SELECT * FROM categories ORDER BY sort_order"
  ).all();

  return json({ categories: results });
}
