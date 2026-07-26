import { trackBehavior } from "./service.js";

export default function registerResearchRoutes(router) {
  router.add("POST", "/api/research/track", trackBehavior);
}
