import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import devtools from './devtools-patch'; // Pastikan file ini ada
import { createPinia } from 'pinia';

// Inisialisasi app
const app = createApp(App);
const pinia = createPinia();

// Konfigurasi Axios
axios.defaults.baseURL = 'http://localhost:8000';
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error:', error);
    return Promise.reject(error);
  }
);

// Konfigurasi DevTools
if (import.meta.env.DEV) {
  app.config.devtools = true;
  app.config.performance = true;

  // Force initialize devtools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    console.log('[Vue Debug] DevTools Hook initialized');
  } else {
    console.warn('[Vue Debug] DevTools Hook not found');
  }
}

// Debugging checkpoints
console.log('[Vue Debug] Vue Version:', app.version);
console.log('[Vue Debug] DevTools Hook:', window.__VUE_DEVTOOLS_GLOBAL_HOOK__);

// Register global properties
app.config.globalProperties.$axios = axios;

// Setup devtools connection
try {
  app.use(devtools);
  app.config.globalProperties.$devtools?.connect();
} catch (error) {
  console.error('DevTools connection failed:', error);
}

// Register plugins
app.use(router);
app.use(pinia);

// Mount app
app.mount('#app');