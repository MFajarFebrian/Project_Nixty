import pool from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';
import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../utils/config.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get request body to check if this is an auto-sync
    let body = {};
    try {
      body = await readBody(event);
    } catch (e) {
      // No body provided, use defaults
      body = {};
    }
    const isAutoSync = body && body.auto_sync === true;
    const syncLimit = isAutoSync ? 5 : 100;
    const specificTransactionIds = (body && body.transactionIds) || [];
    
    // Get pending/failed orders that might need status update
    const [orders] = await pool.query(
      `SELECT id, status, created_at
       FROM nixty.orders 
       WHERE user_id = ? 
       AND status IN ('pending', 'failed') 
       ORDER BY created_at DESC
       LIMIT ?`,
      [user.id, syncLimit]
    );

    if (orders.length === 0) {
      return {
        success: true,
        message: 'No orders to sync',
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
    const updated = [];

    // Process each order
    for (const order of orders) {
      totalProcessed++;
      
      try {
        // Get order_id from payment_gateway_logs if exists, otherwise generate one
        let order_id;
        const [existingOrderId] = await pool.query(
          `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'order_id' LIMIT 1`,
          [order.id]
        );
        
        if (existingOrderId.length > 0) {
          order_id = existingOrderId[0].value;
        } else {
          order_id = `ORDER_${order.id}_${Date.now()}`;
          // Store the generated order_id
          await pool.query(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [order.id, 'order_id', order_id]
          );
        }
        
        console.log(`Syncing order ${order.id} with order_id: ${order_id}`);
        
        // Get transaction status from Midtrans
        try {
          const midtransResponse = await coreApi.transaction.status(order_id);
          
          if (midtransResponse) {
            const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
            
            // Update only if status changed
            if (newStatus !== order.status) {
              const [result] = await pool.query(
                `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
                [newStatus, order.id, user.id]
              );
              
              if (result.affectedRows > 0) {
                // Store payment gateway information in payment_gateway_logs
                const gatewayLogs = [
                  ['payment_method', midtransResponse.payment_type || null],
                  ['payment_gateway_status', midtransResponse.transaction_status],
                  ['payment_gateway_payload', JSON.stringify(midtransResponse)]
                ];
                
                for (const [key, value] of gatewayLogs) {
                  const [updateResult] = await pool.query(
                    `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                    [value, order.id, key]
                  );
                  
                  if (updateResult.affectedRows === 0) {
                    await pool.query(
                      `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                      [order.id, key, value]
                    );
                  }
                }
                
                updatedCount++;
                updated.push(order.id);
                results.push({
                  id: order.id,
                  order_id: order_id,
                  old_status: order.status,
                  new_status: newStatus,
                  gateway_status: midtransResponse.transaction_status
                });
                
                // If order is now completed, check if we need to process licenses
                if (newStatus === 'completed' && order.status !== 'completed') {
                  await processLicensesIfNeeded(order.id);
                }
              }
            }
          }
        } catch (midtransError) {
          // Handle 404 errors specially - transaction doesn't exist in Midtrans
          if (midtransError.httpStatusCode === 404 || 
              (midtransError.message && midtransError.message.includes("404") && 
               midtransError.message.includes("doesn't exist"))) {
            
            console.log(`Order ${order.id} (${order_id}) not found in Midtrans - marking as failed`);
            
            // Mark order as failed since it doesn't exist in Midtrans
            const [updateResult] = await pool.query(
              `UPDATE nixty.orders SET status = 'failed' WHERE id = ? AND user_id = ?`,
              [order.id, user.id]
            );
            
            if (updateResult.affectedRows > 0) {
              // Store the not found status in payment_gateway_logs
              const [logUpdateResult] = await pool.query(
                `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                ['not_found_in_gateway', order.id, 'payment_gateway_status']
              );
              
              if (logUpdateResult.affectedRows === 0) {
                await pool.query(
                  `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                  [order.id, 'payment_gateway_status', 'not_found_in_gateway']
                );
              }
              
              results.push({
                id: order.id,
                order_id: order_id,
                status: 'failed',
                message: 'Order not found in Midtrans - marked as failed'
              });
            }
            
            continue;
          }
          
          // Re-throw other errors to be caught by the outer catch block
          throw midtransError;
        }
      } catch (error) {
        console.log(`Failed to sync order ${order.id}:`, error.message);
        // Continue with other orders even if one fails
        results.push({
          id: order.id,
          error: error.message
        });
      }
      
      // Add small delay to avoid overwhelming Midtrans API
      await new Promise(resolve => setTimeout(resolve, isAutoSync ? 50 : 100));
    }

    return {
      success: true,
      message: `Successfully synced ${updatedCount} out of ${totalProcessed} orders`,
      updated,
      data: {
        updated: updatedCount,
        total: totalProcessed,
        auto_sync: isAutoSync,
        results: results
      }
    };

  } catch (error) {
    console.error('Error syncing orders:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to sync orders with Midtrans',
    });
  }
});

// Helper function to process licenses for newly completed orders
async function processLicensesIfNeeded(orderId) {
  try {
    // Check if order already has licenses
    const [existingLicenses] = await pool.query(
      `SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = ?`,
      [orderId]
    );
    
    if (existingLicenses[0].count === 0) {
      console.log(`Order ${orderId} completed but has no licenses. Processing now...`);
      
      // Get order details
      const [orderDetails] = await pool.query(
        `SELECT product_id, quantity FROM nixty.orders WHERE id = ?`,
        [orderId]
      );
      
      if (orderDetails.length === 0) {
        console.log(`Order ${orderId} not found`);
        return false;
      }
      
      const order = orderDetails[0];
      const quantity = order.quantity || 1;
      
      // Process licenses directly using your schema
      for (let i = 0; i < quantity; i++) {
        // Get an available license for this product
        const [availableLicense] = await pool.query(
          `SELECT id FROM nixty.product_license_base 
           WHERE product_id = ? AND status = 'available' 
           LIMIT 1`,
          [order.product_id]
        );
        
        if (availableLicense.length > 0) {
          // Mark license as used and link to order
          await pool.query(
            `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
            [availableLicense[0].id]
          );
          
          await pool.query(
            `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
            [orderId, availableLicense[0].id]
          );
          
          console.log(`Successfully assigned license ${availableLicense[0].id} to order ${orderId}`);
        } else {
          console.error(`No available licenses found for product ${order.product_id}`);
          break;
        }
      }
    } else {
      console.log(`Order ${orderId} already has ${existingLicenses[0].count} license(s)`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing licenses for order ${orderId}:`, error);
    return false;
  }
}
