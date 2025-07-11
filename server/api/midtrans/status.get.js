import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../utils/config.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;

  console.log('Received request to check status for order:', orderId);

  if (!orderId) {
    console.error('Order ID is required but not provided');
    throw createError({
      statusCode: 400,
      message: 'Order ID is required',
    });
  }

  // Initialize Midtrans CoreApi using config
  let coreApi = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey,
  });

  try {
    console.log('Calling Midtrans API for order:', orderId);
    const transactionStatus = await coreApi.transaction.status(orderId);
    console.log('Midtrans API response:', transactionStatus);
    
    return {
      success: true,
      data: transactionStatus,
    };
  } catch (error) {
    console.error(`Error fetching Midtrans transaction status for order ${orderId}:`, error);
    
    // Return a more user-friendly error response instead of throwing
    return {
      success: false,
      message: error.message || 'Failed to fetch transaction status',
      error: error
    };
  }
});
