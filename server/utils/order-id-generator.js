/**
 * Order ID Generator - Creates Midtrans-style order IDs
 * Generates unique order IDs in the format: NIXTY-XXXXXX-YYYYMMDD-HHMM
 */

import crypto from 'crypto';

/**
 * Generate a unique order ID in Midtrans style
 * @param {Object} options - Options for ID generation
 * @param {string} options.prefix - Prefix for the order ID (default: 'NIXTY')
 * @param {number} options.userId - User ID for uniqueness
 * @param {number} options.productId - Product ID for reference
 * @returns {string} - Generated order ID
 */
export function generateOrderId(options = {}) {
  const {
    prefix = 'NIXTY',
    userId = null,
    productId = null
  } = options;

  const now = new Date();
  
  // Format date as YYYYMMDD
  const dateStr = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0');
  
  // Format time as HHMM
  const timeStr = now.getHours().toString().padStart(2, '0') + 
                 now.getMinutes().toString().padStart(2, '0');
  
  // Generate a unique 6-digit identifier
  // Uses combination of timestamp, userId, and random for uniqueness
  const timestamp = now.getTime();
  const userPart = userId ? userId.toString().padStart(3, '0').slice(-3) : '000';
  const randomPart = crypto.randomInt(100, 999);
  const uniqueId = (timestamp % 1000).toString().padStart(3, '0') + userPart.slice(-3) + randomPart.toString();
  const shortId = uniqueId.slice(-6); // Take last 6 digits
  
  return `${prefix}-${shortId}-${dateStr}-${timeStr}`;
}

/**
 * Generate order ID with product reference
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {string} - Generated order ID
 */
export function generateOrderIdWithProduct(userId, productId) {
  return generateOrderId({
    prefix: 'NIXTY',
    userId,
    productId
  });
}

/**
 * Generate test order ID for failed orders
 * @param {string} status - Order status ('failed', 'pending', etc.)
 * @returns {string} - Generated test order ID
 */
export function generateTestOrderId(status = 'pending') {
  const prefix = status.toUpperCase();
  return generateOrderId({ prefix });
}

/**
 * Parse order ID to extract information
 * @param {string} orderId - Order ID to parse
 * @returns {Object} - Parsed order information
 */
export function parseOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return null;
  }

  const parts = orderId.split('-');
  if (parts.length !== 4) {
    return null;
  }

  const [prefix, uniqueId, dateStr, timeStr] = parts;
  
  // Parse date (YYYYMMDD)
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8));
  
  // Parse time (HHMM)
  const hour = parseInt(timeStr.substring(0, 2));
  const minute = parseInt(timeStr.substring(2, 4));
  
  const createdAt = new Date(year, month, day, hour, minute);
  
  return {
    prefix,
    uniqueId,
    date: dateStr,
    time: timeStr,
    createdAt,
    isValid: !isNaN(createdAt.getTime())
  };
}

/**
 * Validate order ID format
 * @param {string} orderId - Order ID to validate
 * @returns {boolean} - Whether the order ID is valid
 */
export function isValidOrderId(orderId) {
  const parsed = parseOrderId(orderId);
  return parsed && parsed.isValid;
}

// Example usage:
// const orderId = generateOrderId({ userId: 123, productId: 456 });
// console.log(orderId); // NIXTY-123456-20250720-0811
//
// const parsed = parseOrderId(orderId);
// console.log(parsed.createdAt); // Date object
