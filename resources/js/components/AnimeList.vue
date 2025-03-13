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
          <div class="view-more">Lihat Semua</div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <div class="loader"></div>
        </div>
  
        <div v-else class="anime-grid">
          <div 
            v-for="anime in animeList" 
            :key="anime.mal_id" 
            class="anime-card"
            @click="openAnimeModal(anime)"
          >
            <div class="card-overlay"></div>
            <img 
              :src="anime.images.jpg.large_image_url" 
              :alt="anime.title" 
              class="anime-poster"
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
  
        <div class="pagination">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="changePage(page)"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
      </section>
  
      <AnimeModal 
        v-if="selectedAnime" 
        :anime="selectedAnime" 
        @close="selectedAnime = null"
      />
    </main>
  </template>
  
  <script>
  import axios from 'axios';
  import AnimeModal from './AnimeModal.vue';
  
  export default {
    components: {
      AnimeModal
    },
    data() {
      return {
        animeList: [],
        loading: true,
        currentPage: 1,
        totalPages: 5,
        selectedAnime: null
      };
    },
    async created() {
      await this.fetchTopAnime();
    },
    methods: {
      async fetchTopAnime() {
        try {
          const response = await axios.get(`https://api.jikan.moe/v4/top/anime?page=${this.currentPage}`);
          this.animeList = response.data.data;
        } catch (error) {
          console.error("Error:", error);
        } finally {
          this.loading = false;
        }
      },
      changePage(page) {
        this.currentPage = page;
        this.fetchTopAnime();
      },
      openAnimeModal(anime) {
        this.selectedAnime = anime;
      }
    }
  };
  </script>
  
  <style scoped>
  .anime-list-container {
    min-height: 100vh;
  }
  
  .hero-section {
    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
    border-radius: 16px;
    margin: 2rem 0;
    padding: 4rem 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #00ff88, #00b4d8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .hero-subtitle {
    color: #888;
    font-size: 1.2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0;
    padding: 0 1rem;
  }
  
  .section-header h3 {
    font-size: 1.5rem;
  }
  
  .view-more {
    color: #00ff88;
    cursor: pointer;
    transition: opacity 0.3s;
  }
  
  .view-more:hover {
    opacity: 0.8;
  }
  
  .anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: repeat(5, 1fr); /* 5 baris */
  gap: 2rem;
  padding: 0 1rem;
  max-height: 80vh; /* Tinggi maksimal */
  overflow-y: auto; /* Scroll vertikal */
}
  .anime-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  
  .anime-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
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
    height: 340px;
    object-fit: cover;
    border-radius: 12px;
  }
  
  .anime-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    z-index: 1;
  }
  
  .anime-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .anime-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
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
    gap: 0.5rem;
    margin: 3rem 0;
  }
  
  .pagination button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .pagination button.active {
    background: linear-gradient(45deg, #00ff88, #00b4d8);
    color: #000;
  }
  
  .loading-container {
    height: 400px;
    display: grid;
    place-items: center;
  }
  
  .loader {
    width: 48px;
    height: 48px;
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
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-bottom-color: #00ff88;
  }
  
  @keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>