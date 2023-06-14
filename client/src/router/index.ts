import { createRouter, createWebHistory } from "vue-router";
// import GameView from "@/views/GameView.vue";
import HomeView from "@/views/HomeView.vue";
import RoomView from "@/views/RoomView.vue";
import LoginView from "@/views/LoginView.vue";
import AiGameView from "@/views/AiGameView.vue";
import RulesView from "@/views/RulesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/ai-game",
      name: "ai",
      component: AiGameView,
    },
    {
      path: "/login/:roomToJoin",
      name: "login",
      component: LoginView,
      props: true,
    },
    {
      path: "/room/:roomId",
      name: "room",
      component: RoomView,
      props: true,
    },
    {
      path: "/rules",
      name: "rules",
      component: RulesView,
    },
  ],
});

export default router;
