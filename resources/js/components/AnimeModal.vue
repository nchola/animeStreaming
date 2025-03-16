<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ anime.title }}</h2>
        <div class="header-controls">
          <button class="favorite-btn" @click="toggleFavorite">
            <i :class="['fas', isFavorite ? 'fa-heart' : 'fa-heart-o']"></i>
          </button>
          <button class="close-btn" @click="close">&times;</button>
        </div>
      </div>

      <div class="modal-content">
        <!-- Video Player -->
        <div class="video-container">
          <div v-if="videoLoading" class="loading-indicator">
            <div class="spinner"></div>
            <span>Memuat video...</span>
          </div>
          <video 
            v-else-if="currentVideoUrl" 
            ref="videoPlayer" 
            class="video-js vjs-big-play-centered vjs-theme-netflix">
          </video>
          <div v-else class="no-video">
            <i class="fas fa-film"></i>
            <p>Tidak ada video yang tersedia.</p>
          </div>
        </div>

        <!-- Episode Navigation -->
        <div class="episode-navigation">
          <button 
            v-if="currentEpisodeIndex > 0" 
            @click="playPreviousEpisode" 
            class="nav-button prev">
            <i class="fas fa-step-backward"></i> Episode Sebelumnya
          </button>
          <span class="episode-info" v-if="currentEpisode">
            Episode {{ currentEpisode.episode }} {{ currentEpisode.title ? '- ' + currentEpisode.title : '' }}
          </span>
          <button 
            v-if="currentEpisodeIndex < episodes.length - 1" 
            @click="playNextEpisode" 
            class="nav-button next">
            Episode Berikutnya <i class="fas fa-step-forward"></i>
          </button>
        </div>

        <!-- Episodes Horizontal Scroll -->
        <div class="episodes-section">
          <h3>Episode</h3>
          <div class="episode-slider">
            <button class="slider-nav left" @click="scrollEpisodes('left')">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="episode-scroll" ref="episodeScroll">
              <div 
                v-for="(episode, index) in episodes" 
                :key="episode.mal_id" 
                :class="['episode-card', { active: currentEpisodeIndex === index }]"
                @click="selectEpisode(episode, index)"
              >
                <div class="episode-thumbnail">
                  <img 
                    :src="episode.images?.jpg?.image_url || '/path/to/local/placeholder.jpg'" 
                    :alt="episode.title" 
                    class="episode-poster" 
                  />
                  <div class="play-overlay">
                    <i class="fas fa-play-circle"></i>
                  </div>
                  <div class="progress-bar" v-if="episodeProgress[episode.mal_id]">
                    <div class="progress" :style="{ width: episodeProgress[episode.mal_id] + '%' }"></div>
                  </div>
                </div>
                <div class="episode-info">
                  <p class="episode-number">Episode {{ episode.episode }}</p>
                  <p class="episode-title">{{ episode.title || `Episode ${episode.episode}` }}</p>
                </div>
              </div>
            </div>
            <button class="slider-nav right" @click="scrollEpisodes('right')">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Trailers and Promos -->
        <div class="trailers-section" v-if="trailers.length > 0">
          <h3>Trailer & Promo</h3>
          <div class="trailer-slider">
            <button class="slider-nav left" @click="scrollTrailers('left')">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="trailer-scroll" ref="trailerScroll">
              <div 
                v-for="trailer in trailers" 
                :key="trailer.title" 
                class="trailer-card"
                @click="selectTrailer(trailer)"
              >
                <div class="trailer-thumbnail">
                  <img 
                    :src="trailer.trailer.images.medium_image_url" 
                    :alt="trailer.title" 
                    class="trailer-poster" 
                  />
                  <div class="play-overlay">
                    <i class="fas fa-play-circle"></i>
                  </div>
                </div>
                <div class="trailer-info">
                  <h4>{{ trailer.title }}</h4>
                </div>
              </div>
            </div>
            <button class="slider-nav right" @click="scrollTrailers('right')">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Streaming Links -->
        <div class="streaming-links" v-if="streamingLinks.length > 0">
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

        <!-- Anime Details -->
        <div class="anime-details">
          <h3>Informasi</h3>
          <div class="details-container">
            <div class="anime-synopsis">
              <p>{{ anime.synopsis }}</p>
            </div>
            <div class="anime-metadata">
              <p><strong>Rating:</strong> {{ anime.rating }}</p>
              <p><strong>Status:</strong> {{ anime.status }}</p>
              <p><strong>Tahun:</strong> {{ anime.year }}</p>
              <p><strong>Genre:</strong> {{ anime.genres?.map(g => g.name).join(', ') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

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
    const videoPlayer = ref(null);
    const player = ref(null);
    const isFavorite = ref(false);
    const currentEpisodeIndex = ref(0);
    const episodeProgress = ref({});
    const episodeScroll = ref(null);
    const trailerScroll = ref(null);

    const currentEpisode = computed(() => {
      if (episodes.value.length === 0) return null;
      return episodes.value[currentEpisodeIndex.value];
    });

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
        
        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem(`anime_${props.anime.mal_id}_progress`);
        if (savedProgress) {
          episodeProgress.value = JSON.parse(savedProgress);
        }
        
        if (episodes.value.length > 0) {
          selectEpisode(episodes.value[0], 0);
        }
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
    const selectEpisode = async (episode, index) => {
      videoLoading.value = true;
      currentEpisodeIndex.value = index;
      
      if (player.value) {
        player.value.dispose();
      }
      
      const videoUrl = await fetchEpisodeVideo(episode.mal_id);
      
      if (videoUrl) {
        currentVideoUrl.value = videoUrl;
        
        // Initialize or update video player
        nextTick(() => {
          player.value = videojs(videoPlayer.value, {
            controls: true,
            autoplay: true,
            fluid: true,
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            sources: [{
              src: videoUrl,
              type: 'video/mp4'
            }]
          });
          
          // Track progress
          player.value.on('timeupdate', () => {
            const currentTime = player.value.currentTime();
            const duration = player.value.duration();
            if (duration > 0) {
              const percentage = Math.floor((currentTime / duration) * 100);
              episodeProgress.value[episode.mal_id] = percentage;
              localStorage.setItem(
                `anime_${props.anime.mal_id}_progress`, 
                JSON.stringify(episodeProgress.value)
              );
            }
          });
          
          videoLoading.value = false;
        });
      } else {
        console.error("Failed to load video URL");
        videoLoading.value = false;
      }
    };

    // Play previous episode
    const playPreviousEpisode = () => {
      if (currentEpisodeIndex.value > 0) {
        const newIndex = currentEpisodeIndex.value - 1;
        selectEpisode(episodes.value[newIndex], newIndex);
      }
    };

    // Play next episode
    const playNextEpisode = () => {
      if (currentEpisodeIndex.value < episodes.value.length - 1) {
        const newIndex = currentEpisodeIndex.value + 1;
        selectEpisode(episodes.value[newIndex], newIndex);
      }
    };

    // Select trailer
    const selectTrailer = (trailer) => {
      videoLoading.value = true;
      
      if (player.value) {
        player.value.dispose();
      }
      
      currentVideoUrl.value = trailer.trailer.embed_url;
      
      // For trailers, we'll use an iframe instead of video.js
      videoLoading.value = false;
    };

    // Toggle favorite status
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value;
      
      // Save to localStorage
      const favorites = JSON.parse(localStorage.getItem('anime_favorites') || '[]');
      
      if (isFavorite.value) {
        if (!favorites.includes(props.anime.mal_id)) {
          favorites.push(props.anime.mal_id);
        }
      } else {
        const index = favorites.indexOf(props.anime.mal_id);
        if (index > -1) {
          favorites.splice(index, 1);
        }
      }
      
      localStorage.setItem('anime_favorites', JSON.stringify(favorites));
    };

    // Horizontal scrolling for episodes
    const scrollEpisodes = (direction) => {
      const scrollAmount = 300;
      if (direction === 'left') {
        episodeScroll.value.scrollLeft -= scrollAmount;
      } else {
        episodeScroll.value.scrollLeft += scrollAmount;
      }
    };

    // Horizontal scrolling for trailers
    const scrollTrailers = (direction) => {
      const scrollAmount = 300;
      if (direction === 'left') {
        trailerScroll.value.scrollLeft -= scrollAmount;
      } else {
        trailerScroll.value.scrollLeft += scrollAmount;
      }
    };

    // Open streaming link in new tab
    const openStreamingLink = (url) => {
      window.open(url, "_blank");
    };

    // Close modal
    const close = () => {
      if (player.value) {
        player.value.dispose();
      }
      emit('close');
    };

    onMounted(() => {
      fetchStreamingLinks();
      fetchEpisodes();
      fetchTrailers();
      
      // Check if anime is in favorites
      const favorites = JSON.parse(localStorage.getItem('anime_favorites') || '[]');
      isFavorite.value = favorites.includes(props.anime.mal_id);
    });

    return {
      streamingLinks,
      episodes,
      trailers,
      currentVideoUrl,
      videoLoading,
      videoPlayer,
      currentEpisodeIndex,
      currentEpisode,
      episodeProgress,
      episodeScroll,
      trailerScroll,
      isFavorite,
      selectEpisode,
      selectTrailer,
      openStreamingLink,
      toggleFavorite,
      playPreviousEpisode,
      playNextEpisode,
      scrollEpisodes,
      scrollTrailers,
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
  background: rgba(0, 0, 0, 0.85);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-container {
  background: #141414;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  position: relative;
  z-index: 10;
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.favorite-btn, .close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(229, 9, 20, 0.7);
  transform: scale(1.1);
}

.close-btn {
  font-size: 1.5rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-content {
  padding: 0.5rem 1.5rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  margin-bottom: 1.5rem;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.video-player, .video-js {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Custom Netflix-like skin for video.js */
:deep(.vjs-theme-netflix) {
  --vjs-theme-netflix--primary: #e50914;
}

:deep(.vjs-theme-netflix .vjs-control-bar) {
  background-color: rgba(0, 0, 0, 0.5);
  height: 4em;
}

:deep(.vjs-theme-netflix .vjs-button > .vjs-icon-placeholder::before) {
  line-height: 2.2;
}

:deep(.vjs-theme-netflix .vjs-big-play-button) {
  background-color: rgba(229, 9, 20, 0.7);
  border: none;
  border-radius: 50%;
  width: 4em;
  height: 4em;
  margin-left: -2em;
  margin-top: -2em;
}

:deep(.vjs-theme-netflix:hover .vjs-big-play-button) {
  background-color: rgba(229, 9, 20, 1);
  transform: scale(1.1);
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #e50914;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  gap: 1rem;
}

.no-video i {
  font-size: 3rem;
}

.episode-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
}

.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s ease;
}

.nav-button:hover {
  background: rgba(229, 9, 20, 0.7);
}

.episode-info {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
}

.episodes-section h3,
.trailers-section h3,
.streaming-links h3,
.anime-details h3 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1rem;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #e50914;
}

.episode-slider,
.trailer-slider {
  position: relative;
  margin-bottom: 2rem;
}

.episode-scroll,
.trailer-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.5rem 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.episode-scroll::-webkit-scrollbar,
.trailer-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-nav.left {
  left: -20px;
}

.slider-nav.right {
  right: -20px;
}

.slider-nav:hover {
  background: rgba(229, 9, 20, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.episode-card,
.trailer-card {
  flex: 0 0 220px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.episode-card:hover,
.trailer-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.episode-card.active {
  border: 2px solid #e50914;
}

.episode-thumbnail,
.trailer-thumbnail {
  position: relative;
  width: 100%;
  height: 130px;
}

.episode-poster,
.trailer-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-overlay i {
  font-size: 2.5rem;
  color: #e50914;
}

.episode-card:hover .play-overlay,
.trailer-card:hover .play-overlay {
  opacity: 1;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
}

.progress {
  height: 100%;
  background: #e50914;
}

.episode-info,
.trailer-info {
  padding: 0.75rem;
  background: #1f1f1f;
}

.episode-number {
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.episode-title {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trailer-info h4 {
  font-size: 0.9rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.streaming-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.streaming-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.streaming-card:hover {
  background: rgba(229, 9, 20, 0.15);
  border-color: rgba(229, 9, 20, 0.5);
  transform: translateY(-5px);
}

.streaming-card i {
  font-size: 1.5rem;
}

.anime-details {
  margin-bottom: 2rem;
}

.details-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .details-container {
    grid-template-columns: 7fr 3fr;
  }
}

.anime-synopsis {
  font-size: 1rem;
  line-height: 1.6;
}

.anime-metadata {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.25rem;
}

.anime-metadata p {
  margin: 0 0 0.75rem;
}

.anime-metadata strong {
  color: #e50914;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .modal-container {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
  
  .modal-content {
    padding: 0 1rem 1rem;
  }
  
  .episodes-section h3,
  .trailers-section h3,
  .streaming-links h3,
  .anime-details h3 {
    font-size: 1.25rem;
  }
  
  .episode-card,
  .trailer-card {
    flex: 0 0 160px;
  }
  
  .episode-thumbnail,
  .trailer-thumbnail {
    height: 90px;
  }
  
  .episode-navigation {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .episode-info {
    order: -1;
  }
}
</style>