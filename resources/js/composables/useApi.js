// animeStreaming/resources/js/composables/useApi.js
import axios from 'axios';
import { useAnimeStore } from '@/stores/anime';

export const useApi = () => {
  const api = axios.create({
    baseURL: 'https://api.jikan.moe/v4',
    timeout: 10000
  });

  const fetch = async ({ url, cacheKey, ttl = 300 }) => {
    const store = useAnimeStore();
    
    if (store.getCache(cacheKey)) {
      return store.getCache(cacheKey);
    }

    try {
      const response = await api.get(url);
      store.cacheResponse(cacheKey, response, ttl);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  const handleApiError = (error) => {
    const message = error.response?.status === 429 
      ? 'API rate limit exceeded. Please try again later.'
      : error.message;
    
    throw new Error(message);
  };

  return { fetch };
};

// animeStreaming/resources/js/stores/anime.js
import { defineStore } from 'pinia';

export const useAnimeStore = defineStore('anime', {
  state: () => ({
    animes: [],
    cache: new Map(),
    lastUpdated: null
  }),
  actions: {
    setAnimes(data) {
      this.animes = data;
      this.lastUpdated = Date.now();
    },
    cacheResponse(key, data, ttl) {
      this.cache.set(key, {
        data,
        expires: Date.now() + ttl * 1000
      });
    },
    getCache(key) {
      const item = this.cache.get(key);
      return item && item.expires > Date.now() ? item.data : null;
    }
  }
});