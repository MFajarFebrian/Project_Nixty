/**
 * Simple in-memory cache utility to reduce database calls
 * This helps prevent 429 Too Many Requests errors
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache with expiry
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttl = 300) {
    const expiry = Date.now() + (ttl * 1000);
    
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set cache item
    this.cache.set(key, { value, expiry });

    // Set cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists and not expired
   */
  has(key) {
    return this.get(key) !== null;
  }
}

// Create singleton instance
const cache = new SimpleCache();

/**
 * Cache wrapper for async functions
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh result
 */
export async function cached(key, fn, ttl = 300) {
  // Try to get from cache first
  const cachedResult = cache.get(key);
  if (cachedResult !== null) {
    console.log(`Cache HIT for key: ${key}`);
    return cachedResult;
  }

  console.log(`Cache MISS for key: ${key}`);
  
  // Execute function and cache result
  try {
    const result = await fn();
    cache.set(key, result, ttl);
    return result;
  } catch (error) {
    console.error(`Error executing function for cache key ${key}:`, error);
    throw error;
  }
}

/**
 * Invalidate cache by key or pattern
 * @param {string|RegExp} keyOrPattern - Key or pattern to invalidate
 */
export function invalidateCache(keyOrPattern) {
  if (typeof keyOrPattern === 'string') {
    cache.delete(keyOrPattern);
    console.log(`Cache invalidated for key: ${keyOrPattern}`);
  } else if (keyOrPattern instanceof RegExp) {
    // Invalidate all keys matching pattern
    let count = 0;
    for (const key of cache.cache.keys()) {
      if (keyOrPattern.test(key)) {
        cache.delete(key);
        count++;
      }
    }
    console.log(`Cache invalidated for ${count} keys matching pattern: ${keyOrPattern}`);
  }
}

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size(),
    keys: Array.from(cache.cache.keys()),
    hitRate: 'Not implemented' // Could add hit/miss tracking
  };
}

export default cache;
