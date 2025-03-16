<template>
  <main class="genres-container">
    <section class="genre-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="genre-title">Jelajahi Genre Anime</h1>
        <p class="genre-subtitle">Temukan anime berdasarkan genre favoritmu</p>
      </div>
    </section>

    <section class="genres-section">
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <not-found 
          :message="error" 
          @retry="fetchGenres" 
        />
      </div>

      <div v-else>
        <div class="search-filter">
          <input type="text" v-model="searchTerm" placeholder="Cari genre..." class="search-input" />
        </div>

        <div class="genres-grid">
          <router-link v-for="genre in filteredGenres" :key="genre.mal_id" :to="`/genres/${genre.mal_id}`"
            class="genre-card">
            <div class="genre-image">
              <div class="card-overlay"></div>
              <div class="genre-img-container" :style="{ backgroundImage: `url(${getGenreImage(genre.mal_id)})` }">
              </div>
              <div class="genre-overlay">
                <span class="explore-label">Jelajahi</span>
              </div>
            </div>
            <div class="genre-content">
              <h3 class="genre-name">{{ genre.name }}</h3>
              <p class="genre-count">{{ genre.count || 0 }} Anime</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { ref, computed, onMounted, inject, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: {
  },
  setup() {
    const genres = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const searchTerm = ref('');
    const router = useRouter();
    const apiCache = inject('apiCache', { value: new Map() });

    // Complete genre images mapping
    const genreImageMap = {
      1: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg', // Action
      2: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg', // Adventure
      3: 'https://cdn.myanimelist.net/images/anime/13/77729.jpg', // Cars
      4: 'https://cdn.myanimelist.net/images/anime/13/73834.jpg', // Comedy
      5: 'https://cdn.myanimelist.net/images/anime/1422/95039.jpg', // Avant Garde
      6: 'https://cdn.myanimelist.net/images/anime/7/75199.jpg', // Demons
      7: 'https://cdn.myanimelist.net/images/anime/1147/113443.jpg', // Mystery
      8: 'https://cdn.myanimelist.net/images/anime/1592/115015.jpg', // Drama
      9: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg', // Ecchi
      10: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg', // Fantasy
      11: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg', // Game
      13: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg', // Historical
      14: 'https://cdn.myanimelist.net/images/anime/11/39717.jpg', // Horror
      15: 'https://cdn.myanimelist.net/images/anime/7/50877.jpg', // Kids
      16: 'https://cdn.myanimelist.net/images/anime/13/22128.jpg', // Magic
      17: 'https://cdn.myanimelist.net/images/anime/6/75518.jpg', // Martial Arts
      18: 'https://cdn.myanimelist.net/images/anime/12/39497.jpg', // Mecha
      19: 'https://cdn.myanimelist.net/images/anime/12/28553.jpg', // Music
      20: 'https://cdn.myanimelist.net/images/anime/5/37793.jpg', // Parody
      21: 'https://cdn.myanimelist.net/images/anime/5/73574.jpg', // Samurai
      22: 'https://cdn.myanimelist.net/images/anime/5/19968.jpg', // Romance
      23: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg', // School
      24: 'https://cdn.myanimelist.net/images/anime/3/79156.jpg', // Sci-Fi
      25: 'https://cdn.myanimelist.net/images/anime/11/82919.jpg', // Shoujo
      26: 'https://cdn.myanimelist.net/images/anime/8/56163.jpg', // Girls Love
      27: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg', // Shounen
      28: 'https://cdn.myanimelist.net/images/anime/9/72697.jpg', // Boys Love
      29: 'https://cdn.myanimelist.net/images/anime/10/44631.jpg', // Space
      30: 'https://cdn.myanimelist.net/images/anime/5/65187.jpg', // Sports
      31: 'https://cdn.myanimelist.net/images/anime/2/73178.jpg', // Super Power
      32: 'https://cdn.myanimelist.net/images/anime/13/33465.jpg', // Vampire
      33: 'https://cdn.myanimelist.net/images/anime/1990/106925.jpg', // Yaoi
      34: 'https://cdn.myanimelist.net/images/anime/1112/111960.jpg', // Yuri
      35: 'https://cdn.myanimelist.net/images/anime/4/50361.jpg', // Harem
      36: 'https://cdn.myanimelist.net/images/anime/8/86662.jpg', // Slice of Life
      37: 'https://cdn.myanimelist.net/images/anime/10/59315.jpg', // Supernatural
      38: 'https://cdn.myanimelist.net/images/anime/9/35721.jpg', // Military
      39: 'https://cdn.myanimelist.net/images/anime/12/58341.jpg', // Police
      40: 'https://cdn.myanimelist.net/images/anime/9/26453.jpg', // Psychological
      41: 'https://cdn.myanimelist.net/images/anime/7/20310.jpg', // Suspense
      42: 'https://cdn.myanimelist.net/images/anime/9/9922.jpg', // Seinen
      43: 'https://cdn.myanimelist.net/images/anime/7/86665.jpg', // Josei
      44: 'https://cdn.myanimelist.net/images/anime/1059/132908.jpg', // Award Winning
      45: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', // Gourmet
      46: 'https://cdn.myanimelist.net/images/anime/1085/114792.jpg', // Work Life
      47: 'https://cdn.myanimelist.net/images/anime/1102/124696.jpg', // Erotica
      48: 'https://cdn.myanimelist.net/images/anime/1221/96695.jpg', // Adult Cast
    };

    // High-quality fallback image
    const fallbackImage = 'https://cdn.myanimelist.net/images/anime/1018/139057.jpg';

    // Function to get image for a specific genre
    const getGenreImage = (genreId) => {
      return genreImageMap[genreId] || fallbackImage;
    };

    // Filter genres based on search term
    const filteredGenres = computed(() => {
      if (!searchTerm.value) return genres.value;

      const term = searchTerm.value.toLowerCase();
      return genres.value.filter(genre =>
        genre.name.toLowerCase().includes(term)
      );
    });

    // Fetch genres with better caching and error handling
    const fetchGenres = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Check cache first
        const cacheKey = 'anime-genres';
        if (apiCache.value.has(cacheKey)) {
          const cachedData = apiCache.value.get(cacheKey);
          // Use cache if it's less than 1 hour old
          if (Date.now() - cachedData.timestamp < 3600000) {
            genres.value = cachedData.data;
            loading.value = false;
            return;
          }
        }

        const response = await fetch('https://api.jikan.moe/v4/genres/anime');
        
        if (!response.ok) {
          if (response.status === 429) {
            // Wait longer if rate limited
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchGenres(); // Retry with longer delay
          }
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();

        // Filter out explicit content and sort by popularity
        genres.value = data.data
          .filter(g => g.mal_id !== 12) // Filter hentai
          .sort((a, b) => b.count - a.count); // Sort by popularity
          
        // Store in cache
        apiCache.value.set(cacheKey, {
          data: genres.value,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error('Error fetching genres:', err);
        error.value = 'Gagal memuat genre. Silakan coba lagi nanti.';

        // Fallback to cache even if it's old
        const cacheKey = 'anime-genres';
        if (apiCache.value.has(cacheKey)) {
          genres.value = apiCache.value.get(cacheKey).data;
          error.value = 'Menggunakan data tersimpan. Refresh untuk memperbarui.';
        } else {
          // Navigate to not found if no data is available
          router.push('/not-found');
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchGenres();
    });

    onErrorCaptured((err) => {
      console.error('Global error caught:', err);
      error.value = 'Terjadi kesalahan. Silakan muat ulang halaman.';
      return false; // don't propagate the error
    });

    return {
      genres,
      loading,
      error,
      fetchGenres,
      getGenreImage,
      searchTerm,
      filteredGenres
    };
  }
};
</script>

<style scoped>
.genres-container {
  min-height: 100vh;
  background-color: var(--background-color, #0a0a10);
  color: var(--text-color, #fff);
  position: relative;
  overflow: hidden;
}

/* Add animated background effect */
.genres-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(76, 0, 255, 0.05) 0%, rgba(76, 0, 255, 0) 70%),
             radial-gradient(circle at 80% 20%, rgba(94, 2, 155, 0.05) 0%, rgba(94, 2, 155, 0) 70%);
  z-index: 0;
}

.genre-hero {
  height: 60vh;
  min-height: 400px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 2rem;
  background: url('https://cdn.myanimelist.net/images/anime/1208/94745.jpg') center/cover no-repeat;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(10, 10, 15, 0.7) 0%, 
    rgba(10, 10, 15, 0.85) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 1200px;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.genre-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--gradient-start, #7c4dff), var(--gradient-end, #ff6b81));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.genre-subtitle {
  color: var(--text-secondary, #ccc);
  font-size: 1.4rem;
  max-width: 800px;
  margin: 0 auto;
}

.genres-section {
  padding: 2rem;
  max-width: 1600px;
  margin: -80px auto 0;
  position: relative;
  z-index: 3;
}

.search-filter {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.search-filter::before {
  content: '🔍';
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  opacity: 0.7;
}

.search-input {
  width: 100%;
  padding: 1.2rem 1.5rem 1.2rem 3.5rem;
  border-radius: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 30px rgba(124, 77, 255, 0.15);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  padding: 1rem;
  perspective: 1000px;
}

.genre-card {
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg, rgba(26, 26, 36, 0.7));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  backdrop-filter: blur(5px);
  transform-style: preserve-3d;
  will-change: transform, box-shadow;
}

.genre-card:hover {
  transform: translateY(-12px) rotateX(5deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
              0 0 30px rgba(124, 77, 255, 0.2);
  z-index: 2;
}

.genre-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.genre-img-container {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s ease;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, 
    rgba(10, 10, 15, 0.7) 0%, 
    rgba(10, 10, 15, 0.3) 50%,
    rgba(10, 10, 15, 0.1) 100%);
  z-index: 1;
}

.genre-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.5);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 2;
}

.explore-label {
  padding: 0.6rem 1.2rem;
  background: rgba(124, 77, 255, 0.8);
  border-radius: 50px;
  color: white;
  font-weight: 600;
  transform: translateY(20px);
  transition: transform 0.4s ease;
}

.genre-card:hover .genre-overlay {
  opacity: 1;
}

.genre-card:hover .explore-label {
  transform: translateY(0);
}

.genre-card:hover .genre-img-container {
  transform: scale(1.15);
}

.genre-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.genre-name {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-color, #fff);
  font-weight: 700;
  position: relative;
}

.genre-name::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--gradient-start, #7c4dff), var(--gradient-end, #ff6b81));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.genre-card:hover .genre-name::after {
  width: 60px;
}

.genre-count {
  color: var(--primary-color, #6a51ec);
  font-size: 1rem;
  font-weight: 600;
  margin-top: auto;
  display: flex;
  align-items: center;
}

.genre-count::before {
  content: '📺';
  margin-right: 0.5rem;
  font-size: 1.1rem;
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
  text-align: center;
}

.loader {
  width: 50px;
  height: 50px;
  position: relative;
}

.loader::before,
.loader::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.loader::before {
  border-top-color: var(--gradient-start, #7c4dff);
  animation: spin 1s ease infinite;
}

.loader::after {
  border-bottom-color: var(--gradient-end, #ff6b81);
  animation: spin 1.5s ease-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .genre-title {
    font-size: 2.5rem;
  }

  .genre-subtitle {
    font-size: 1.1rem;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .genre-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 250px;
  }

  .genre-title {
    font-size: 2rem;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .genre-content {
    padding: 1rem;
  }

  .genre-name {
    font-size: 1.2rem;
  }

  .genre-name::after {
    width: 30px;
    height: 2px;
  }
}
</style>