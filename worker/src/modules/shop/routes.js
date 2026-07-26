import { getProducts, getProductById, getCategories } from "./service.js";

export default function registerShopRoutes(router) {
  router.add("GET", "/api/products", getProducts);
  router.add("GET", "/api/products/:id", getProductById);
  router.add("GET", "/api/categories", getCategories);
}
