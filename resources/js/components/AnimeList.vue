<template>
  <main class="anime-list-container">

    <!-- Trending Section with Slider -->
    <section class="trending-section">
      <div class="section-header">
        <h3>Trending Now</h3>
        <div class="view-more" @click="loadAllAnime">Lihat Semua</div>
      </div>

      <div v-if="trendingLoading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="trendingError" class="error-container">
        <p>{{ trendingError }}</p>
        <button @click="fetchTrendingAnime" class="retry-button">Coba Lagi</button>
      </div>

      <swiper v-else :modules="modules" :slides-per-view="'auto'" :space-between="20" :navigation="true"
        :breakpoints="trendingBreakpoints" class="trending-slider">
        <swiper-slide v-for="anime in trendingAnime" :key="anime.mal_id">
          <div class="trending-card" @click="openAnimeModal(anime)">
            <img :src="anime.images.webp.large_image_url" :alt="anime.title" class="trending-poster" loading="lazy" />
            <div class="trending-info">
              <h4 class="anime-title">{{ anime.title }}</h4>
              <div class="anime-meta">
                <span class="rating">
                  <i class="fas fa-star"></i> {{ anime.score || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </section>

    <!-- Schedule Section -->
    <section class="schedule-section">
      <div class="section-header">
        <h3>Jadwal Tayang Hari Ini</h3>
      </div>

      <div v-if="scheduleLoading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="scheduleError" class="error-container">
        <p>{{ scheduleError }}</p>
        <button @click="fetchSchedule" class="retry-button">Coba Lagi</button>
      </div>

      <swiper v-else :modules="modules" :slides-per-view="'auto'" :space-between="20" :navigation="true"
        :breakpoints="scheduleBreakpoints" class="schedule-slider">
        <swiper-slide v-for="item in scheduleData" :key="item.mal_id">
          <div class="schedule-card">
            <div class="time-slot">{{ item.broadcast.time || '00:00' }}</div>
            <img :src="item.images.webp.large_image_url" :alt="item.title" class="schedule-poster" />
            <div class="schedule-info">
              <h4>{{ item.title }}</h4>
              <p class="broadcast-info">
                {{ item.broadcast?.day || 'Belum Ada Jadwal Tayang' }} •
                {{ item.broadcast?.time || 'x' }}
              </p>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </section>

    <!-- Anime Grid Section -->
    <section class="anime-grid-section">
      <div class="section-header">
        <h3>Semua Anime</h3>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchTopAnime" class="retry-button">Coba Lagi</button>
      </div>

      <div v-else class="anime-grid">
        <div v-for="(anime, index) in uniqueAnimeList" :key="`anime-${anime.mal_id}-${index}`" class="anime-card"
          @click="openAnimeModal(anime)">
          <div class="card-overlay"></div>
          <img :src="anime.images.jpg.large_image_url" :alt="anime.title" class="anime-poster" loading="lazy" />
          <div class="anime-info">
            <h4 class="anime-title">{{ anime.title }}</h4>
            <div class="anime-meta">
              <span class="rating">
                <i class="fas fa-star"></i> {{ anime.score || 'N/A' }}
              </span>
              <span class="episodes">{{ anime.episodes || '24' }} Episode</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && uniqueAnimeList.length > 0" class="pagination">
        <button v-for="page in totalPages" :key="`page-${page}`" @click="changePage(page)"
          :class="{ active: currentPage === page }" :disabled="loading">
          {{ page }}
        </button>
      </div>
    </section>

    <!-- Anime Modal -->
    <AnimeModal v-if="selectedAnime" :anime="selectedAnime" @close="closeAnimeModal" />
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import AnimeModal from './AnimeModal.vue';

export default {
  components: {
    Swiper,
    SwiperSlide,
    AnimeModal
  },
  setup() {
    const modules = ref([Navigation]);
    const animeList = ref([]);
    const trendingAnime = ref([]);
    const scheduleData = ref([]);
    const loading = ref(true);
    const trendingLoading = ref(true);
    const scheduleLoading = ref(true);
    const error = ref(null);
    const trendingError = ref(null);
    const scheduleError = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(5);
    const selectedAnime = ref(null);

    // Fetch Trending Anime
    const fetchTrendingAnime = async () => {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=5');
        trendingAnime.value = response.data.data;
      } catch (err) {
        trendingError.value = "Gagal memuat anime trending";
      } finally {
        trendingLoading.value = false;
      }
    };

    // Fetch Schedule
    const fetchSchedule = async () => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/schedules');
    scheduleData.value = response.data.data; // Simpan data jadwal
  } catch (err) {
    scheduleError.value = "Gagal memuat jadwal tayang";
  } finally {
    scheduleLoading.value = false;
  }
};

    // Fetch All Anime
    const fetchTopAnime = async () => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/top/anime?page=${currentPage.value}`);
        animeList.value = response.data.data;
      } catch (err) {
        error.value = "Gagal memuat data anime";
      } finally {
        loading.value = false;
      }
    };

    // Open Anime Modal
    const openAnimeModal = (anime) => {
      selectedAnime.value = anime;
    };

    // Close Anime Modal
    const closeAnimeModal = () => {
      selectedAnime.value = null;
    };

    // Change Page
    const changePage = (page) => {
      currentPage.value = page;
      fetchTopAnime();
    };

    onMounted(() => {
      fetchTrendingAnime();
      fetchSchedule();
      fetchTopAnime();
    });

    return {
      modules,
      animeList,
      trendingAnime,
      scheduleData,
      loading,
      trendingLoading,
      scheduleLoading,
      error,
      trendingError,
      scheduleError,
      currentPage,
      totalPages,
      selectedAnime,
      fetchTrendingAnime,
      fetchSchedule,
      fetchTopAnime,
      openAnimeModal,
      closeAnimeModal,
      changePage,
      uniqueAnimeList: computed(() => {
        const seenIds = new Map();
        return animeList.value.filter(anime => {
          if (seenIds.has(anime.mal_id)) return false;
          seenIds.set(anime.mal_id, true);
          return true;
        });
      }),
      trendingBreakpoints: {
        320: { slidesPerView: 1.2 },
        480: { slidesPerView: 2.2 },
        768: { slidesPerView: 3.2 },
        1024: { slidesPerView: 4.2 },
        1280: { slidesPerView: 5.2 }
      },
      scheduleBreakpoints: {
        320: { slidesPerView: 1.2 },
        480: { slidesPerView: 2.3 },
        768: { slidesPerView: 3.3 },
        1024: { slidesPerView: 4.3 },
        1280: { slidesPerView: 5.3 }
      }
    };
  }
};
</script>

<style scoped>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #141414;
  color: #fff;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)),
    url('https://via.placeholder.com/1920x600') no-repeat center center/cover;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(45deg, #e50914, #f40612);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #e5e5e5;
}

/* Trending Section */
.trending-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
}

.view-more {
  color: #e50914;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.view-more:hover {
  opacity: 0.8;
}

.trending-slider {
  padding: 0 2rem;
}

.trending-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 16/9;
}

.trending-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.trending-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trending-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 10%, transparent 100%);
}

.anime-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.anime-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #e5e5e5;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #ffd700;
}

/* Schedule Section */
.schedule-section {
  padding: 2rem;
}

.schedule-slider {
  padding: 0 2rem;
}

.schedule-card {
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.schedule-card:hover {
  transform: translateY(-5px);
}

.time-slot {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(229, 9, 20, 0.9);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.schedule-poster {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.schedule-info {
  padding: 1rem;
}

.schedule-info h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.broadcast-info {
  color: #888;
  font-size: 0.9rem;
}

/* Anime Grid Section */
.anime-grid-section {
  padding: 2rem;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.anime-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 2/3;
}

.anime-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.anime-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.anime-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 10%, transparent 100%);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: #2a2a2a;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s ease;
}

.pagination button.active {
  background: #e50914;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.error-container {
  flex-direction: column;
  gap: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #e50914;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.retry-button:hover {
  opacity: 0.8;
}

.loader {
  border: 4px solid #e50914;
  border-top: 4px solid transparent;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Swiper Navigation Customization */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #e50914 !important;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 1.2rem !important;
}
</style>