import crypto from 'crypto';

/**
 * Verify the signature sent by Midtrans in the notification
 * 
 * @param {string} orderId - The order ID from the notification
 * @param {string} statusCode - The status code from the notification
 * @param {string} grossAmount - The gross amount from the notification
 * @param {string} serverKey - Midtrans server key
 * @returns {Promise<string>} - The expected signature
 */
export async function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  try {
    const stringToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(stringToSign).digest('hex');
    return hash;
  } catch (error) {
    console.error('Error verifying signature:', error);
    throw error;
  }
}

/**
 * Get Midtrans API URL based on environment
 * 
 * @param {boolean} isProduction - Whether to use production or sandbox URL
 * @returns {string} - The Midtrans API URL
 */
export function getMidtransApiUrl(isProduction) {
  return isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';
}

/**
 * Format price for Midtrans (integer without decimal points)
 * 
 * @param {number} price - The price to format
 * @returns {number} - The formatted price as integer
 */
export function formatPrice(price) {
  return Math.round(price);
}
