import { createRouter, createWebHistory } from 'vue-router';
import AnimeList from './components/anime/AnimeList.vue';
import AnimePlayer from './components/anime/AnimePlayer.vue';
import Genres from './components/genres/Genres.vue';
import GenreAnimeList from './components/genres/GenreAnimeList.vue';


const routes = [
  { path: '/', component: AnimeList },
  { path: '/anime/:id', component: AnimePlayer },
  { path: '/genres', component: Genres },
  { path: '/genres/:id', component: GenreAnimeList }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;