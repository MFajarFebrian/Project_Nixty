import pool from '../../../utils/db.js';
import { requireAuth } from '../../../utils/auth.js';
import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../../utils/config.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    const body = await readBody(event);
    const { order_id } = body;
    
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      });
    }

    // Initialize Midtrans CoreApi
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
    });

    let midtransResponse;
    try {
      // Get transaction status from Midtrans
      midtransResponse = await coreApi.transaction.status(order_id);
    } catch (midtransError) {
      console.log('Midtrans API Error:', midtransError.message);
      
      // If transaction not found in Midtrans, mark it for deletion
      if (midtransError.message && (midtransError.message.includes('404') || midtransError.message.includes('not found'))) {
        // Update transaction to mark as "not found in gateway"
        await pool.execute(
          `UPDATE transactions 
           SET 
             payment_gateway_status = 'not_found_in_gateway',
             updated_at = NOW()
           WHERE order_id = $1 AND user_id = $2`,
          [order_id, user.id]
        );
        
        // Get updated transaction details
        const [updatedTransaction] = await pool.execute(
          `SELECT 
            t.id, 
            t.order_id, 
            t.product_name, 
            t.amount, 
            t.status, 
            t.payment_method, 
            t.payment_gateway_status,
            t.created_at,
            t.updated_at
          FROM transactions t
          WHERE t.order_id = $1 AND t.user_id = $2`,
          [order_id, user.id]
        );
        
        return {
          success: true,
          message: 'Transaction marked as not found in gateway',
          data: {
            transaction: updatedTransaction[0],
            midtrans_response: null,
            not_found_in_gateway: true
          }
        };
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check transaction status with Midtrans',
      });
    }
    
    if (!midtransResponse) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found in Midtrans',
      });
    }

    // Map Midtrans status to our internal status
    const mapMidtransStatus = (midtransStatus, fraudStatus = null) => {
      switch (midtransStatus) {
        case 'settlement':
          return 'completed';
        case 'capture':
          return fraudStatus === 'accept' ? 'completed' : 'pending';
        case 'pending':
          return 'pending';
        case 'deny':
        case 'cancel':
        case 'expire':
        case 'failure':
          return 'failed';
        default:
          return 'pending';
      }
    };

    const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
    
    // Update transaction in database
    const [result] = await pool.execute(
      `UPDATE transactions 
       SET 
         status = ?, 
         payment_method = ?, 
         payment_gateway_status = ?,
         payment_gateway_payload = ?,
         updated_at = NOW()
       WHERE order_id = ? AND user_id = ?`,
      [
        newStatus,
        midtransResponse.payment_type || null,
        midtransResponse.transaction_status,
        JSON.stringify(midtransResponse),
        order_id,
        user.id
      ]
    );

    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found or not owned by user',
      });
    }

    // Get updated transaction details
    const [updatedTransaction] = await pool.execute(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_name, 
        t.amount, 
        t.status, 
        t.payment_method, 
        t.payment_gateway_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE t.order_id = ? AND t.user_id = ?`,
      [order_id, user.id]
    );

    return {
      success: true,
      message: 'Transaction status updated successfully',
      data: {
        transaction: updatedTransaction[0],
        midtrans_response: midtransResponse
      }
    };

  } catch (error) {
    console.error('Error updating transaction status:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    // Handle Midtrans API errors
    if (error.message && error.message.includes('404')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found in Midtrans',
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update transaction status',
    });
  }
});
