// animeStreaming/resources/js/composables/useBodyLock.js
export const useBodyLock = (shouldLock) => {
    if (process.client) {
      document.body.style.overflow = shouldLock ? 'hidden' : '';
      document.body.style.paddingRight = shouldLock ? '15px' : '';
    }
  };
  
  // animeStreaming/resources/js/composables/usePagination.js
  export const usePagination = (totalPages, currentPage) => {
    const shouldShowPagination = computed(() => 
      totalPages.value > 1 && !isNaN(totalPages.value)
    );
  
    return { shouldShowPagination };
  };