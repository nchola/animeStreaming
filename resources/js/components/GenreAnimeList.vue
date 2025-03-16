<template>
  <main class="genre-anime-container">
    <!-- Hero Section dengan Efek Netflix-style Overlay -->
    <section class="genre-hero" :style="heroBackgroundStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="genre-title">{{ genreName }}</h1>
        <p class="genre-description">Koleksi anime terbaik dengan genre {{ genreName }} untuk pecinta anime</p>
        <router-link to="/genres" class="back-button">
          <i class="fas fa-chevron-left"></i> Semua Genre
        </router-link>
      </div>
    </section>

    <section class="genre-anime-grid">
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="loading-text">Memuat anime...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="retryFetch" class="retry-button">Coba Lagi</button>
      </div>

      <div v-else>
        <div class="filter-controls">
          <div class="sort-control">
            <label for="sort-select">Urutkan:</label>
            <select id="sort-select" v-model="sortOption" @change="handleSortChange" class="sort-select">
              <option value="popularity">Popularitas</option>
              <option value="score">Rating</option>
              <option value="title">Judul</option>
              <option value="start_date">Tanggal Rilis</option>
            </select>
          </div>
          <div class="pagination-info">
            Menampilkan {{ paginationStart }}-{{ paginationEnd }} dari {{ totalAnime || 'banyak' }} anime
          </div>
        </div>

        <div class="anime-grid">
          <div 
            v-for="(anime, index) in animeList" 
            :key="anime.mal_id" 
            class="genre-anime-card"
            :class="{'top-anime': index < 10}"
            @click="navigateToAnime(anime.mal_id)"
          >
            <div class="card-overlay"></div>
            <div class="anime-poster-container">
              <img 
                v-if="anime.images && anime.images.webp && anime.images.webp.large_image_url"
                :src="anime.images.webp.large_image_url" 
                :alt="anime.title" 
                class="anime-poster"
                loading="lazy"
                @error="handleImageError($event, anime.title)"
              />
              <div v-else class="fallback-poster">
                {{ anime.title.charAt(0) }}
              </div>
            </div>
            
            <!-- Netflix style hover effect -->
            <div class="netflix-hover-effect">
              <div class="quick-info">
                <div class="play-button">
                  <i class="fas fa-play"></i>
                </div>
                <div class="anime-actions">
                  <span class="action-button"><i class="fas fa-plus"></i></span>
                  <span class="action-button"><i class="fas fa-heart"></i></span>
                  <span class="action-button"><i class="fas fa-info-circle"></i></span>
                </div>
              </div>
              
              <div class="hover-anime-details">
                <div class="anime-genres" v-if="anime.genres && anime.genres.length">
                  <span v-for="(genre, idx) in anime.genres.slice(0, 3)" :key="idx">
                    {{ genre.name }}{{ idx < Math.min(anime.genres.length, 3) - 1 ? ' • ' : '' }}
                  </span>
                </div>
                <div class="anime-tags">
                  <span class="hd-tag" v-if="anime.score >= 8">HD</span>
                  <span class="new-tag" v-if="isNewAnime(anime)">NEW</span>
                  <span class="episodes-tag">{{ anime.episodes || '?' }} EP</span>
                </div>
              </div>
            </div>
            
            <div v-if="index < 10" class="rank-badge">{{ index + 1 }}</div>
            
            <div class="anime-info">
              <h3 class="anime-title">{{ anime.title }}</h3>
              <div class="anime-stats">
                <span class="score">
                  <i class="fas fa-star"></i> {{ anime.score ? anime.score.toFixed(1) : 'N/A' }}
                </span>
                <span class="episodes">{{ anime.episodes || '?' }} Eps</span>
              </div>
              <div class="anime-year" v-if="anime.year">
                {{ anime.year }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="pagination-controls" v-if="totalPages > 1">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="page-button"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayPages" 
              :key="page" 
              @click="changePage(page)"
              :class="{'active-page': currentPage === page}"
              class="page-number"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="page-button"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const apiCache = inject('apiCache', { value: new Map() });
    
    const genreName = ref('');
    const animeList = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const totalAnime = ref(0);
    const totalPages = ref(0);
    const currentPage = ref(1);
    const sortOption = ref('popularity');
    const genreId = computed(() => parseInt(route.params.id));
    
    // Set a random hero background from a predefined set based on genre
    const heroBackgrounds = {
      1: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg',     // Action
      2: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',  // Adventure
      4: 'https://cdn.myanimelist.net/images/anime/13/73834.jpg',    // Comedy
      8: 'https://cdn.myanimelist.net/images/anime/1592/115015.jpg', // Drama
      10: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg', // Fantasy
      22: 'https://cdn.myanimelist.net/images/anime/5/19968.jpg',    // Romance
      24: 'https://cdn.myanimelist.net/images/anime/3/79156.jpg',    // Sci-Fi
      36: 'https://cdn.myanimelist.net/images/anime/8/86662.jpg',    // Slice of Life
      // Fallback backgrounds for other genres
      default: [
        'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
        'https://cdn.myanimelist.net/images/anime/5/73574.jpg',
        'https://cdn.myanimelist.net/images/anime/1990/106925.jpg',
        'https://cdn.myanimelist.net/images/anime/1018/139057.jpg'
      ]
    };
    
    const getRandomBackground = () => {
      const fallbacks = heroBackgrounds.default;
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };
    
    const heroBackground = ref(getRandomBackground());
    
    const heroBackgroundStyle = computed(() => ({
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 100%), 
                         url('${heroBackground.value}')`
    }));

    const paginationStart = computed(() => {
      if (animeList.value.length === 0) return 0;
      return (currentPage.value - 1) * 24 + 1;
    });

    const paginationEnd = computed(() => {
      if (animeList.value.length === 0) return 0;
      return Math.min(currentPage.value * 24, totalAnime.value);
    });
    
    // Calculate display pages for pagination
    const displayPages = computed(() => {
      const totalPageCount = totalPages.value;
      const current = currentPage.value;
      const delta = 2; // Number of pages to show before and after current page
      
      if (totalPageCount <= 5) {
        // If we have 5 or fewer pages, show all
        return Array.from({length: totalPageCount}, (_, i) => i + 1);
      }
      
      // Calculate range
      let start = Math.max(current - delta, 1);
      let end = Math.min(current + delta, totalPageCount);
      
      // Adjust if we're at the beginning or end
      if (current <= delta) {
        end = 5;
      } else if (current >= totalPageCount - delta) {
        start = totalPageCount - 4;
      }
      
      return Array.from({length: end - start + 1}, (_, i) => start + i);
    });
    
    // Check if anime is new (released in the last 3 months)
    const isNewAnime = (anime) => {
      if (!anime.aired || !anime.aired.from) return false;
      
      const releaseDate = new Date(anime.aired.from);
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      return releaseDate >= threeMonthsAgo;
    };
    
    // Fetch with rate limiting and caching
    const fetchWithRateLimit = async (url) => {
      const cacheKey = url;
      
      // Check cache first
      if (apiCache.value.has(cacheKey)) {
        const cachedData = apiCache.value.get(cacheKey);
        // Use cache if it's less than 30 minutes old
        if (Date.now() - cachedData.timestamp < 30 * 60 * 1000) {
          return cachedData.data;
        }
      }
      
      // Add rate limiting
      await new Promise(resolve => setTimeout(resolve, 350)); // ~3 requests per second
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          // Wait longer if rate limited
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchWithRateLimit(url); // Retry
        }
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      apiCache.value.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    };
    
    const fetchGenreData = async () => {
      try {
        // Fetch genre name
        const genreResponse = await fetchWithRateLimit('https://api.jikan.moe/v4/genres/anime');
        const genreData = genreResponse.data.find(g => g.mal_id === genreId.value);
        
        if (!genreData) {
          throw new Error('Genre tidak ditemukan');
        }
        
        genreName.value = genreData.name;
        
        // Set hero background based on genre
        if (heroBackgrounds[genreId.value]) {
          heroBackground.value = heroBackgrounds[genreId.value];
        }
        
        return true;
      } catch (err) {
        console.error('Error fetching genre data:', err);
        error.value = 'Gagal memuat data genre';
        return false;
      }
    };
    
    const fetchAnimeList = async () => {
      try {
        const url = `https://api.jikan.moe/v4/anime?genres=${genreId.value}&order_by=${sortOption.value}&sort=desc&page=${currentPage.value}&sfw=true&limit=24`;
        const response = await fetchWithRateLimit(url);
        
        animeList.value = response.data || [];
        totalAnime.value = response.pagination.items.total;
        totalPages.value = response.pagination.last_visible_page;
      } catch (err) {
        console.error('Error fetching anime list:', err);
        error.value = 'Gagal memuat daftar anime. Silakan coba lagi nanti.';
      }
    };
    
    const fetchGenreAnime = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const genreSuccess = await fetchGenreData();
        if (genreSuccess) {
          await fetchAnimeList();
        }
      } catch (err) {
        error.value = 'Gagal memuat konten. Silakan coba lagi nanti.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };
    
    const navigateToAnime = (id) => {
      router.push(`/anime/${id}`);
    };
    
    const handleImageError = (event, title) => {
      event.target.src = generatePlaceholderImage(title);
    };
    
    const generatePlaceholderImage = (title) => {
      // Return a placeholder image URL based on the title
      return `https://via.placeholder.com/225x318/1a1a1a/ffffff?text=${encodeURIComponent(title.charAt(0))}`;
    };
    
    const retryFetch = () => {
      fetchGenreAnime();
    };
    
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      window.scrollTo(0, 0);
      fetchGenreAnime();
    };
    
    const handleSortChange = () => {
      currentPage.value = 1;
      fetchGenreAnime();
    };
    
    // Watch for route changes to refresh data
    watch(() => route.params.id, () => {
      if (route.params.id) {
        currentPage.value = 1;
        fetchGenreAnime();
      }
    });
    
    onMounted(() => {
      fetchGenreAnime();
    });
  
    return {
      genreName,
      animeList,
      loading,
      error,
      totalAnime,
      totalPages,
      currentPage,
      sortOption,
      heroBackgroundStyle,
      paginationStart,
      paginationEnd,
      navigateToAnime,
      retryFetch,
      changePage,
      handleSortChange,
      handleImageError,
      displayPages,
      isNewAnime
    };
  }
};
</script>

