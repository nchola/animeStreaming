<template>
  <main class="anime-list-container">
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">Selamat Datang di AnimeStream</h2>
        <p class="hero-subtitle">Temukan ribuan anime terbaik dalam satu platform</p>
      </div>
    </section>

    <section class="trending-section">
      <div class="section-header">
        <h3>Trending Now</h3>
        <div class="view-more" @click="loadAllAnime">Lihat Semua</div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchTopAnime" class="retry-button">Coba Lagi</button>
      </div>

      <div v-else class="anime-grid">
        <div 
          v-for="(anime, index) in uniqueAnimeList" 
          :key="`anime-${anime.mal_id}-${index}`" 
          class="anime-card"
          @click="openAnimeModal(anime)"
        >
          <div class="card-overlay"></div>
          <img 
            :src="anime.images.jpg.large_image_url" 
            :alt="anime.title" 
            class="anime-poster"
            loading="lazy"
          />
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

      <div v-if="!loading && uniqueAnimeList.length > 0" class="pagination">
        <button 
          v-for="page in totalPages" 
          :key="`page-${page}`" 
          @click="changePage(page)"
          :class="{ active: currentPage === page }"
          :disabled="loading"
        >
          {{ page }}
        </button>
      </div>
    </section>

    <AnimeModal 
      v-if="selectedAnime" 
      :anime="selectedAnime" 
      @close="closeAnimeModal"
    />
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AnimeModal from './AnimeModal.vue'; // Import AnimeModal

export default {
  components: {
    AnimeModal, // Register AnimeModal
  },
  setup() {
    const animeList = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(5);
    const selectedAnime = ref(null);
    const requestDelay = 4000; // Delay untuk menghindari rate limiting
    const lastRequestTime = ref(0);
    const abortController = ref(null);

    // Computed property untuk menghapus duplikat anime
    const uniqueAnimeList = computed(() => {
      const seenIds = new Map();
      return animeList.value.filter(anime => {
        if (seenIds.has(anime.mal_id)) {
          return false;
        }
        seenIds.set(anime.mal_id, true);
        return true;
      });
    });

    // Fungsi untuk mengambil data anime
    const fetchTopAnime = async (itemsPerPage = null) => {
      if (abortController.value) {
        abortController.value.abort(); // Batalkan request sebelumnya
      }

      abortController.value = new AbortController();
      loading.value = true;
      error.value = null;

      try {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.value;

        if (timeSinceLastRequest < requestDelay) {
          await new Promise(resolve => setTimeout(resolve, requestDelay - timeSinceLastRequest));
        }

        const limit = itemsPerPage || calculateItemsPerPage();

        console.log("Fetching anime data..."); // Log sebelum request
        const response = await axios.get(`https://api.jikan.moe/v4/top/anime?page=${currentPage.value}&limit=${limit}`, {
          signal: abortController.value.signal,
        });

        console.log("API Response:", response.data); // Log response
        animeList.value = response.data.data || [];
        lastRequestTime.value = Date.now();

        if (response.data.pagination) {
          totalPages.value = Math.min(response.data.pagination.last_visible_page, 5);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching anime:", err); // Log error
          error.value = "Gagal memuat data anime. Silakan coba lagi nanti.";
        }
      } finally {
        loading.value = false;
      }
    };

    // Fungsi untuk mengubah halaman
    const changePage = async (page) => {
      if (loading.value || page === currentPage.value) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });
      currentPage.value = page;
      await fetchTopAnime();
    };

    // Fungsi untuk membuka modal anime
    const openAnimeModal = (anime) => {
      selectedAnime.value = { ...anime };
      document.body.classList.add('modal-open');
    };

    // Fungsi untuk menutup modal anime
    const closeAnimeModal = () => {
      selectedAnime.value = null;
      document.body.classList.remove('modal-open');
    };

    // Fungsi untuk menghitung jumlah item per halaman
    const calculateItemsPerPage = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let columns = 2; // Default untuk layar terkecil
      if (width > 2000) columns = 8;
      else if (width > 1400) columns = 6;
      else if (width > 991) columns = 5;
      else if (width > 576) columns = 4;
      else if (width > 375) columns = 3;

      const cardHeight = width > 576 ? 300 : 250;
      const availableHeight = height - 300; // Kurangi tinggi header dan pagination
      const rows = Math.max(2, Math.floor(availableHeight / cardHeight));

      return columns * (rows + 1);
    };

    // Panggil fetchTopAnime saat komponen dimount
    onMounted(() => {
      console.log("AnimeList component mounted");
      const initialItemsPerPage = calculateItemsPerPage();
      fetchTopAnime(initialItemsPerPage);
    });

    return {
      animeList,
      loading,
      error,
      currentPage,
      totalPages,
      uniqueAnimeList,
      selectedAnime,
      fetchTopAnime,
      changePage,
      openAnimeModal,
      closeAnimeModal,
    };
  },
};
</script>

