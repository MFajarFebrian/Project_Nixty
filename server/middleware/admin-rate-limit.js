/**
 * Rate limiting middleware for admin endpoints
 */

// Simple in-memory rate limiting store
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Max 100 requests per window per IP
  adminWindowMs: 5 * 60 * 1000, // 5 minutes for admin endpoints
  adminMaxRequests: 50 // Max 50 requests per window for admin endpoints
};

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get rate limit info for an IP
 */
function getRateLimitInfo(ip, isAdmin = false) {
  const key = `${ip}:${isAdmin ? 'admin' : 'general'}`;
  const now = Date.now();
  const windowMs = isAdmin ? RATE_LIMIT_CONFIG.adminWindowMs : RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = isAdmin ? RATE_LIMIT_CONFIG.adminMaxRequests : RATE_LIMIT_CONFIG.maxRequests;
  
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Create new or reset expired rate limit data
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs,
      maxRequests
    };
    rateLimitStore.set(key, rateLimitData);
  }
  
  return rateLimitData;
}

/**
 * Check if request should be rate limited
 */
function shouldRateLimit(ip, isAdmin = false) {
  const rateLimitData = getRateLimitInfo(ip, isAdmin);
  
  if (rateLimitData.count >= rateLimitData.maxRequests) {
    return {
      limited: true,
      resetTime: rateLimitData.resetTime,
      remaining: 0,
      total: rateLimitData.maxRequests
    };
  }
  
  // Increment count
  rateLimitData.count++;
  
  return {
    limited: false,
    resetTime: rateLimitData.resetTime,
    remaining: rateLimitData.maxRequests - rateLimitData.count,
    total: rateLimitData.maxRequests
  };
}

/**
 * Get client IP address
 */
function getClientIP(event) {
  // Check various headers for the real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip'
  ];
  
  for (const header of headers) {
    const value = getHeader(event, header);
    if (value) {
      // Take the first IP if there are multiple
      return value.split(',')[0].trim();
    }
  }
  
  // Fallback to connection remote address
  return event.node.req.socket?.remoteAddress || 'unknown';
}

// Paths to exclude from rate limiting
const excludedPaths = [
  '/api/home-page',
  '/api/products/group/', // Exclude product group lookups
  '/api/products/'       // Exclude single product lookups by slug/id
];

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';

  // Only apply rate limiting to API routes
  if (!url.startsWith('/api/')) {
    return;
  }
  
  // Check if the path should be excluded
  if (excludedPaths.some(path => url.startsWith(path))) {
    return;
  }

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup on each request
    cleanupExpiredEntries();
  }
  
  const isAdminEndpoint = url.startsWith('/api/admin/');
  const clientIP = getClientIP(event);
  
  // Check rate limit
  const rateLimitResult = shouldRateLimit(clientIP, isAdminEndpoint);
  
  // Add rate limit headers
  setHeader(event, 'X-RateLimit-Limit', rateLimitResult.total.toString());
  setHeader(event, 'X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  setHeader(event, 'X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());
  
  if (rateLimitResult.limited) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    setHeader(event, 'Retry-After', retryAfter.toString());
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        error: 'Rate limit exceeded',
        retryAfter,
        limit: rateLimitResult.total,
        resetTime: rateLimitResult.resetTime
      }
    });
  }
});
