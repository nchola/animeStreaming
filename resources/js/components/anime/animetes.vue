<template>
    <div class="app-container">
        <!-- Navigation Bar with optimized layout -->
        <nav class="main-nav">
            <div class="nav-content">
                <!-- Logo -->
                <router-link to="/" class="logo-link">
                    <h1 class="logo">AnimeStream</h1>
                </router-link>

                <!-- Navigation Links -->
                <div class="nav-links">
                    <router-link to="/genres" class="nav-link">Genres</router-link>
                    <router-link to="/schedule" class="nav-link">Schedule</router-link>
                    <router-link to="/trending" class="nav-link">Trending</router-link>
                </div>

                <!-- Optimized Search Component (Inline) -->
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <input v-model="searchQuery" @input="handleSearchInput" placeholder="Cari anime..."
                            class="search-input" />
                        <div class="search-icon" v-if="!isSearchLoading">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <div class="loading-spinner" v-else></div>
                    </div>

                    <!-- Search Results with Virtual Scrolling for performance -->
                    <transition name="fade">
                        <div v-if="searchResults.length > 0" class="search-results">
                            <template v-if="!isSearchLoading">
                                <div v-for="anime in searchResults" :key="anime.mal_id" class="search-result-card"
                                    @click="selectAnime(anime)">
                                    <img :src="anime.images.jpg.image_url" :alt="anime.title" class="search-poster"
                                        loading="lazy" />
                                    <div class="search-info">
                                        <h4>{{ anime.title }}</h4>
                                        <p>{{ anime.year || 'N/A' }} • ⭐ {{ anime.score || 'N/A' }}</p>
                                    </div>
                                </div>
                            </template>
                            <div v-else class="search-skeleton">
                                <div v-for="i in 3" :key="i" class="skeleton-item">
                                    <div class="skeleton-poster"></div>
                                    <div class="skeleton-text">
                                        <div class="skeleton-line"></div>
                                        <div class="skeleton-line short"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </nav>

        <main class="content-container">
            <!-- Modern Grid-Based Top Anime Section -->
            <section class="top-anime-showcase">
                <div class="section-header">
                    <h2 class="section-title">Top 10 Anime Terpopuler</h2>
                    <div class="view-more" @click="loadAllAnime">Lihat Semua</div>
                </div>

                <div v-if="isTopAnimeLoading" class="anime-grid-loading">
                    <div v-for="i in 10" :key="i" class="anime-skeleton" :class="{ 'featured': i === 1 }"></div>
                </div>

                <div v-else class="anime-grid">
                    <div v-for="(anime, index) in topAnime" :key="anime.mal_id" class="anime-grid-item"
                        :class="{ 'featured': index === 0 }" @click="openAnimeModal(anime)">

                        <div class="anime-backdrop"
                            :style="{ backgroundImage: `url(${anime.images.webp.large_image_url})` }">
                            <div class="anime-content">
                                <div class="anime-rank">#{{ anime.rank }}</div>
                                <div class="anime-details">
                                    <h3 class="grid-anime-title">{{ anime.title_english || anime.title }}</h3>
                                    <div class="anime-meta">
                                        <span class="anime-score">⭐ {{ anime.score }}</span>
                                        <span class="anime-year" v-if="anime.year">{{ anime.year }}</span>
                                    </div>
                                    <div class="genre-tags">
                                        <span v-for="genre in anime.genres.slice(0, 3)" :key="genre.mal_id"
                                            class="genre-tag">
                                            {{ genre.name }}
                                        </span>
                                    </div>
                                    <p class="anime-description" v-if="index === 0">{{ truncateText(anime.synopsis, 150)
                                        }}</p>
                                </div>
                                <div class="hover-play">
                                    <span class="play-icon">▶</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Trending Section with Slider -->
            <section class="trending-section">
                <div class="section-header">
                    <h3>Trending Now</h3>
                    <div class="view-more" @click="loadAllAnime">Lihat Semua</div>
                </div>

                <div v-if="trendingLoading" class="loading-container">
                    <div class="loader"></div>
                </div>

                <div v-else-if="trendingError" class="error-container">
                    <p>{{ trendingError }}</p>
                    <button @click="fetchTrendingAnime" class="retry-button">Coba Lagi</button>
                </div>

                <swiper v-else :modules="swiperModules" :slides-per-view="'auto'" :space-between="20" :navigation="true"
                    :breakpoints="trendingBreakpoints" class="trending-slider">
                    <swiper-slide v-for="anime in trendingAnime" :key="anime.mal_id">
                        <div class="trending-card" @click="openAnimeModal(anime)">
                            <img :src="anime.images.webp.large_image_url" :alt="anime.title" class="trending-poster"
                                loading="lazy" />
                            <div class="trending-info">
                                <h4 class="anime-title">{{ anime.title }}</h4>
                                <div class="anime-meta">
                                    <span class="rating">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"
                                            stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon
                                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                                            </polygon>
                                        </svg>
                                        {{ anime.score || 'N/A' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </swiper-slide>
                </swiper>
            </section>

            <!-- Schedule Section -->
            <section class="schedule-section">
                <div class="section-header">
                    <h3>Jadwal Tayang Hari Ini</h3>
                </div>

                <div v-if="scheduleLoading" class="loading-container">
                    <div class="loader"></div>
                </div>

                <div v-else-if="scheduleError" class="error-container">
                    <p>{{ scheduleError }}</p>
                    <button @click="fetchSchedule" class="retry-button">Coba Lagi</button>
                </div>

                <swiper v-else :modules="swiperModules" :slides-per-view="'auto'" :space-between="20" :navigation="true"
                    :breakpoints="scheduleBreakpoints" class="schedule-slider">
                    <swiper-slide v-for="item in scheduleData" :key="item.mal_id">
                        <div class="schedule-card">
                            <div class="time-slot">{{ item.broadcast?.time || '00:00' }}</div>
                            <img :src="item.images.webp.large_image_url" :alt="item.title" class="schedule-poster"
                                loading="lazy" />
                            <div class="schedule-info">
                                <h4>{{ item.title }}</h4>
                                <p class="broadcast-info">
                                    {{ item.broadcast?.day || 'Belum Ada Jadwal Tayang' }} •
                                    {{ item.broadcast?.time || 'x' }}
                                </p>
                            </div>
                        </div>
                    </swiper-slide>
                </swiper>
            </section>

            <!-- Anime Grid Section -->
            <section class="anime-grid-section">
                <div class="section-header">
                    <h3>Semua Anime</h3>
                </div>

                <div v-if="animeListLoading" class="loading-container">
                    <div class="loader"></div>
                </div>

                <div v-else-if="animeListError" class="error-container">
                    <p>{{ animeListError }}</p>
                    <button @click="fetchAnimeList" class="retry-button">Coba Lagi</button>
                </div>

                <div v-else class="anime-grid-list">
                    <div v-for="(anime, index) in uniqueAnimeList" :key="`anime-${anime.mal_id}-${index}`"
                        class="anime-card" @click="openAnimeModal(anime)">
                        <div class="card-overlay"></div>
                        <img :src="anime.images.jpg.large_image_url" :alt="anime.title" class="anime-poster"
                            loading="lazy" />
                        <div class="anime-info">
                            <h4 class="anime-title">{{ anime.title }}</h4>
                            <div class="anime-meta">
                                <span class="rating">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="currentColor" stroke="currentColor" stroke-width="1"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <polygon
                                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                                        </polygon>
                                    </svg>
                                    {{ anime.score || 'N/A' }}
                                </span>
                                <span class="episodes">{{ anime.episodes || '?' }} Episode</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="!animeListLoading && uniqueAnimeList.length > 0" class="pagination">
                    <button v-for="page in totalPages" :key="`page-${page}`" @click="changePage(page)"
                        :class="{ active: currentPage === page }" :disabled="animeListLoading">
                        {{ page }}
                    </button>
                </div>
            </section>
        </main>

        <!-- Anime Modal -->
        <AnimeModal v-if="selectedAnime" :anime="selectedAnime" @close="closeAnimeModal" />
        <div v-if="selectedAnime" class="anime-modal">
            <div class="modal-backdrop" @click="closeAnimeModal"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ selectedAnime.title_english || selectedAnime.title }}</h2>
                    <button @click="closeAnimeModal" class="close-btn">&times;</button>
                </div>

                <div class="modal-body">
                    <div class="modal-left">
                        <img :src="selectedAnime.images.webp.large_image_url" class="modal-poster" loading="lazy" />
                        <div v-if="animeStats.length > 0" class="stats-chart">
                            <div v-for="(stat, index) in animeStats" :key="index" class="chart-bar"
                                :style="{ width: stat.percentage + '%', '--chart-color': `var(--chart-${index + 1})` }">
                                <span class="stat-label">{{ stat.label }}</span>
                                <span class="stat-value">{{ stat.value }}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-right">
                        <div class="anime-details">
                            <p class="synopsis">{{ selectedAnime.synopsis }}</p>
                            <div class="detail-item">
                                <span>Episodes:</span>
                                <span>{{ selectedAnime.episodes || 'N/A' }}</span>
                            </div>
                            <div class="detail-item">
                                <span>Status:</span>
                                <span>{{ selectedAnime.status }}</span>
                            </div>
                            <div class="detail-item">
                                <span>Rating:</span>
                                <span>{{ selectedAnime.rating }}</span>
                            </div>
                        </div>

                        <div class="reviews-section">
                            <h3>Top Reviews</h3>
                            <div v-if="animeReviews.length === 0" class="reviews-loading">
                                <div class="review-skeleton" v-for="i in 3" :key="i"></div>
                            </div>
                            <div v-else v-for="review in animeReviews" :key="review.mal_id" class="review-card">
                                <div class="review-header">
                                    <img :src="review.user.images.jpg.image_url" class="user-avatar" loading="lazy" />
                                    <div class="user-info">
                                        <span class="username">{{ review.user.username }}</span>
                                        <div class="review-score">⭐ {{ review.score }}</div>
                                    </div>
                                </div>
                                <p class="review-text">{{ truncateText(review.review, 150) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="main-footer">
            <div class="footer-content">
                <p>&copy; {{ currentYear }} AnimeStream. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import AnimeModal from './AnimeModal.vue';


export default {
    components: {
        Swiper,
        SwiperSlide
    },
    setup() {
        // State variables
        const searchQuery = ref('');
        const searchResults = ref([]);
        const isSearchLoading = ref(false);

        const topAnime = ref([]);
        const isTopAnimeLoading = ref(true);

        const trendingAnime = ref([]);
        const trendingLoading = ref(true);
        const trendingError = ref(null);

        const scheduleData = ref([]);
        const scheduleLoading = ref(true);
        const scheduleError = ref(null);

        const animeList = ref([]);
        const animeListLoading = ref(true);
        const animeListError = ref(null);

        const selectedAnime = ref(null);
        const animeStats = ref([]);
        const animeReviews = ref([]);

        const currentPage = ref(1);
        const totalPages = ref(5);
        const currentYear = computed(() => new Date().getFullYear());
        const swiperModules = [Navigation];

        // API Endpoints with caching
        const API_BASE_URL = 'https://api.jikan.moe/v4';
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Rate limiting management for Jikan API (60 requests per minute)
        const apiQueue = [];
        const apiRequestInProgress = ref(false);
        const MAX_CONCURRENT_REQUESTS = 1;

        // Cache management
        const getFromCache = (key) => {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }

            localStorage.removeItem(key);
            return null;
        };

        const saveToCache = (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify({
                    timestamp: Date.now(),
                    data
                }));
            } catch (error) {
                console.warn('Error saving to cache:', error);
                // Clear some old cache items if storage is full
                clearOldCacheItems();
            }
        };

        const clearOldCacheItems = () => {
            const keysToPreserve = [
                'top_anime',
                'trending_anime',
                'schedule_data',
                `anime_list_${currentPage.value}`
            ];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('search_') || !keysToPreserve.includes(key)) {
                    localStorage.removeItem(key);
                }
            }
        };

        // API request queue processor to handle rate limiting
        const processApiQueue = async () => {
            if (apiRequestInProgress.value || apiQueue.length === 0) return;

            apiRequestInProgress.value = true;
            const request = apiQueue.shift();

            try {
                const response = await axios(request.config);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            } finally {
                apiRequestInProgress.value = false;
                setTimeout(processApiQueue, 350); // Ensure we stay under rate limit
            }
        };

        // Queue an API request
        const queueApiRequest = (config) => {
            return new Promise((resolve, reject) => {
                apiQueue.push({ config, resolve, reject });
                processApiQueue();
            });
        };

        // Debounce function for search input
        const debounce = (fn, delay) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        };

        // Search anime with debounce to prevent API rate limiting
        const handleSearchInput = debounce(async () => {
            if (searchQuery.value.length < 3) {
                searchResults.value = [];
                return;
            }

            const cacheKey = `search_${searchQuery.value}`;
            const cachedResults = getFromCache(cacheKey);

            if (cachedResults) {
                searchResults.value = cachedResults.slice(0, 5);
                return;
            }

            try {
                isSearchLoading.value = true;
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/anime`,
                    params: {
                        q: searchQuery.value,
                        limit: 5,
                        sfw: true
                    }
                });

                const results = response.data.data;
                searchResults.value = results;
                saveToCache(cacheKey, results);
            } catch (error) {
                console.error("Error searching anime:", error);
            } finally {
                isSearchLoading.value = false;
            }
        }, 400);

        // Select anime from search results
        const selectAnime = (anime) => {
            openAnimeModal(anime);
            searchQuery.value = '';
            searchResults.value = [];
        };

        // Fetch top anime - maintain this component from original code
        const fetchTopAnime = async () => {
            const cacheKey = 'top_anime';
            const cachedAnime = getFromCache(cacheKey);

            if (cachedAnime) {
                topAnime.value = cachedAnime;
                isTopAnimeLoading.value = false;
                return;
            }

            try {
                isTopAnimeLoading.value = true;
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/top/anime`,
                    params: {
                        limit: 10
                    }
                });

                topAnime.value = response.data.data;
                saveToCache(cacheKey, response.data.data);
            } catch (error) {
                console.error('Error fetching top anime:', error);
            } finally {
                isTopAnimeLoading.value = false;
            }
        };

        // Fetch trending anime
        const fetchTrendingAnime = async () => {
            const cacheKey = 'trending_anime';
            const cachedAnime = getFromCache(cacheKey);

            if (cachedAnime) {
                trendingAnime.value = cachedAnime;
                trendingLoading.value = false;
                return;
            }

            try {
                trendingLoading.value = true;
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/anime/season/now`,
                    params: {
                        limit: 10
                    }
                });

                trendingAnime.value = response.data.data;
                saveToCache(cacheKey, response.data.data);
            } catch (error) {
                console.error('Error fetching trending anime:', error);
                trendingError.value = "Gagal memuat anime trending";
            } finally {
                trendingLoading.value = false;
            }
        };

        // Fetch schedule
        const fetchSchedule = async () => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const cacheKey = 'schedule_data';
            const cachedSchedule = getFromCache(cacheKey);

            if (cachedSchedule) {
                scheduleData.value = cachedSchedule;
                scheduleLoading.value = false;
                return;
            }

            try {
                scheduleLoading.value = true;
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/schedules/${today}`,
                    params: {
                        limit: 10
                    }
                });

                scheduleData.value = response.data.data;
                saveToCache(cacheKey, response.data.data);
            } catch (error) {
                console.error('Error fetching schedule:', error);
                scheduleError.value = "Gagal memuat jadwal tayang";
            } finally {
                scheduleLoading.value = false;
            }
        };

        // Fetch anime list with pagination
        const fetchAnimeList = async () => {
            const cacheKey = `anime_list_${currentPage.value}`;
            const cachedList = getFromCache(cacheKey);

            if (cachedList) {
                animeList.value = cachedList;
                animeListLoading.value = false;
                return;
            }

            try {
                animeListLoading.value = true;
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/top/anime`,
                    params: {
                        page: currentPage.value,
                        limit: 24
                    }
                });

                animeList.value = response.data.data;
                totalPages.value = Math.min(response.data.pagination.last_visible_page, 10); // Limit to 10 pages max
                saveToCache(cacheKey, response.data.data);
            } catch (error) {
                console.error('Error fetching anime list:', error);
                animeListError.value = "Gagal memuat daftar anime";
            } finally {
                animeListLoading.value = false;
            }
        };

        // Fetch anime statistics
        const fetchAnimeStats = async (id) => {
            const cacheKey = `stats_${id}`;
            const cachedStats = getFromCache(cacheKey);

            if (cachedStats) {
                animeStats.value = cachedStats;
                return;
            }

            try {
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/anime/${id}/statistics`
                });

                const stats = response.data.data;

                const formattedStats = [
                    { label: 'Completed', value: stats.completed, percentage: (stats.completed / stats.total * 100).toFixed(1) },
                    { label: 'Watching', value: stats.watching, percentage: (stats.watching / stats.total * 100).toFixed(1) },
                    { label: 'Plan to Watch', value: stats.plan_to_watch, percentage: (stats.plan_to_watch / stats.total * 100).toFixed(1) },
                    { label: 'Dropped', value: stats.dropped, percentage: (stats.dropped / stats.total * 100).toFixed(1) },
                    { label: 'On Hold', value: stats.on_hold, percentage: (stats.on_hold / stats.total * 100).toFixed(1) }
                ];

                animeStats.value = formattedStats;
                saveToCache(cacheKey, formattedStats);
            } catch (error) {
                console.error('Error fetching stats:', error);
                animeStats.value = [];
            }
        };

        // Fetch anime reviews
        const fetchAnimeReviews = async (id) => {
            const cacheKey = `reviews_${id}`;
            const cachedReviews = getFromCache(cacheKey);

            if (cachedReviews) {
                animeReviews.value = cachedReviews;
                return;
            }

            try {
                const response = await queueApiRequest({
                    method: 'get',
                    url: `${API_BASE_URL}/anime/${id}/reviews`
                });

                const reviews = response.data.data.slice(0, 3);
                animeReviews.value = reviews;
                saveToCache(cacheKey, reviews);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                animeReviews.value = [];
            }
        };

        // Open anime modal with details
        const openAnimeModal = async (anime) => {
            selectedAnime.value = anime;
            animeStats.value = [];
            animeReviews.value = [];

            // Fetch additional details in parallel
            Promise.all([
                fetchAnimeStats(anime.mal_id),
                fetchAnimeReviews(anime.mal_id)
            ]);
        };

        // Close anime modal
        const closeAnimeModal = () => {
            selectedAnime.value = null;
        };

        // Change page in pagination
        const changePage = (page) => {
            currentPage.value = page;
            fetchAnimeList();

            // Scroll to the top of the anime grid section
            const gridSection = document.querySelector('.anime-grid-section');
            if (gridSection) {
                gridSection.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Load all anime (for view more buttons)
        const loadAllAnime = () => {
            const gridSection = document.querySelector('.anime-grid-section');
            if (gridSection) {
                gridSection.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Text truncation helper
        const truncateText = (text, maxLength) => {
            if (!text) return '';
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        };

        // Handle click outside search results
        const handleClickOutside = (event) => {
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(event.target)) {
                searchResults.value = [];
            }
        };

        // Watch for changes in the current page to update anime list
        watch(currentPage, () => {
            fetchAnimeList();
        });

        // Set up event listeners and initialize data
        onMounted(() => {
            fetchTopAnime();
            fetchTrendingAnime();
            fetchSchedule();
            fetchAnimeList();

            document.addEventListener('click', handleClickOutside);

            // Implement intersection observer for lazy loading images
            const lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            lazyLoadObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '200px',
                threshold: 0.1
            });

            // Apply to all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                lazyLoadObserver.observe(img);
            });
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        return {
            // Search
            searchQuery,
            searchResults,
            isSearchLoading,
            handleSearchInput,
            selectAnime,

            // Top Anime
            topAnime,
            isTopAnime,
            isTopAnimeLoading,

            // Trending
            trendingAnime,
            trendingLoading,
            trendingError,
            fetchTrendingAnime,

            // Schedule
            scheduleData,
            scheduleLoading,
            scheduleError,
            fetchSchedule,

            // Anime List
            animeList,
            animeListLoading,
            animeListError,
            fetchAnimeList,

            // Modal
            selectedAnime,
            animeStats,
            animeReviews,
            openAnimeModal,
            closeAnimeModal,

            // Pagination
            currentPage,
            totalPages,
            changePage,

            // Utilities
            loadAllAnime,
            truncateText,
            currentYear,

            // Swiper config
            swiperModules,
            trendingBreakpoints: {
                320: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },
                1024: {
                    slidesPerView: 5,
                    spaceBetween: 20
                }
            },
            scheduleBreakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 15
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 20
                }
            },

            // Computed properties
            uniqueAnimeList: computed(() => {
                // Filter out duplicates using mal_id as key
                const uniqueIds = new Set();
                return animeList.value.filter(anime => {
                    if (!uniqueIds.has(anime.mal_id)) {
                        uniqueIds.add(anime.mal_id);
                        return true;
                    }
                    return false;
                });
            })
        };
    }
};
</script>


<style lang="css" scoped></style>