<style scoped>
/* Tambahkan gaya CSS Anda di sini */
</style>

<style scoped>
/* Reset to ensure full-screen works properly */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

.anime-list-container {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #0f0f0f;
}

.hero-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  padding: 3rem 1rem;
  text-align: center;
  width: 100%;
  margin: 0 0 1rem 0;
}

.hero-title {
  font-size: min(4vw, 2.5rem);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  color: #888;
  font-size: min(2.5vw, 1.2rem);
}

.trending-section {
  width: 100%;
  padding: 0 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  width: 100%;
}

.section-header h3 {
  font-size: min(3vw, 1.5rem);
}

.view-more {
  color: #00ff88;
  cursor: pointer;
  transition: opacity 0.3s;
  font-size: min(2.5vw, 1rem);
}

.view-more:hover {
  opacity: 0.8;
}

/* Full-screen responsive grid */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: clamp(0.5rem, 2vw, 2rem);
  width: 100%;
  min-height: calc(100vh - 300px); /* Adjust based on header and pagination height */
  padding-bottom: 1rem;
}

.anime-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  aspect-ratio: 2/3; /* Maintain poster aspect ratio */
  height: auto;
  width: 100%;
}

.anime-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.9) 100%);
}

.anime-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.anime-poster[loading="lazy"] {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.anime-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: clamp(0.5rem, 1.5vw, 1.5rem);
  z-index: 1;
}

.anime-title {
  font-size: clamp(0.8rem, 1.2vw, 1.1rem);
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.anime-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(0.7rem, 1vw, 0.9rem);
  color: #ccc;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #ffd700;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(0.3rem, 1vw, 0.5rem);
  margin: 2rem 0;
  width: 100%;
}

.pagination button {
  padding: clamp(0.3rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.8rem, 1vw, 1rem);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button.active {
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  color: #000;
}

.loading-container, .error-container {
  height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.error-container {
  color: #ff5252;
  text-align: center;
  padding: 2rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.loader {
  width: clamp(32px, 8vw, 48px);
  height: clamp(32px, 8vw, 48px);
  border: 3px solid #FFF;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: clamp(36px, 9vw, 56px);
  height: clamp(36px, 9vw, 56px);
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: #00ff88;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global class for modal open state */
:global(.modal-open) {
  overflow: hidden;
}

/* Media Queries for Different Devices */
/* Large Screens */
@media (min-width: 1400px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Medium Screens (Tablets) */
@media (max-width: 991px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
}

/* Small Screens (Mobile) */
@media (max-width: 576px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  .hero-section {
    padding: 2rem 1rem;
  }
  
  .pagination {
    margin: 1.5rem 0;
  }
  
  .anime-info {
    padding: 0.75rem;
  }
}

/* Extremely Small Screens */
@media (max-width: 375px) {
  .anime-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination button {
    padding: 0.3rem 0.5rem;
  }
}

/* Landscape Mode on Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .hero-section {
    padding: 1rem;
  }
  
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    min-height: calc(100vh - 200px);
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
}

/* High-DPI Screens (Retina Displays) */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .anime-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }
  
  .anime-title {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .anime-list-container {
    background-color: #0f0f0f;
  }
}

/* Support for Reduced Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  .anime-card,
  .anime-card:hover,
  .anime-poster,
  .retry-button:hover,
  .pagination button {
    transition: none;
  }
  
  .anime-card:hover {
    transform: none;
  }
  
  .loader {
    animation: none;
    border: 3px solid #00ff88;
  }
}

/* Print Styles */
@media print {
  .anime-grid {
    display: block;
  }
  
  .anime-card {
    break-inside: avoid;
    page-break-inside: avoid;
    display: inline-block;
    width: 25%;
    margin: 0 0 1rem 0;
  }
  
  .pagination,
  .hero-section,
  .view-more {
    display: none;
  }
}

/* iPad & Tablet Specific */
@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

/* Fix for older Safari versions */
@supports (-webkit-overflow-scrolling: touch) {
  .anime-poster {
    -webkit-transform: translateZ(0);
  }
}

/* Support for ultra-wide screens */
@media (min-width: 2000px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    max-width: 2400px;
    margin: 0 auto;
  }
}
</style>