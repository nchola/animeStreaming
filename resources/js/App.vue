<template>
  <div class="app-container">
    <!-- Navigation Bar -->
    <nav class="main-nav">
      <div class="nav-content">
        <!-- Logo -->
        <router-link to="/" class="logo-link">
          <h1 class="logo">AnimeStream</h1>
        </router-link>

        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/genres" class="nav-link">Genres</router-link>
          
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <input v-model="searchQuery" @input="handleSearch" placeholder="Cari anime..." class="search-input" />
          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="anime in searchResults" :key="anime.mal_id" class="search-result-card"
              @click="openAnimeModal(anime)">
              <img :src="anime.images.jpg.image_url" :alt="anime.title" class="search-poster" />
              <div class="search-info">
                <h4>{{ anime.title }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Modern Grid-Based Top Anime Section -->
    <section class="top-anime-showcase">
      <h2 class="section-title">Top 10 Anime Terpopuler</h2>
      
      <div class="anime-grid">
        <div v-for="(anime, index) in topAnime" :key="anime.mal_id" 
             class="anime-grid-item" 
             :class="{ 'featured': index === 0 }"
             @click="openAnimeModal(anime)">
          
          <div class="anime-backdrop" :style="{ backgroundImage: `url(${anime.images.webp.large_image_url})` }">
            <div class="anime-content">
              <div class="anime-rank">#{{ anime.rank }}</div>
              <div class="anime-details">
                <h3 class="grid-anime-title">{{ anime.title_english || anime.title }}</h3>
                <div class="anime-meta">
                  <span class="anime-score">⭐ {{ anime.score }}</span>
                  <span class="anime-year" v-if="anime.year">{{ anime.year }}</span>
                </div>
                <div class="genre-tags">
                  <span v-for="genre in anime.genres.slice(0, 3)" :key="genre.mal_id" class="genre-tag">
                    {{ genre.name }}
                  </span>
                </div>
                <p class="anime-description" v-if="index === 0">{{ truncateText(anime.synopsis, 150) }}</p>
              </div>
              <div class="hover-play">
                <span class="play-icon">▶</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Anime Modal -->
    <div v-if="selectedAnime" class="anime-modal">
      <div class="modal-backdrop" @click="selectedAnime = null"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedAnime.title_english || selectedAnime.title }}</h2>
          <button @click="selectedAnime = null" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="modal-left">
            <img :src="selectedAnime.images.webp.large_image_url" class="modal-poster" />
            <div class="stats-chart">
              <div v-for="(stat, index) in animeStats" :key="index" class="chart-bar"
                :style="{ width: stat.percentage + '%', '--chart-color': `var(--chart-${index + 1})` }">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="stat-value">{{ stat.value }}%</span>
              </div>
            </div>
          </div>

          <div class="modal-right">
            <div class="anime-details">
              <p class="synopsis">{{ selectedAnime.synopsis }}</p>
              <div class="detail-item">
                <span>Episodes:</span>
                <span>{{ selectedAnime.episodes || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span>Status:</span>
                <span>{{ selectedAnime.status }}</span>
              </div>
              <div class="detail-item">
                <span>Rating:</span>
                <span>{{ selectedAnime.rating }}</span>
              </div>
            </div>

            <div class="reviews-section">
              <h3>Top Reviews</h3>
              <div v-for="review in animeReviews" :key="review.mal_id" class="review-card">
                <div class="review-header">
                  <img :src="review.user.images.jpg.image_url" class="user-avatar" />
                  <div class="user-info">
                    <span class="username">{{ review.user.username }}</span>
                    <div class="review-score">⭐ {{ review.score }}</div>
                  </div>
                </div>
                <p class="review-text">{{ truncateText(review.review, 150) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Router View -->
    <router-view></router-view>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="footer-content">
        <p>&copy; 2024 AnimeStream. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const topAnime = ref([]);
    const selectedAnime = ref(null);
    const animeStats = ref([]);
    const animeReviews = ref([]);

    // Fungsi untuk mencari anime
    const searchAnime = async (query) => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}`);
        return response.data.data;
      } catch (error) {
        console.error("Error searching anime:", error);
        throw new Error("Gagal mencari anime. Silakan coba lagi.");
      }
    };

    // Fetch top anime
    const fetchTopAnime = async () => {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10');
        topAnime.value = response.data.data;
      } catch (error) {
        console.error('Error fetching top anime:', error);
      }
    };

    // Fetch anime statistics
    const fetchAnimeStats = async (id) => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/statistics`);
        const stats = response.data.data;
        return [
          { label: 'Completed', value: stats.completed, percentage: (stats.completed / stats.total * 100).toFixed(1) },
          { label: 'Watching', value: stats.watching, percentage: (stats.watching / stats.total * 100).toFixed(1) },
          { label: 'Plan to Watch', value: stats.plan_to_watch, percentage: (stats.plan_to_watch / stats.total * 100).toFixed(1) },
          { label: 'Dropped', value: stats.dropped, percentage: (stats.dropped / stats.total * 100).toFixed(1) },
          { label: 'On Hold', value: stats.on_hold, percentage: (stats.on_hold / stats.total * 100).toFixed(1) }
        ];
      } catch (error) {
        console.error('Error fetching stats:', error);
        return [];
      }
    };

    // Fetch anime reviews
    const fetchAnimeReviews = async (id) => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/reviews`);
        return response.data.data.slice(0, 3);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
    };

    // Handle input pencarian
    const handleSearch = async () => {
      if (searchQuery.value.length > 2) {
        try {
          const results = await searchAnime(searchQuery.value);
          searchResults.value = results;
        } catch (error) {
          console.error(error);
        }
      } else {
        searchResults.value = [];
      }
    };

    const openAnimeModal = async (anime) => {
      selectedAnime.value = anime;
      animeStats.value = await fetchAnimeStats(anime.mal_id);
      animeReviews.value = await fetchAnimeReviews(anime.mal_id);
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    onMounted(() => {
      fetchTopAnime();
    });

    return {
      searchQuery,
      searchResults,
      handleSearch,
      topAnime,
      selectedAnime,
      animeStats,
      animeReviews,
      openAnimeModal,
      truncateText
    };
  },
};
</script>

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

:root {
  --primary: #00ff88;
  --secondary: #00b4d8;
  --background: #0f0f0f;
  --surface: #1a1a1a;
  --surface-light: #2a2a2a;
  --text: #ffffff;
  --text-secondary: #cccccc;
  --chart-1: 120, 100%, 50%;
  --chart-2: 200, 100%, 50%;
  --chart-3: 280, 100%, 50%;
  --chart-4: 350, 100%, 50%;
  --chart-5: 40, 100%, 50%;
}

body {
  background: var(--background);
  color: var(--text);
}

/* App Container */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation Bar */
.main-nav {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

/* Logo */
.logo-link {
  text-decoration: none;
  cursor: pointer;
}

.logo {
  font-size: 1.8rem;
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: auto;
  margin-right: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-exact-active {
  color: var(--primary);
}

/* Search Container */
.search-container {
  position: relative;
  width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
}

/* Search Results */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface);
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.search-result-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-result-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.search-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.search-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.search-info p {
  font-size: 0.9rem;
  color: #888;
}

/* Modern Grid-Based Top Anime Section */
.top-anime-showcase {
  padding: 2rem 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.section-title {
  padding-left: 1.5rem;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--text);
  font-weight: 600;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 220px;
  gap: 1rem;
  padding: 0 1.5rem;
}

/* Make the first item larger (featured) */
.anime-grid-item.featured {
  grid-column: span 2;
  grid-row: span 2;
}

@media (max-width: 768px) {
  .anime-grid-item.featured {
    grid-column: 1 / -1;
    grid-row: span 1;
  }
  
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-rows: 180px;
  }
}

.anime-grid-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.anime-grid-item:hover {
  transform: scale(1.05);
  z-index: 5;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
}

.anime-backdrop {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.anime-backdrop::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.6) 70%,
    rgba(0, 0, 0, 0.9) 100%
  );
  transition: background 0.3s ease;
}

.anime-grid-item:hover .anime-backdrop::after {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 70%,
    rgba(0, 0, 0, 0.9) 100%
  );
}

.anime-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
}

.anime-rank {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  color: black;
  font-weight: bold;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.grid-anime-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.anime-grid-item.featured .grid-anime-title {
  font-size: 1.8rem;
}

.anime-meta {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.anime-score {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  color: #FFD700;
}

.anime-year {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.genre-tag {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  backdrop-filter: blur(5px);
}

.anime-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  display: none;
}

.anime-grid-item.featured .anime-description {
  display: block;
}

.hover-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background 0.3s ease;
  opacity: 0;
  z-index: 3;
}

.play-icon {
  font-size: 1.5rem;
  color: white;
}

.anime-grid-item:hover .hover-play {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  background: linear-gradient(45deg, var(--primary), var(--secondary));
}

/* Modal Styles */
.anime-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-backdrop {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  background: var(--surface);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--surface-light);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}

.modal-body {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }
}

.modal-left {
  flex: 1;
  max-width: 300px;
}

@media (max-width: 768px) {
  .modal-left {
    max-width: 100%;
  }
}

.modal-poster {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.stats-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-bar {
  background: linear-gradient(90deg, hsl(var(--chart-color)) 0%, hsl(var(--chart-color)/0.7) 100%);
  padding: 0.75rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  color: white;
}

.modal-right {
  flex: 2;
}

.anime-details {
  margin-bottom: 2rem;
}

.synopsis {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.reviews-section {
  background: var(--surface-light);
  padding: 1.5rem;
  border-radius: 8px;
}

.reviews-section h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.review-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.2s ease;
}

.review-card:hover {
  transform: translateY(-3px);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
}

.review-score {
  background: rgba(255, 215, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  color: #FFD700;
}

.review-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Footer */
.main-footer {
  margin-top: auto;
  background: var(--surface);
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #888;
}

/* For better grid responsiveness */
@media (max-width: 1200px) {
  .anime-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .anime-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .anime-grid {
    grid-template-columns: 1fr;
  }
  
  .anime-grid-item.featured {
    grid-column: 1;
    grid-row: span 1;
  }
  
  .search-container {
    width: 100%;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    margin: 0;
  }
}
</style>