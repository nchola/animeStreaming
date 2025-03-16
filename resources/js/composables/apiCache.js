// src/composables/apiCache.js

import { reactive } from 'vue';

// Create a reactive cache object that can be injected into components
export const apiCache = reactive({
  value: new Map(),
  
  // Get a cached item with optional expiry check
  get(key, maxAge = 3600000) { // default maxAge: 1 hour
    if (!this.value.has(key)) return null;
    
    const cachedItem = this.value.get(key);
    const now = Date.now();
    
    // Return null if cache is expired
    if (now - cachedItem.timestamp > maxAge) {
      return null;
    }
    
    return cachedItem.data;
  },
  
  // Set a cached item
  set(key, data) {
    this.value.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  // Check if cache has a valid (non-expired) item
  has(key, maxAge = 3600000) {
    if (!this.value.has(key)) return false;
    
    const cachedItem = this.value.get(key);
    const now = Date.now();
    
    return now - cachedItem.timestamp <= maxAge;
  },
  
  // Delete a cached item
  delete(key) {
    this.value.delete(key);
  },
  
  // Clear all cached items
  clear() {
    this.value.clear();
  }
});

// Export a fetch wrapper with rate limiting and caching
export const fetchWithCache = async (url, options = {}) => {
  const { 
    maxAge = 3600000, // 1 hour default
    rateLimit = 350,  // 350ms default (approximately 3 requests per second)
    retryDelay = 1000, // 1 second default
    maxRetries = 3    // 3 retries default
  } = options;
  
  let retries = 0;
  
  const attemptFetch = async () => {
    try {
      // Check cache first
      const cachedData = apiCache.get(url, maxAge);
      if (cachedData) {
        return cachedData;
      }
      
      // Add rate limiting delay
      await new Promise(resolve => setTimeout(resolve, rateLimit));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429 && retries < maxRetries) {
          // Rate limited, retry with longer delay
          retries++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          return attemptFetch();
        }
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      apiCache.set(url, data);
      
      return data;
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
        return attemptFetch();
      }
      throw error;
    }
  };
  
  return attemptFetch();
};

export default apiCache;