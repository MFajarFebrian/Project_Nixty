import pool from '../../../utils/db';
import { requireAuth } from '../../../utils/auth';
import Midtrans from 'midtrans-client';
import { midtransConfig } from '../../../utils/config.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get request body
    const body = await readBody(event);
    const { transactionId } = body;
    
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required',
      });
    }
    
    // Verify the transaction belongs to this user and is in a valid state for repayment
    const [transactions] = await pool.execute(
      `SELECT 
        t.id, 
        t.order_id,
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.amount,
        t.quantity,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.order_id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    const transaction = transactions[0];
    
    // Check if transaction is in a state that can be repaid
    const validStatuses = ['pending', 'expire', 'cancel', 'failed'];
    const isValidForRepayment = 
      validStatuses.includes(transaction.status.toLowerCase()) || 
      validStatuses.includes(transaction.payment_gateway_status?.toLowerCase());
    
    if (!isValidForRepayment) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This transaction cannot be repaid. It may be already completed or in an invalid state.',
      });
    }
    
    // Initialize Midtrans Snap
    if (!midtransConfig.serverKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Midtrans server key not configured',
      });
    }
    
    let snap = new Midtrans.Snap({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
    });

    // Generate a new order ID by appending timestamp
    const newOrderId = `${transaction.order_id}-repay-${Date.now()}`;
    
    // Create transaction parameters
    const transactionDetails = {
      order_id: newOrderId,
      gross_amount: transaction.amount,
    };

    const itemDetails = [
      {
        id: transaction.product_id,
        name: transaction.product_name,
        price: transaction.amount / (transaction.quantity || 1),
        quantity: transaction.quantity || 1,
      },
    ];

    const customerDetails = {
      first_name: transaction.customer_name || user.name || '',
      email: transaction.email || user.email || '',
    };

    const parameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/finish`,
        unfinish: `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/unfinish`,
        error: `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error`,
      },
    };

    // Create a new transaction in Midtrans
    const transactionToken = await snap.createTransaction(parameter);
    
    // Update the transaction record to note the repayment attempt
    await pool.execute(
      `UPDATE transactions 
       SET payment_gateway_payload = COALESCE(payment_gateway_payload, '{}')::jsonb || 
         jsonb_build_object(
           'repayment_attempts', COALESCE((payment_gateway_payload->>'repayment_attempts')::int, 0) + 1,
           'last_repayment_time', $1,
           'last_repayment_order_id', $2
         )
       WHERE id = $3`,
      [new Date().toISOString(), newOrderId, transaction.id]
    );
    
    // Create a new transaction record for the repayment
    await pool.execute(
      `INSERT INTO transactions (
        order_id, user_id, product_id, product_name, 
        customer_name, email, amount, quantity, status, 
        payment_gateway_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newOrderId,
        user.id,
        transaction.product_id,
        transaction.product_name,
        transaction.customer_name || user.name,
        transaction.email || user.email,
        transaction.amount,
        transaction.quantity || 1,
        'pending',
        JSON.stringify({
          original_transaction_id: transaction.id,
          is_repayment: true,
          original_order_id: transaction.order_id,
          repayment_time: new Date().toISOString()
        })
      ]
    );
    
    // Return the token to the client
    return {
      success: true,
      message: 'Repayment initiated successfully',
      token: transactionToken.token,
      order_id: newOrderId,
      data: {
        client_key: midtransConfig.clientKey
      }
    };
    
  } catch (error) {
    console.error('Error initiating repayment:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to initiate repayment',
    });
  }
});
