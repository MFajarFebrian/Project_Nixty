/**
 * Admin security utilities
 */

/**
 * SQL injection prevention - validate column names
 */
export function validateColumnName(columnName, allowedColumns) {
  if (!columnName || typeof columnName !== 'string') {
    throw new Error('Invalid column name');
  }
  
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
    throw new Error('Invalid column name format');
  }
  
  // Check against allowed columns if provided
  if (allowedColumns && !allowedColumns.includes(columnName)) {
    throw new Error('Column not allowed');
  }
  
  return columnName;
}

/**
 * Validate sort order
 */
export function validateSortOrder(sortOrder) {
  const validOrders = ['ASC', 'DESC', 'asc', 'desc'];
  if (!validOrders.includes(sortOrder)) {
    return 'ASC';
  }
  return sortOrder.toUpperCase();
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return query
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Check for suspicious patterns in input
 */
export function detectSuspiciousPatterns(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const suspiciousPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /script\s*>/i,
    /<\s*script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}



/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Hash sensitive data
 */
export function hashSensitiveData(data) {
  // Simple hash function for non-password data
  let hash = 0;
  if (data.length === 0) return hash;
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
}

/**
 * Audit log entry structure
 */
export function createAuditLogEntry(action, tableName, recordId, userId, changes = null) {
  return {
    timestamp: new Date().toISOString(),
    action, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
    tableName,
    recordId,
    userId,
    changes,
    ip: null, // To be filled by caller
    userAgent: null // To be filled by caller
  };
}

/**
 * Log admin action (simple console logging - could be extended to database)
 */
export function logAdminAction(auditEntry) {
  console.log('ADMIN_AUDIT:', JSON.stringify(auditEntry));
  
  // In a production environment, you might want to:
  // 1. Store in a separate audit log database
  // 2. Send to a logging service
  // 3. Write to a file
  // 4. Send alerts for critical actions
}

/**
 * Check if action requires additional confirmation
 */
export function requiresConfirmation(action, tableName, recordId) {
  const criticalActions = {
    'DELETE': ['users', 'products', 'categories'],
    'UPDATE': ['users'] // Only for admin users
  };
  
  if (criticalActions[action] && criticalActions[action].includes(tableName)) {
    return true;
  }
  
  return false;
}

/**
 * Validate admin session (placeholder for future session management)
 */
export function validateAdminSession(sessionToken) {
  // This is a placeholder - in a real application you would:
  // 1. Validate the session token
  // 2. Check if it's expired
  // 3. Verify the user still has admin privileges
  // 4. Update last activity timestamp
  
  if (!sessionToken) {
    throw new Error('No session token provided');
  }
  
  // For now, just check if it's a non-empty string
  if (typeof sessionToken !== 'string' || sessionToken.length < 10) {
    throw new Error('Invalid session token');
  }
  
  return true;
}

/**
 * Security headers for admin responses
 */
export function setSecurityHeaders(event) {
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  setHeader(event, 'X-Frame-Options', 'DENY');
  setHeader(event, 'X-XSS-Protection', '1; mode=block');
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
  setHeader(event, 'Content-Security-Policy', "default-src 'self'");
}

/**
 * Validate request origin (CSRF protection)
 */
export function validateRequestOrigin(event) {
  const origin = getHeader(event, 'origin');
  const referer = getHeader(event, 'referer');
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Add your allowed origins here
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    throw new Error('Invalid request origin');
  }
  
  return true;
}
