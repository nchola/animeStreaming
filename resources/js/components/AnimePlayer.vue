<template>
  <div class="player-container">
    <div v-if="loading" class="loading">Memuat video...</div>
    <div v-else>
      <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
      <div class="episode-selector">
        <button 
          v-for="ep in episodes" 
          :key="ep.id" 
          @click="changeEpisode(ep.id)"
          :class="{ active: ep.id === currentEpisode.id }"
        >
          Episode {{ ep.number }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  data() {
    return {
      episodes: [],
      currentEpisode: {},
      loading: false,
    };
  },
  async created() {
    await this.fetchEpisodes();
  },
  methods: {
    async fetchEpisodes() {
      this.loading = true;
      try {
        const response = await axios.get(`/api/anime/stream/${this.$route.params.id}`);
        this.episodes = response.data.sources;
        this.currentEpisode = this.episodes[0];
      } catch (error) {
        console.error("Error:", error);
      }
      this.loading = false;
    },
    changeEpisode(epId) {
      this.currentEpisode = this.episodes.find(ep => ep.id === epId);
      this.player.src({ src: this.currentEpisode.url, type: 'video/mp4' });
      this.player.play();
    },
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, {
      sources: [{
        src: this.currentEpisode.url,
        type: 'video/mp4'
      }],
      controls: true,
      autoplay: true,
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
};
</script>

<style scoped>
.player-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-js {
  width: 100%;
  height: 400px;
}

.episode-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.episode-selector button {
  padding: 6px 12px;
  border: 1px solid #42b983;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.episode-selector button.active {
  background: #42b983;
  color: white;
}
</style>