<style>
/* Base styles */
.genre-anime-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
  color: #fff;
  padding-bottom: 40px;
}

.genre-hero {
  height: 70vh;
  min-height: 500px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  background-size: cover;
  background-position: center;
  margin-bottom: 2rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.genre-title {
  font-size: 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 900;
}

.genre-description {
  font-size: 1.2rem;
  max-width: 600px;
  color: #ccc;
  margin-bottom: 2rem;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  color: #00ff88;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(8px);
}

.back-button:hover {
  background: rgba(0, 255, 136, 0.1);
  transform: translateY(-2px);
}

.genre-anime-grid {
  flex: 1;
  padding: 1rem 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination-info {
  font-size: 0.9rem;
  color: #aaa;
}

/* Netflix-style card grid */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 36px 24px; /* Increased from 30px 20px (about 20% more space) */
  padding: 1.5rem 0; /* Increased from 1rem */
  box-sizing: border-box;
}

.genre-anime-card {
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #1a1a1a;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transform-origin: center center; /* Change origin to center for better scaling */
  /* Remove margin which can cause spacing issues */
  margin: 0;
}

.genre-anime-card:hover {
  transform: translateY(-10px) scale(1.03); /* Use translateY instead of just scale */
  z-index: 10;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
}

.top-anime {
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.9) 100%);
  z-index: 1;
}

