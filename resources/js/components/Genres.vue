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
        <router-link 
          v-for="genre in genres" 
          :key="genre.mal_id" 
          :to="`/genres/${genre.mal_id}`" 
          class="genre-card"
        >
          <div class="genre-image">
            <img 
              :src="getGenreImage(genre.mal_id)" 
              :alt="genre.name" 
              class="genre-img"
              loading="lazy"
            />
          </div>
          <div class="genre-content">
            <h3 class="genre-name">{{ genre.name }}</h3>
            <p class="genre-count">{{ genre.count || 0 }} Anime</p>
          </div>
        </router-link>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const genres = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchGenres = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await axios.get('https://api.jikan.moe/v4/genres/anime');
        genres.value = response.data.data.filter(g => g.mal_id !== 12); // Filter explicit genre
      } catch (err) {
        error.value = 'Gagal memuat genre. Silakan coba lagi nanti.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const getGenreImage = (genreId) => {
      const genreImages = {
        1: 'https://source.unsplash.com/400x400/?action,anime',
        2: 'https://source.unsplash.com/400x400/?adventure,anime',
        4: 'https://source.unsplash.com/400x400/?comedy,anime',
        8: 'https://source.unsplash.com/400x400/?drama,anime',
        10: 'https://source.unsplash.com/400x400/?fantasy,anime',
        14: 'https://source.unsplash.com/400x400/?horror,anime',
        22: 'https://source.unsplash.com/400x400/?romance,anime',
        27: 'https://source.unsplash.com/400x400/?shounen,anime',
        36: 'https://source.unsplash.com/400x400/?slice-of-life,anime',
      };
      return genreImages[genreId] || 'https://source.unsplash.com/400x400/?anime';
    };

    onMounted(() => {
      fetchGenres();
    });

    return { genres, loading, error, fetchGenres, getGenreImage };
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.genre-card {
  border-radius: 16px;
  overflow: hidden;
  background: #1a1a1a;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.genre-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 255, 136, 0.15);
}

.genre-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.genre-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.genre-card:hover .genre-img {
  transform: scale(1.1);
}

.genre-content {
  padding: 1.5rem;
}

.genre-name {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.genre-count {
  color: #00ff88;
  font-size: 0.95rem;
  font-weight: 500;
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

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .genre-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 4rem 1rem 2rem;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .genre-content {
    padding: 1rem;
  }

  .genre-name {
    font-size: 1.2rem;
  }
}
</style>