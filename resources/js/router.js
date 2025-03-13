import { createRouter, createWebHistory } from 'vue-router';
import AnimeList from './components/AnimeList.vue';
import AnimePlayer from './components/AnimePlayer.vue';

const routes = [
  { path: '/', component: AnimeList },
  { path: '/anime/:id', component: AnimePlayer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;