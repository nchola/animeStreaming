<template>
  <div class="app-container">
    <nav class="main-nav">
      <div class="nav-content">
        <router-link to="/" class="logo-link">
          <h1 class="logo">AnimeStream</h1>
        </router-link>
        <div class="nav-links">
          <router-link to="/genres" class="nav-link">Genres</router-link>
        </div>
        <div class="search-container">
          <input type="text" placeholder="Cari anime..." class="search-input" />
        </div>
      </div>
    </nav>

    <router-view></router-view>

    <footer class="main-footer">
      <div class="footer-content">
        <p>&copy; 2024 AnimeStream. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import Genres from './components/genres/Genres.vue';

export default {
  name: 'App',
  components: {
    Genres
  }
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

body {
  background: #0f0f0f;
  color: #ffffff;
}

.logo-link {
  text-decoration: none;
  cursor: pointer;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.logo {
  font-size: 1.8rem;
  background: linear-gradient(45deg, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

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
  border-color: #00ff88;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
}

.main-footer {
  margin-top: auto;
  background: #1a1a1a;
  padding: 2rem 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #888;
}
/* Tambahkan gaya untuk nav-links */
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
  background: linear-gradient(90deg, #00ff88, #00b4d8);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-exact-active {
  color: #00ff88;
}
</style>