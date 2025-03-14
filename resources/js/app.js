import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { createPinia } from 'pinia';

// Set base URL untuk API
axios.defaults.baseURL = 'http://localhost:8000';

const app = createApp(App);
const pinia = createPinia();

// Tambahkan axios ke instance Vue
app.config.globalProperties.$axios = axios;

app.use(router);
app.use(pinia);
app.mount('#app');