import midtransClient from 'midtrans-client';
import { midtransConfig } from '~/server/utils/config';
import db from '~/server/utils/db';
import { requireAuth } from '~/server/utils/auth';

// Get runtime config for baseUrl
const { public: { baseUrl } } = useRuntimeConfig();

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
  
  // Check stock availability
  try {
    const [stockResult] = await db.execute(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [product.id]
    );
    
    if (stockResult.length === 0 || !stockResult[0].available_stock) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product is out of stock.'
      });
    }
    
    const availableStock = parseInt(stockResult[0].available_stock);
    
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

  // 1. Create a unique order ID
  const order_id = `NIXTY-${Date.now()}-${product.id}`;

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

  // Add dynamic callback URLs
  parameter.callbacks = {
    finish: `${baseUrl}/payment/finish`,
    unfinish: `${baseUrl}/payment/unfinish`,
    error: `${baseUrl}/payment/error`
  };

  // 3. Get Snap token from Midtrans
  let snapToken, midtransResponse;
  try {
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
    const [result] = await db.execute(
      `INSERT INTO transactions (user_id, order_id, product_id, product_name, email, amount, quantity, status, payment_method, customer_name, payment_gateway_status, payment_gateway_payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?) RETURNING id`,
      [
        user.id, 
        order_id, 
        product.id, 
        `${product.name} ${product.version}`, 
        customer.email, 
        product.price * quantity, 
        quantity, 
        'midtrans', // Will be updated via webhook with actual payment method
        customer.name, 
        'pending',
        midtransResponse // Pass object directly for PostgreSQL JSONB
      ]
    );
    console.log('Transaction created with ID:', result.length > 0 ? result[0].id : 'unknown', 'for user ID:', user.id);
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