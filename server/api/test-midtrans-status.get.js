import midtransClient from 'midtrans-client';
import { midtransConfig } from '../utils/config.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  console.log('Testing Midtrans configuration...');
  console.log('Config:', {
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey ? '***' + midtransConfig.serverKey.slice(-4) : 'Not set',
    clientKey: midtransConfig.clientKey ? '***' + midtransConfig.clientKey.slice(-4) : 'Not set'
  });

  // Test with a dummy order ID
  const testOrderId = query.order_id || 'ORDER-TEST-123';
  
  try {
    let coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
    });

    console.log('Testing with order ID:', testOrderId);
    const transactionStatus = await coreApi.transaction.status(testOrderId);
    
    return {
      success: true,
      message: 'Midtrans API is working correctly',
      data: transactionStatus,
      config: {
        isProduction: midtransConfig.isProduction,
        serverKeyLength: midtransConfig.serverKey ? midtransConfig.serverKey.length : 0
      }
    };
  } catch (error) {
    console.error('Midtrans API test failed:', error);
    
    return {
      success: false,
      message: 'Midtrans API test failed',
      error: error.message,
      config: {
        isProduction: midtransConfig.isProduction,
        serverKeyLength: midtransConfig.serverKey ? midtransConfig.serverKey.length : 0
      }
    };
  }
});
