<template>
  <main class="genre-anime-container">
    <section class="genre-hero" :style="heroStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="genre-title">{{ genreName }}</h1>
        <router-link to="/genres" class="back-button">
          <i class="fas fa-chevron-left"></i> All Genres
        </router-link>
      </div>
    </section>

    <section class="genre-anime-grid">
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchGenreAnime" class="retry-button">Retry</button>
      </div>

      <div v-else class="anime-grid">
        <div v-for="anime in animeList" :key="anime.mal_id" class="genre-anime-card"
          @click="navigateToAnime(anime.mal_id)">
          <div class="card-overlay"></div>
          <img :src="anime.images.webp.large_image_url" :alt="anime.title" class="anime-poster" loading="lazy" />
          <div class="anime-info">
            <h3 class="anime-title">{{ anime.title }}</h3>
            <div class="anime-stats">
              <span class="score"><i class="fas fa-star"></i> {{ anime.score || 'N/A' }}</span>
              <span class="episodes">{{ anime.episodes || '?' }} Episodes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const genreName = ref('');
    const animeList = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const heroStyle = computed(() => ({
      backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%), 
                         url('https://source.unsplash.com/random/1920x1080/?anime,${genreName.value}')`
    }));

    // GenreAnimeList.vue - Update fetchGenreAnime method
    const fetchGenreAnime = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Fetch genre name
        const genreResponse = await axios.get('https://api.jikan.moe/v4/genres/anime');
        const genreData = genreResponse.data.data.find(g => g.mal_id === parseInt(route.params.id));

        if (!genreData) {
          throw new Error('Genre not found');
        }

        genreName.value = genreData.name;

        // Fetch anime by genre
        const animeResponse = await axios.get(
          `https://api.jikan.moe/v4/anime?genres=${route.params.id}&order_by=popularity&sfw`
        );

        animeList.value = animeResponse.data.data || [];
      } catch (err) {
        error.value = 'Gagal memuat konten genre';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const navigateToAnime = (id) => {
      router.push(`/anime/${id}`);
    };

    onMounted(() => {
      fetchGenreAnime();
    });

    return {
      genreName,
      animeList,
      loading,
      error,
      heroStyle,
      fetchGenreAnime,
      navigateToAnime
    };
  }
};
</script>

<style scoped>
.genre-anime-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
}

.genre-hero {
  height: 50vh;
  min-height: 400px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.genre-title {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.genre-anime-card {
  height: 380px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: #1a1a1a;
  transition: all 0.3s ease;
  cursor: pointer;
}

.genre-anime-card:hover {
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.3);
  transform: translateY(-5px);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.9) 100%);
}

.anime-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 2;
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
}

.anime-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #ccc;
}

.score {
  color: #ffd700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .genre-title {
    font-size: 2.5rem;
  }

  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .genre-anime-card {
    height: 320px;
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

  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .genre-anime-card {
    height: 280px;
  }
}
</style>