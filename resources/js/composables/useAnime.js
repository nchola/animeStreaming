import { ref, computed } from 'vue';
import axios from 'axios';

export function useAnime() {
  const animeList = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(5);
  const selectedAnime = ref(null);
  const requestDelay = 4000; // Delay untuk menghindari rate limiting
  const lastRequestTime = ref(0);
  const abortController = ref(null);

  // Fallback data jika API down
  const fallbackData = {
    1535: {
      title: "Death Note",
      episodes: 37,
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg" } }
    }
  };

  // Axios instance dengan retry mechanism
  const axiosInstance = axios.create();

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      if (error.response?.status === 429 && !config._retry) {
        config._retry = true;
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay 3 detik
        return axiosInstance(config);
      }
      return Promise.reject(error);
    }
  );

  // Fetch data anime
  const fetchTopAnime = async (itemsPerPage = null) => {
    if (abortController.value) {
      abortController.value.abort(); // Batalkan request sebelumnya
    }

    abortController.value = new AbortController();
    loading.value = true;
    error.value = null;

    try {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.value;

      if (timeSinceLastRequest < requestDelay) {
        await new Promise(resolve => setTimeout(resolve, requestDelay - timeSinceLastRequest));
      }

      const limit = itemsPerPage || calculateItemsPerPage();

      console.log("Fetching anime data..."); // Log sebelum request
      const response = await axiosInstance.get(`https://api.jikan.moe/v4/top/anime?page=${currentPage.value}&limit=${limit}`, {
        signal: abortController.value.signal,
      });

      console.log("API Response:", response.data); // Log response
      animeList.value = response.data.data || [];
      lastRequestTime.value = Date.now();

      if (response.data.pagination) {
        totalPages.value = Math.min(response.data.pagination.last_visible_page, 5);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching anime:", err); // Log error
        error.value = "Gagal memuat data anime. Silakan coba lagi nanti.";
        animeList.value = fallbackData; // Gunakan fallback data
      }
    } finally {
      loading.value = false;
    }
  };

  // Fungsi untuk menghitung jumlah item per halaman
  const calculateItemsPerPage = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let columns = 2; // Default untuk layar terkecil
    if (width > 2000) columns = 8;
    else if (width > 1400) columns = 6;
    else if (width > 991) columns = 5;
    else if (width > 576) columns = 4;
    else if (width > 375) columns = 3;

    const cardHeight = width > 576 ? 300 : 250;
    const availableHeight = height - 300; // Kurangi tinggi header dan pagination
    const rows = Math.max(2, Math.floor(availableHeight / cardHeight));

    return columns * (rows + 1);
  };

  return {
    animeList,
    loading,
    error,
    currentPage,
    totalPages,
    selectedAnime,
    fetchTopAnime,
    calculateItemsPerPage,
  };
}