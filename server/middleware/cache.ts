import { defineEventHandler, setResponseHeaders } from 'h3'

export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (event.node.req.method !== 'GET') {
    return
  }

  const url = event.node.req.url || ''
  
  // Skip API routes and assets
  if (url.startsWith('/api/') || url.startsWith('/_nuxt/') || url.startsWith('/assets/')) {
    return
  }

  // Default cache headers
  let cacheControl = 'public, max-age=60, s-maxage=60'
  let etag = true
  let lastModified = true

  // Route-specific cache configurations
  if (url === '/' || url === '/index.html') {
    // Homepage - moderate caching
    cacheControl = 'public, max-age=300, s-maxage=300' // 5 minutes
  } else if (url.startsWith('/static/') || url.startsWith('/assets/')) {
    // Static assets - long caching
    cacheControl = 'public, max-age=31536000, s-maxage=31536000, immutable' // 1 year
  } else if (url.startsWith('/profile/')) {
    // Profile pages - short caching
    cacheControl = 'public, max-age=300, s-maxage=300' // 5 minutes
  } else if (url.startsWith('/admin/')) {
    // Admin pages - very short caching
    cacheControl = 'public, max-age=30, s-maxage=30' // 30 seconds
  } else if (url.startsWith('/dashboard/')) {
    // Dashboard - short caching
    cacheControl = 'public, max-age=120, s-maxage=120' // 2 minutes
  } else if (url.startsWith('/posts/') || url.startsWith('/articles/')) {
    // Content pages - longer caching
    cacheControl = 'public, max-age=1800, s-maxage=1800' // 30 minutes
  }

  // Set cache headers
  const headers: Record<string, string> = {
    'Cache-Control': cacheControl,
    'Vary': 'Accept-Encoding',
  }

  // Add ETag support
  if (etag) {
    const etagValue = `"${Buffer.from(url).toString('base64').slice(0, 16)}"`
    headers['ETag'] = etagValue
    
    // Check if client has cached version
    const ifNoneMatch = event.node.req.headers['if-none-match']
    if (ifNoneMatch === etagValue) {
      event.node.res.statusCode = 304
      setResponseHeaders(event, headers)
      return
    }
  }

  // Add Last-Modified support
  if (lastModified) {
    headers['Last-Modified'] = new Date().toUTCString()
  }

  // Set additional security headers
  headers['X-Content-Type-Options'] = 'nosniff'
  headers['X-Frame-Options'] = 'DENY'
  headers['X-XSS-Protection'] = '1; mode=block'

  setResponseHeaders(event, headers)
})
