// animeStreaming/resources/js/composables/useAnime.js
import { ref, computed } from 'vue';
import { useApi } from './useApi';
import { useAnimeStore } from '@/stores/anime';

export const useAnime = () => {
  const store = useAnimeStore();
  const { fetch } = useApi();
  
  const isLoading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(5);
  
  const fetchData = async (page = 1) => {
    try {
      isLoading.value = true;
      currentPage.value = page;
      
      const { data } = await fetch({
        url: `/top/anime?page=${page}`,
        cacheKey: `top-anime-${page}`,
        ttl: 3600
      });
      
      store.setAnimes(data.data);
      totalPages.value = Math.min(data.pagination?.last_visible_page || 5, 5);
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    animes: computed(() => store.animes),
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchData
  };
};