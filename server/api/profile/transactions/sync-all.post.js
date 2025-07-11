import pool from '../../../utils/db.js';
import { requireAuth } from '../../../utils/auth.js';
import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../../utils/config.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get all user's transactions that might need status update
    const [transactions] = await pool.execute(
      `SELECT order_id, status, payment_gateway_status 
       FROM transactions 
       WHERE user_id = ? 
       AND status IN ('pending', 'failed') 
       AND order_id IS NOT NULL 
       ORDER BY created_at DESC`,
      [user.id]
    );

    if (transactions.length === 0) {
      return {
        success: true,
        message: 'No pending transactions to sync',
        data: { updated: 0, total: 0 }
      };
    }

    // Initialize Midtrans CoreApi
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
    });

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

    let updatedCount = 0;
    let totalProcessed = 0;
    const results = [];

    // Process each transaction
    for (const transaction of transactions) {
      totalProcessed++;
      
      try {
        // Get transaction status from Midtrans
        const midtransResponse = await coreApi.transaction.status(transaction.order_id);
        
        if (midtransResponse) {
          const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
          
          // Update only if status changed
          if (newStatus !== transaction.status || midtransResponse.transaction_status !== transaction.payment_gateway_status) {
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
                transaction.order_id,
                user.id
              ]
            );
            
            if (result.affectedRows > 0) {
              updatedCount++;
              results.push({
                order_id: transaction.order_id,
                old_status: transaction.status,
                new_status: newStatus,
                gateway_status: midtransResponse.transaction_status
              });
            }
          }
        }
      } catch (error) {
        console.log(`Failed to sync transaction ${transaction.order_id}:`, error.message);
        // Continue with other transactions even if one fails
        results.push({
          order_id: transaction.order_id,
          error: error.message
        });
      }
      
      // Add small delay to avoid overwhelming Midtrans API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: true,
      message: `Successfully synced ${updatedCount} out of ${totalProcessed} transactions`,
      data: {
        updated: updatedCount,
        total: totalProcessed,
        results: results
      }
    };

  } catch (error) {
    console.error('Error syncing transactions:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to sync transactions with Midtrans',
    });
  }
});
