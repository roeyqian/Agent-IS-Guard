import { trackBehavior, getSummary } from "./service.js";

export default function registerResearchRoutes(router) {
  router.add("POST", "/api/research/track", trackBehavior);
  router.add("GET", "/api/research/summary", getSummary);
}
