import { chat, getHistory, promotionalNudge } from "./service.js";

export default function registerAiRoutes(router) {
  router.add("POST", "/api/ai/chat", chat);
  router.add("POST", "/api/ai/promotional-nudge", promotionalNudge);
  router.add("GET", "/api/ai/history", getHistory);
}
