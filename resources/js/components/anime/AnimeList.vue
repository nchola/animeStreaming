<!-- animeStreaming/resources/js/components/anime/AnimeList.vue -->
<template>
  <main class="anime-list-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">{{ $t('welcome') }}</h2>
        <p class="hero-subtitle">{{ $t('discover_anime') }}</p>
      </div>
    </section>

    <!-- Trending Section -->
    <section class="trending-section">
      <SectionHeader
        :title="$t('trending_now')"
        :action-text="$t('view_all')"
        @action="handleViewAll"
      />

      <LoadingState v-if="isLoading" />
      <ErrorState v-else-if="error" :error="error" @retry="fetchData" />
      
      <AnimeGrid v-else :animes="filteredAnimes" @select="openModal" />

      <PaginationControls
        v-if="shouldShowPagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="changePage"
      />

      <AnimeModal 
        v-if="selectedAnime" 
        :anime="selectedAnime" 
        @close="closeModal"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAnimeStore } from '@/stores/anime';
import { usePagination } from '@/composables/usePagination';
import { useAnime } from '@/composables/useAnime';

// Components
import SectionHeader from '@/components/ui/SectionHeader.vue';
import AnimeGrid from '@/components/anime/AnimeGrid.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import ErrorState from '@/components/ui/ErrorState.vue';
import PaginationControls from '@/components/ui/PaginationControls.vue';
import AnimeModal from '@/components/anime/AnimeModal.vue';

const { 
  animes,
  isLoading,
  error,
  currentPage,
  totalPages,
  fetchData
} = useAnime();

const { filteredAnimes } = useAnimeFilters(animes);
const { shouldShowPagination } = usePagination(totalPages, currentPage);

const selectedAnime = ref(null);

const openModal = (anime) => {
  selectedAnime.value = anime;
  useBodyLock(true);
};

const closeModal = () => {
  selectedAnime.value = null;
  useBodyLock(false);
};

onMounted(() => {
  fetchData();
});
</script>