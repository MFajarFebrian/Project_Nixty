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

    // First, determine if order_id is a database ID or a Midtrans order ID
    let transactionId;
    let midtransOrderId;

    // Check if it's a numeric database ID
    if (!isNaN(order_id)) {
      // It's a database ID, get the Midtrans order ID
      const [orderResults] = await pool.query(
        `SELECT id FROM nixty.orders WHERE id = ? AND user_id = ?`,
        [parseInt(order_id), user.id]
      );
      
      if (orderResults.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Transaction not found or not owned by user',
        });
      }
      
      transactionId = orderResults[0].id;
      
      // Get the Midtrans order ID from payment_gateway_logs
      const [existingOrderId] = await pool.query(
        `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'order_id' LIMIT 1`,
        [transactionId]
      );
      
      if (existingOrderId.length > 0) {
        midtransOrderId = existingOrderId[0].value;
      } else {
        // Generate one if it doesn't exist
        midtransOrderId = `ORDER_${transactionId}_${Date.now()}`;
        await pool.query(
          `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
          [transactionId, 'order_id', midtransOrderId]
        );
      }
    } else {
      // It's already a Midtrans order ID
      midtransOrderId = order_id;
      const [orderResults] = await pool.query(
        `SELECT id FROM nixty.orders WHERE order_id = ? AND user_id = ?`,
        [order_id, user.id]
      );
      
      if (orderResults.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Transaction not found or not owned by user',
        });
      }
      
      transactionId = orderResults[0].id;
    }

    let midtransResponse;
    try {
      // Get transaction status from Midtrans using the Midtrans order ID
      midtransResponse = await coreApi.transaction.status(midtransOrderId);
    } catch (midtransError) {
      console.log('Midtrans API Error:', midtransError.message);
      
      // If transaction not found in Midtrans, mark it for deletion
      if (midtransError.message && (midtransError.message.includes('404') || midtransError.message.includes('not found'))) {
        // Update transaction to mark as "not found in gateway"
        
        // transactionId is already set above
        
        // Store the not found status in payment_gateway_logs
        const [updateResult] = await pool.query(
          `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
          ['not_found_in_gateway', transactionId, 'payment_gateway_status']
        );
        
        if (updateResult.affectedRows === 0) {
          await pool.query(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [transactionId, 'payment_gateway_status', 'not_found_in_gateway']
          );
        }
        
        // Get updated transaction details with payment gateway info
        const [updatedTransaction] = await pool.query(
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
        const [gatewayLogs] = await pool.query(
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
    
    // Update transaction status in database (transactionId is already set above)
    const [result] = await pool.query(
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
      const [updateResult] = await pool.query(
        `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
        [value, transactionId, key]
      );
      
      if (updateResult.affectedRows === 0) {
        await pool.query(
          `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
          [transactionId, key, value]
        );
      }
    }

    // Get updated transaction details with payment gateway info
    const [updatedTransaction] = await pool.query(
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
    const [allGatewayLogs] = await pool.query(
      `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
      [transactionId]
    );
    
    // Convert logs to object
    const gatewayData = {};
    allGatewayLogs.forEach(log => {
      gatewayData[log.key] = log.value;
    });

    // If order is now completed, check if we need to process licenses
    if (newStatus === 'completed') {
      try {
        await processLicensesIfNeeded(transactionId);
      } catch (licenseError) {
        console.error('Error processing licenses for order:', transactionId, licenseError);
        // Don't fail the main operation, just log the error
      }
    }

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
