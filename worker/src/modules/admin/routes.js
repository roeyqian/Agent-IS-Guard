import { getAiConfig, updateAiConfig, getStats } from "./service.js";

export default function registerAdminRoutes(router) {
  router.add("GET", "/api/admin/ai-config", getAiConfig);
  router.add("PUT", "/api/admin/ai-config", updateAiConfig);
  router.add("GET", "/api/admin/stats", getStats);
}
