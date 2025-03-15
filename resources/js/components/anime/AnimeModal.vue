<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ anime.title }}</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-content">
        <div class="video-container">
          <div v-if="videoLoading" class="loading-indicator">
            Memuat video...
          </div>
          <video v-else :src="currentVideoUrl" controls class="video-player" autoplay @loadeddata="videoLoading = false"
            @error="handleVideoError"></video>
        </div>

        <div class="episode-selector">
          <div v-for="episode in episodes" :key="episode.id" class="episode-card" @click="selectEpisode(episode)">
            <div class="episode-number">Episode {{ episode.number }}</div>
            <div class="episode-title">{{ episode.title || 'Episode Title' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    anime: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      episodes: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        title: `Episode ${i + 1}`,
        url: 'https://example.com/video.mp4', // Ganti dengan URL sebenarnya
      })),
      currentVideoUrl: '',
      videoLoading: true,
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    selectEpisode(episode) {
      this.currentVideoUrl = episode.url;
      this.videoLoading = true;
    },
    handleVideoError() {
      console.error('Gagal memuat video');
      this.videoLoading = false;
    },
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
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  /* 16:9 aspect ratio */
  height: 0;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.episode-selector {
  max-height: 70vh;
  overflow-y: auto;
}

.episode-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.episode-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.episode-number {
  color: #00ff88;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.episode-title {
  color: #888;
  font-size: 0.9rem;
}
</style>