import midtransClient from 'midtrans-client';
import { midtransConfig } from '~/server/utils/config';
import db from '~/server/utils/db';

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { product, customer, custom_email, quantity = 1 } = body;

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
  
  // Validate custom email if provided
  if (custom_email && !custom_email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Invalid custom email format.'
    });
  }
  
  // Reject any attempt to override payment method - only QRIS is allowed
  if (body.payment_method || body.enabled_payments) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Payment method cannot be overridden. Only QRIS is supported.'
    });
  }

  // 1. Create a unique order ID
  const order_id = `NIXTY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // 2. Insert initial transaction into the database
  try {
    const [result] = await db.execute(
      `INSERT INTO transactions (order_id, product_id, product_name, email, amount, status, payment_method, customer_name, payment_gateway_payload)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [order_id, product.id, `${product.name} ${product.version}`, customer.email, product.price * quantity, 'midtrans', customer.name, JSON.stringify({ custom_email: custom_email || customer.email, quantity: quantity })]
    );
    console.log('Transaction created with ID:', result.insertId);
  } catch (error) {
    console.error('Database Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create transaction record.'
    });
  }
  
  // 3. Prepare transaction parameters for Midtrans
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
    enabled_payments: ["qris"],
  };

  // 4. Get Snap token from Midtrans
  try {
    const token = await snap.createTransactionToken(parameter);
    return { token, order_id };
  } catch (error) {
    console.error('Midtrans API Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get payment token from Midtrans.'
    });
  }
}); 