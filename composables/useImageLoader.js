import { ref } from 'vue';

// A reactive set to store URLs that have failed to load.
// This is defined in the module scope to act as a global, session-long cache.
const failedImageUrls = ref(new Set());

// Embed the grey SVG as a Data URI for maximum reliability.
// This prevents the placeholder itself from ever failing to load.
const placeholder = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23E0E0E0" /><text x="50" y="55" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="%23999999">No Image</text></svg>';

export function useImageLoader() {

  /**
   * Handles the error event for an image tag.
   * Caches the bad URL and forcefully replaces the image source with a placeholder.
   * @param {Event} event - The error event from the <img> tag.
   * @param {string} url - The URL of the image that failed to load.
   */
  const handleImageError = (event, url) => {
    // If the URL is already the placeholder, do nothing to prevent infinite loops.
    if (event.target.src.includes(placeholder)) {
      return;
    }

    console.warn(`Image at ${url} failed. Replacing with placeholder.`);
    
    // Add the failed URL to our reactive set to prevent future attempts.
    if (url && !failedImageUrls.value.has(url)) {
      const updatedSet = new Set(failedImageUrls.value);
      updatedSet.add(url);
      failedImageUrls.value = updatedSet;
    }
    
    // Force the browser to render the placeholder.
    event.target.src = placeholder;
  };

  /**
   * Returns a safe image URL.
   * Checks against the cache of failed URLs.
   * @param {string} url - The original image URL.
   * @returns {string} The safe URL to use in an <img> src attribute.
   */
  const getImageUrl = (url) => {
    if (!url || failedImageUrls.value.has(url)) {
      return placeholder;
    }
    return url;
  };

  return {
    getImageUrl,
    handleImageError,
  };
} 