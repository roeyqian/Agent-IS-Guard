import { getAiConfig, updateAiConfig, getStats, getOrders, getOrderDetail, updateOrderStatus } from "./service.js";

export default function registerAdminRoutes(router) {
  router.add("GET", "/api/admin/ai-config", getAiConfig);
  router.add("PUT", "/api/admin/ai-config", updateAiConfig);
  router.add("GET", "/api/admin/stats", getStats);
  router.add("GET", "/api/admin/orders", getOrders);
  router.add("GET", "/api/admin/orders/:id", getOrderDetail);
  router.add("PUT", "/api/admin/orders/:id/status", updateOrderStatus);
}