.anime-poster-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.anime-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.genre-anime-card:hover .anime-poster {
  transform: scale(1.1);
}

.fallback-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: #00ff88;
  font-size: 3rem;
  font-weight: bold;
}

.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  background: rgba(255, 215, 0, 0.9); /* More solid gold */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #000;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* Netflix hover effect */
.netflix-hover-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 5;
  opacity: 0;
  transform: translateY(0); /* Change from 20px to 0 */
  transition: all 0.3s ease;
  pointer-events: none;
  box-sizing: border-box;
  /* Limit max height to prevent excessive expansion */
  max-height: 120px;
}

.genre-anime-card:hover .netflix-hover-effect {
  opacity: 1;
  transform: translateY(0);
}

.quick-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #00ff88;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  transition: all 0.2s ease;
}

.genre-anime-card:hover .play-button:hover {
  transform: scale(1.1);
  background: #fff;
}

.anime-actions {
  display: flex;
  gap: 0.8rem;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.hover-anime-details {
  margin-top: 0.8rem;
}

.anime-genres {
  font-size: 0.85rem;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.anime-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.anime-tags span {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
  text-shadow: none;
}

.hd-tag {
  background: #ff0000;
  color: white;
}

.new-tag {
  background: #00ff88;
  color: #000;
}

.episodes-tag {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.anime-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 2;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.anime-title {
  font-size: 1.1rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 600;
}

.anime-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #eee; /* Lighter color for better contrast */
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.anime-year {
  font-size: 0.85rem;
  color: #aaa;
}

.score {
  color: #ffe45e; /* Brighter yellow for better contrast */
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
}

/* Pagination controls */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  gap: 0.5rem;
}

.page-button {
  background: rgba(0, 255, 136, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff88;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: transparent;
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.active-page {
  background: #00ff88;
  color: #000;
  border: none;
}

/* Loading and Error states */
.loading-container,
.error-container {
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  color: #00ff88;
  font-size: 1.2rem;
  margin-top: 1rem;
}

.loader {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 255, 136, 0.1);
  border-top-color: #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  border: none;
  border-radius: 8px;
  color: #0f0f0f;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 30px 20px;
  }
  
  .genre-hero {
    min-height: 400px;
  }
  
  .genre-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .genre-title {
    font-size: 2.5rem;
  }
  
  .genre-description {
    font-size: 1rem;
  }
  
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px 16px;
  }
  
  .genre-anime-card {
    height: 300px;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .page-numbers {
    gap: 0.3rem;
  }
  
  .page-number {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .genre-hero {
    padding: 1rem;
    min-height: 300px;
  }
  
  .genre-title {
    font-size: 2rem;
  }
  
  .genre-description {
    font-size: 0.9rem;
  }
}
</style>