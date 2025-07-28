import midtransClient from 'midtrans-client';
import { getHeaders } from 'h3';
import { midtransConfig } from '../../utils/config.js';
import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';
import { generateOrderIdWithProduct } from '../../utils/order-id-generator.js';

// Get runtime config for baseUrl
const { public: { baseUrl } } = useRuntimeConfig();

// Function to get current domain from request
function getCurrentDomain(event) {
  const headers = getHeaders(event);
  const host = headers.host || headers['x-forwarded-host'];
  const protocol = headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback to config baseUrl
  return baseUrl;
}

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { product, customer, quantity = 1 } = body;

  // Validate required fields
  if (!product || !customer || !customer.email || !customer.name || !product.id || !product.price) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing required product or customer data.'
    });
  }
  
  // Validate quantity
  if (quantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Quantity must be greater than 0.'
    });
  }
  
  // Validate email format
  if (!customer.email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Invalid email format.'
    });
  }
  
  // Reject any attempt to override payment method - let Midtrans handle payment options
  if (body.payment_method || body.enabled_payments) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Payment method cannot be overridden.'
    });
  }

  // Authenticate the user - authentication is required
  const user = await requireAuth(event);
  
  // Check stock availability from product_license_base
  try {
    const [stockResult] = await db.query(
      `SELECT 
        COUNT(*) as total_licenses,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = $1`,
      [product.id]
    );
    
    if (stockResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product is out of stock.'
      });
    }
    
    const availableStock = parseInt(stockResult[0].available_stock || 0);
    
    if (availableStock < quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `Not enough stock available. Requested: ${quantity}, Available: ${availableStock}`
      });
    }
    
    console.log(`Stock check passed: ${availableStock} available, ${quantity} requested`);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error checking stock:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify product stock.'
    });
  }

  // 1. Create a unique order ID using the proper generator
  const order_id = generateOrderIdWithProduct(user.id, product.id);

  // 2. Prepare transaction parameters for Midtrans
  const parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: Math.round(product.price) * quantity
    },
    item_details: [{
      id: product.id,
      price: Math.round(product.price),
      quantity: quantity,
      name: `${product.name} ${product.version}`.substring(0, 50), // Max 50 chars
      category: product.category ? product.category.name : 'Digital Product',
      merchant_name: 'Nixty'
    }],
    customer_details: {
      first_name: customer.name.split(' ')[0],
      last_name: customer.name.split(' ').slice(1).join(' ') || customer.name.split(' ')[0],
      email: customer.email,
    },
    // Enable all available payment methods (let user choose)
    // enabled_payments will be determined by Midtrans dashboard settings
  };

  // Add dynamic callback URLs using current domain
  const currentDomain = getCurrentDomain(event);
  parameter.callbacks = {
    finish: `${currentDomain}/payment/finish`,
    unfinish: `${currentDomain}/payment/unfinish`,
    error: `${currentDomain}/payment/error`
  };
  
  console.log('Using callback URLs for domain:', currentDomain);

  // 3. Get Snap token from Midtrans
  let snapToken, midtransResponse;
  try {
    console.log('Midtrans config being used:', {
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey ? midtransConfig.serverKey.substring(0, 10) + '...' : 'MISSING',
      clientKey: midtransConfig.clientKey ? midtransConfig.clientKey.substring(0, 10) + '...' : 'MISSING'
    });
    console.log('Transaction parameter being sent to Midtrans:', JSON.stringify(parameter, null, 2));
    
    snapToken = await snap.createTransactionToken(parameter);
    
    // Create initial response for database
    midtransResponse = {
      status_code: "201",
      transaction_id: null, // Will be updated via webhook
      gross_amount: (product.price * quantity).toString(),
      currency: "IDR",
      order_id: order_id,
      payment_type: null, // Will be updated when user selects payment method
      transaction_status: "pending",
      fraud_status: "accept",
      status_message: "Success, transaction is found",
      merchant_id: midtransConfig.merchantId || "G454677231",
      transaction_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      created_at: new Date().toISOString(),
      custom_email: customer.email // Store the custom email for license delivery
    };
    
    console.log('Midtrans transaction created:', {
      token: snapToken,
      order_id: order_id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Midtrans API Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get payment token from Midtrans.'
    });
  }

  // 4. Insert transaction into database with proper Midtrans response
  try {
    const [result] = await db.query(
      `INSERT INTO nixty.orders (user_id, product_id, quantity, total, status, order_id) 
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id`,
      [
        user.id, 
        product.id, 
        quantity, 
        product.price * quantity,
        order_id
      ]
    );
    
    const transactionId = result.length > 0 ? result[0].id : null;
    console.log('Transaction created with ID:', transactionId, 'for user ID:', user.id);
    
    // Store payment gateway logs
    if (transactionId) {
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES ($1, $2, $3)`,
        [transactionId, 'midtrans_order_id', order_id]
      );
      
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES ($1, $2, $3)`,
        [transactionId, 'midtrans_response', JSON.stringify(midtransResponse)]
      );
      
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES ($1, $2, $3)`,
        [transactionId, 'customer_email', customer.email]
      );
      
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES ($1, $2, $3)`,
        [transactionId, 'custom_email', body.custom_email || customer.email]
      );
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create transaction record.'
    });
  }

  // 5. Return the token and order ID
  return { token: snapToken, order_id };
}); 