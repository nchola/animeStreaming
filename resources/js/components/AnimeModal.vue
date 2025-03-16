<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ anime.title }}</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-content">
        <!-- Video Player -->
        <div class="video-container">
          <div v-if="videoLoading" class="loading-indicator">
            Memuat video...
          </div>
          <iframe
            v-else-if="currentVideoUrl"
            :src="currentVideoUrl"
            class="video-player"
            allowfullscreen
          ></iframe>
          <div v-else class="no-video">
            Tidak ada video yang tersedia.
          </div>
        </div>

        <!-- Streaming Links Grid -->
        <div class="streaming-links">
          <h3>Tautan Streaming</h3>
          <div class="streaming-grid">
            <div 
              v-for="link in streamingLinks" 
              :key="link.name" 
              class="streaming-card"
              @click="openStreamingLink(link.url)"
            >
              <i class="fas fa-external-link-alt"></i>
              <span>{{ link.name }}</span>
            </div>
          </div>
        </div>

        <!-- Episodes -->
        <div class="episodes-section">
          <h3>Episode</h3>
          <div class="episode-grid">
            <div 
              v-for="episode in episodes" 
              :key="episode.mal_id" 
              class="episode-card"
              @click="selectEpisode(episode)"
            >
              <img 
                :src="episode.images.jpg.image_url || '/path/to/local/placeholder.jpg'" 
                :alt="episode.title" 
                class="episode-poster" 
              />
              <div class="episode-info">
                <p>Episode {{ episode.episode }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trailers and Promos -->
        <div class="trailers-section">
          <h3>Trailer & Promo</h3>
          <div class="trailer-grid">
            <div 
              v-for="trailer in trailers" 
              :key="trailer.title" 
              class="trailer-card"
              @click="selectTrailer(trailer)"
            >
              <img 
                :src="trailer.trailer.images.medium_image_url" 
                :alt="trailer.title" 
                class="trailer-poster" 
              />
              <div class="trailer-info">
                <h4>{{ trailer.title }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  props: {
    anime: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const streamingLinks = ref([]);
    const episodes = ref([]);
    const trailers = ref([]);
    const currentVideoUrl = ref('');
    const videoLoading = ref(true);

    // Fetch streaming links
    const fetchStreamingLinks = async () => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${props.anime.mal_id}/streaming`);
        streamingLinks.value = response.data.data;
      } catch (error) {
        console.error("Error fetching streaming links:", error);
      }
    };

    // Fetch episodes
    const fetchEpisodes = async () => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${props.anime.mal_id}/videos/episodes`);
        episodes.value = response.data.data;
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };

    // Fetch trailers and promos
    const fetchTrailers = async () => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${props.anime.mal_id}/videos`);
        trailers.value = response.data.data.promo;
      } catch (error) {
        console.error("Error fetching trailers:", error);
      }
    };

    // Fetch episode details and video URL
    const fetchEpisodeVideo = async (episodeId) => {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${props.anime.mal_id}/episodes/${episodeId}`);
        return response.data.data.url; // URL video dari API
      } catch (error) {
        console.error("Error fetching episode video:", error);
        return null;
      }
    };

    // Select episode
    const selectEpisode = async (episode) => {
      videoLoading.value = true;
      const videoUrl = await fetchEpisodeVideo(episode.mal_id);
      if (videoUrl) {
        currentVideoUrl.value = videoUrl;
      } else {
        console.error("Failed to load video URL");
      }
      videoLoading.value = false;
    };

    // Select trailer
    const selectTrailer = (trailer) => {
      currentVideoUrl.value = trailer.trailer.embed_url;
    };

    // Open streaming link in new tab
    const openStreamingLink = (url) => {
      window.open(url, "_blank");
    };

    // Close modal
    const close = () => {
      emit('close');
    };

    onMounted(() => {
      fetchStreamingLinks();
      fetchEpisodes();
      fetchTrailers();
    });

    return {
      streamingLinks,
      episodes,
      trailers,
      currentVideoUrl,
      videoLoading,
      selectEpisode,
      selectTrailer,
      openStreamingLink,
      close,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-container {
  background: #1a1a1a;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #2a2a2a;
}

.modal-header h2 {
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 1rem;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 0.8;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  margin-bottom: 1.5rem;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.no-video {
  text-align: center;
  color: #888;
  padding: 2rem;
}

.streaming-links,
.episodes-section,
.trailers-section {
  margin-bottom: 2rem;
}

.streaming-links h3,
.episodes-section h3,
.trailers-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #00ff88;
}

.streaming-grid,
.episode-grid,
.trailer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.streaming-card,
.episode-card,
.trailer-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.streaming-card:hover,
.episode-card:hover,
.trailer-card:hover {
  transform: translateY(-5px);
}

.streaming-card i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.episode-poster,
.trailer-poster {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.episode-info,
.trailer-info {
  padding: 0.5rem;
}

.episode-info p,
.trailer-info h4 {
  font-size: 0.9rem;
  color: #888;
}
</style>