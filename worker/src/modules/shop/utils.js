export function getProductImageUrl(productId) {
  return `/api/products/${encodeURIComponent(productId)}/image`;
}

export function normalizeProduct(product) {
  const images = parseJson(product.images_json, []);
  return {
    ...product,
    image_url: getProductImageUrl(product.id),
    images,
    specs: parseJson(product.specs_json, {}),
    tags: parseJson(product.tags_json, []),
  };
}

export async function getProductImage({ env, params }) {
  const imageKey = `${params.id}.png`;
  const image = await env.zero_1_store.get(imageKey);

  if (!image) {
    throw { status: 404, message: "Product image not found" };
  }

  const headers = new Headers();
  headers.set("content-type", "image/png");
  headers.set("cache-control", "public, max-age=3600");

  return new Response(image.body, {
    headers,
  });
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
