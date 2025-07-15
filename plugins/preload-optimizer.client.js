export default defineNuxtPlugin(() => {
  if (process.client) {
    // Wait for DOM to be ready
    const optimizePreloads = () => {
      // Find all preload links
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      
      preloadLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove preload for dev.json as it's causing the warning
        if (href && href.includes('dev.json')) {
          console.log('Removing preload for dev.json to prevent warning');
          link.remove();
          return;
        }
        
        // Ensure proper 'as' attribute for other resources
        if (href && !link.getAttribute('as')) {
          if (href.includes('.js')) {
            link.setAttribute('as', 'script');
          } else if (href.includes('.css')) {
            link.setAttribute('as', 'style');
          } else if (href.includes('.json')) {
            link.setAttribute('as', 'fetch');
            link.setAttribute('crossorigin', 'anonymous');
          }
        }
      });
    };
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizePreloads);
    } else {
      optimizePreloads();
    }
    
    // Also run on page navigation
    if (window.nuxtApp) {
      window.nuxtApp.hook('page:start', optimizePreloads);
    }
  }
});
