import { defineStore } from 'pinia';

export const useAnimeStore = defineStore('anime', {
  state: () => ({
    cachedAnime: {}
  }),
  actions: {
    cacheAnime(animeId, data) {
      this.cachedAnime[animeId] = data;
    },
    getCachedAnime(animeId) {
      return this.cachedAnime[animeId] || null;
    }
  }
});