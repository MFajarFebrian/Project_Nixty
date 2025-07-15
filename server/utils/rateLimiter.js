/**
 * Simple rate limiter to prevent 429 Too Many Requests errors
 * This tracks requests per IP address
 */

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) { // 100 requests per minute by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
    this.cleanup();
  }

  /**
   * Check if request is allowed
   * @param {string} ip - Client IP address
   * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip) {
    const now = Date.now();
    const key = ip;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 0, resetTime: now + this.windowMs });
    }

    const requestData = this.requests.get(key);

    // Reset if window has passed
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + this.windowMs;
    }

    // Check if limit exceeded
    if (requestData.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime
      };
    }

    // Increment and allow
    requestData.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, this.windowMs);
  }

  /**
   * Get current stats
   * @returns {object} - Rate limiter statistics
   */
  getStats() {
    return {
      totalTrackedIPs: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}

// Create global rate limiter instances
const apiLimiter = new RateLimiter(60, 60000); // 60 requests per minute for API endpoints
const adminLimiter = new RateLimiter(30, 60000); // 30 requests per minute for admin endpoints

/**
 * Rate limiter middleware
 * @param {string} type - 'api' or 'admin'
 * @returns {Function} - Middleware function
 */
export function rateLimiter(type = 'api') {
  const limiter = type === 'admin' ? adminLimiter : apiLimiter;
  
  return (event) => {
    const ip = getClientIP(event) || 'unknown';
    const result = limiter.check(ip);
    
    if (!result.allowed) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests - Rate limit exceeded',
        data: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }
      });
    }
    
    // Add rate limit headers
    setHeaders(event, {
      'X-RateLimit-Limit': limiter.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });
    
    return result;
  };
}

/**
 * Get client IP address
 * @param {Object} event - Nuxt event object
 * @returns {string} - Client IP address
 */
function getClientIP(event) {
  // Try various headers that might contain the real IP
  const headers = getHeaders(event);
  return headers['x-forwarded-for']?.split(',')[0] || 
         headers['x-real-ip'] || 
         headers['x-client-ip'] || 
         event.node?.req?.connection?.remoteAddress ||
         event.node?.req?.socket?.remoteAddress ||
         'unknown';
}

/**
 * Get rate limiter statistics
 * @returns {object} - Statistics for all rate limiters
 */
export function getRateLimiterStats() {
  return {
    api: apiLimiter.getStats(),
    admin: adminLimiter.getStats()
  };
}

export default rateLimiter;
