import pool from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';
import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../utils/config.js';

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
        // Find transaction by order_id directly from orders table
        const [orderResults] = await pool.execute(
          `SELECT id FROM nixty.orders WHERE order_id = ?`,
          [order_id]
        );
        
        if (orderResults.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Transaction not found',
          });
        }
        
        const transactionId = orderResults[0].id;
        
        // transactionId is already set above
        
        // Verify the transaction belongs to the user
        const [userCheck] = await pool.execute(
          `SELECT id FROM nixty.orders WHERE id = ? AND user_id = ?`,
          [transactionId, user.id]
        );
        
        if (userCheck.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Transaction not found or not owned by user',
          });
        }
        
        // Store the not found status in payment_gateway_logs
        const [updateResult] = await pool.execute(
          `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
          ['not_found_in_gateway', transactionId, 'payment_gateway_status']
        );
        
        if (updateResult.affectedRows === 0) {
          await pool.execute(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [transactionId, 'payment_gateway_status', 'not_found_in_gateway']
          );
        }
        
        // Get updated transaction details with payment gateway info
        const [updatedTransaction] = await pool.execute(
          `SELECT 
            o.id, 
            o.product_id, 
            o.quantity, 
            o.total, 
            o.status, 
            o.created_at,
            p.name as product_name
          FROM nixty.orders o
          LEFT JOIN nixty.products p ON o.product_id = p.id
          WHERE o.id = ?`,
          [transactionId]
        );
        
        // Get payment gateway logs
        const [gatewayLogs] = await pool.execute(
          `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
          [transactionId]
        );
        
        // Convert logs to object
        const gatewayData = {};
        gatewayLogs.forEach(log => {
          gatewayData[log.key] = log.value;
        });
        
        return {
          success: true,
          message: 'Transaction marked as not found in gateway',
          data: {
            transaction: {
              ...updatedTransaction[0],
              ...gatewayData
            },
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
    
    // Find the transaction by order_id directly from orders table
    const [orderResults] = await pool.execute(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );
    
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    const transactionId = orderResults[0].id;
    
    // Update transaction status in database
    const [result] = await pool.execute(
      `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
      [newStatus, transactionId, user.id]
    );

    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found or not owned by user',
      });
    }
    
    // Store payment gateway information in payment_gateway_logs
    const gatewayLogs = [
      ['payment_method', midtransResponse.payment_type || null],
      ['payment_gateway_status', midtransResponse.transaction_status],
      ['payment_gateway_payload', JSON.stringify(midtransResponse)]
    ];
    
    for (const [key, value] of gatewayLogs) {
      // First try to update, if no rows affected then insert
      const [updateResult] = await pool.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
        [value, transactionId, key]
      );
      
      if (updateResult.affectedRows === 0) {
        await pool.execute(
          `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
          [transactionId, key, value]
        );
      }
    }

    // Get updated transaction details with payment gateway info
    const [updatedTransaction] = await pool.execute(
      `SELECT 
        o.id, 
        o.product_id, 
        o.quantity, 
        o.total, 
        o.status, 
        o.created_at,
        p.name as product_name
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      WHERE o.id = ?`,
      [transactionId]
    );
    
    // Get payment gateway logs
    const [allGatewayLogs] = await pool.execute(
      `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
      [transactionId]
    );
    
    // Convert logs to object
    const gatewayData = {};
    allGatewayLogs.forEach(log => {
      gatewayData[log.key] = log.value;
    });

    return {
      success: true,
      message: 'Transaction status updated successfully',
      data: {
        transaction: {
          ...updatedTransaction[0],
          ...gatewayData
        },
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