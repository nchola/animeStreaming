<template>
  <main class="genres-container">
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">Jelajahi Genre Anime</h2>
        <p class="hero-subtitle">Temukan anime berdasarkan genre favoritmu</p>
      </div>
    </section>

    <section class="genres-section">
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchGenres" class="retry-button">Coba Lagi</button>
      </div>

      <div v-else class="genres-grid">
        <div v-for="genre in genres" :key="genre.mal_id" class="genre-card">
          <h3 class="genre-name">{{ genre.name }}</h3>
          <Slider :animeList="getAnimeList(genre.mal_id)" />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Slider from '@/components/anime/Slider.vue';

export default {
  components: {
    Slider
  },
  setup() {
    const genres = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const animeByGenre = ref({});

    const fetchGenres = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await axios.get('https://api.jikan.moe/v4/genres/anime');
        genres.value = response.data.data.filter(g => g.mal_id !== 12); // Filter explicit genre
        genres.value.forEach(genre => fetchAnimeByGenre(genre.mal_id));
      } catch (err) {
        error.value = 'Gagal memuat genre. Silakan coba lagi nanti.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const fetchAnimeByGenre = async (genreId) => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=5`);
        animeByGenre.value[genreId] = response.data.data;
      } catch (err) {
        console.error(err);
      }
    };

    const getAnimeList = (genreId) => {
      return animeByGenre.value[genreId] || [];
    };

    onMounted(() => {
      fetchGenres();
    });

    return { genres, loading, error, fetchGenres, getAnimeList };
  }
};
</script>

<style scoped>
.genres-container {
  min-height: 100vh;
  background: #0f0f0f;
  color: #fff;
}

.hero-section {
  text-align: center;
  padding: 6rem 1rem 4rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.hero-title {
  font-size: 2.8rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.hero-subtitle {
  color: #888;
  font-size: 1.2rem;
}

.genres-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.genre-card {
  border-radius: 16px;
  overflow: hidden;
  background: #1a1a1a;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  padding: 1rem;
}

.genre-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 255, 136, 0.15);
}

.genre-name {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #fff;
  text-align: center;
}

.loading-container,
.error-container {
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-container {
  flex-direction: column;
  gap: 1rem;
}

.retry-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}
</style>