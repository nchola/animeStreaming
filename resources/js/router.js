import { createRouter, createWebHistory } from 'vue-router';
import AnimeList from './components/AnimeList.vue';
import AnimePlayer from './components/AnimePlayer.vue';
import Genres from './components/Genres.vue';
import GenreAnimeList from './components/GenreAnimeList.vue';


const routes = [
  { path: '/', component: AnimeList },
  { path: '/anime/:id', component: AnimePlayer },
  { path: '/genres', component: Genres },
  { path: '/genres/:id', component: GenreAnimeList }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});


export default router;