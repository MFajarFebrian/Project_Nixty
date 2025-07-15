export default defineNuxtPlugin(() => {
  if (process.client) {
    // Clean up any existing page cache data on app start
    try {
      // Clear localStorage cache keys that might be left from the page-cache plugin
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('page-cache-') || key.includes('cache') || key.includes('nuxt'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage cache keys
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('page-cache-') || key.includes('cache') || key.includes('nuxt'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear any potential cached DOM elements
      const cachedElements = document.querySelectorAll('[data-cached="true"]');
      cachedElements.forEach(element => element.remove());
      
      // Clear any page cache related data from window object
      if (window.pageCache) {
        delete window.pageCache;
      }
      
      // Force a hard reload to clear any browser cache if this is the first load
      if (!sessionStorage.getItem('cache-cleared')) {
        sessionStorage.setItem('cache-cleared', 'true');
        // Clear any Nuxt-related cache in the browser
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('nuxt') || cacheName.includes('workbox')) {
                caches.delete(cacheName);
              }
            });
          });
        }
      }
      
      console.log('Cache cleanup completed');
      
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
});
