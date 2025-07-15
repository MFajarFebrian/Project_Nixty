export default defineNuxtRouteMiddleware((to, from) => {
  // Prevent any cached content from being loaded during navigation
  if (process.client) {
    // Remove any cached elements that might have been left behind
    const cachedElements = document.querySelectorAll('[data-cached]');
    cachedElements.forEach(element => element.remove());
    
    // Clear any stale cache data from the window object
    if (window.pageCache) {
      delete window.pageCache;
    }
  }
});
