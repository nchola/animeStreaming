import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Set base URL untuk API
axios.defaults.baseURL = 'http://localhost:8000';

const app = createApp(App);

// Tambahkan axios ke instance Vue
app.config.globalProperties.$axios = axios;

app.use(router);
app.mount('#app');