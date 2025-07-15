import pool from '../../../utils/db.js';
import { requireAuth } from '../../../utils/auth.js';
import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../../utils/config.js';
import { processLicenseDelivery } from '../../../utils/licenseService.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get request body to check if this is an auto-sync
    const body = await readBody(event).catch(() => ({}));
    const isAutoSync = body.auto_sync === true;
    const syncLimit = isAutoSync ? 5 : 100; // Limit to 5 most recent transactions for auto-sync
    
    // Check if specific transaction IDs were provided
    const specificTransactionIds = body.transactionIds || [];
    
    let transactions = [];
    
    if (specificTransactionIds.length > 0) {
      // Get specific transactions by ID (ensuring they belong to the user)
      const placeholders = specificTransactionIds.map(() => '?').join(',');
      const params = [...specificTransactionIds, user.id];
      
      [transactions] = await pool.execute(
        `SELECT id, order_id, status, payment_gateway_status, created_at
         FROM transactions 
         WHERE id IN (${placeholders}) AND user_id = ?
         ORDER BY created_at DESC`,
        params
      );
    } else {
      // Get all user's transactions that might need status update
      [transactions] = await pool.execute(
        `SELECT id, order_id, status, payment_gateway_status, created_at
         FROM transactions 
         WHERE user_id = ? 
         AND status IN ('pending', 'failed') 
         AND order_id IS NOT NULL 
         ORDER BY created_at DESC
         LIMIT ?`,
        [user.id, syncLimit]
      );
    }

    if (transactions.length === 0) {
      return {
        success: true,
        message: 'No transactions to sync',
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

    // Process each transaction
    for (const transaction of transactions) {
      totalProcessed++;
      
      try {
        // Skip transactions without order_id
        if (!transaction.order_id) {
          console.log(`Transaction ${transaction.id} has no order_id, skipping`);
          results.push({
            id: transaction.id,
            error: 'No order_id available'
          });
          continue;
        }
        
        // Get transaction status from Midtrans
        try {
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
                updated.push(transaction.id);
                results.push({
                  id: transaction.id,
                  order_id: transaction.order_id,
                  old_status: transaction.status,
                  new_status: newStatus,
                  gateway_status: midtransResponse.transaction_status
                });
                
                // If transaction is now completed, check if we need to process licenses
                if (newStatus === 'completed' && transaction.status !== 'completed') {
                  await processLicensesIfNeeded(transaction.id);
                }
              }
            }
          }
        } catch (midtransError) {
          // Handle 404 errors specially - transaction doesn't exist in Midtrans
          if (midtransError.httpStatusCode === 404 || 
              (midtransError.message && midtransError.message.includes("404") && 
               midtransError.message.includes("doesn't exist"))) {
            
            console.log(`Transaction ${transaction.id} (${transaction.order_id}) not found in Midtrans`);
            
            // Update transaction to mark it as not found in gateway
            await pool.execute(
              `UPDATE transactions 
               SET 
                 payment_gateway_status = 'not_found_in_gateway',
                 payment_gateway_payload = JSON_SET(
                   COALESCE(payment_gateway_payload, '{}'),
                   '$.sync_error', ?,
                   '$.sync_time', ?
                 ),
                 updated_at = NOW()
               WHERE id = ? AND user_id = ?`,
              [
                `Transaction not found in Midtrans: ${midtransError.message || 'Unknown error'}`,
                new Date().toISOString(),
                transaction.id,
                user.id
              ]
            );
            
            results.push({
              id: transaction.id,
              order_id: transaction.order_id,
              status: 'not_found_in_gateway',
              error: 'Transaction not found in Midtrans'
            });
            
            continue;
          }
          
          // Re-throw other errors to be caught by the outer catch block
          throw midtransError;
        }
      } catch (error) {
        console.log(`Failed to sync transaction ${transaction.id} (${transaction.order_id || 'no order_id'}):`, error.message);
        // Continue with other transactions even if one fails
        results.push({
          id: transaction.id,
          order_id: transaction.order_id,
          error: error.message
        });
      }
      
      // Add small delay to avoid overwhelming Midtrans API
      // Use a shorter delay for auto-sync
      await new Promise(resolve => setTimeout(resolve, isAutoSync ? 50 : 100));
    }

    return {
      success: true,
      message: `Successfully synced ${updatedCount} out of ${totalProcessed} transactions`,
      updated,
      data: {
        updated: updatedCount,
        total: totalProcessed,
        auto_sync: isAutoSync,
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

// Helper function to process licenses for newly completed transactions
async function processLicensesIfNeeded(transactionId) {
  try {
    // Check if transaction already has licenses
    const [licenseCheck] = await pool.execute(
      `SELECT license_info, product_id, email, customer_name, quantity FROM transactions WHERE id = ?`,
      [transactionId]
    );
    
    if (licenseCheck.length === 0) {
      console.log(`Transaction ${transactionId} not found`);
      return false;
    }
    
    const transaction = licenseCheck[0];
    
    if (!transaction.license_info) {
      console.log(`Transaction ${transactionId} completed but has no licenses. Processing now...`);
      
      // Process licenses directly
      const quantity = transaction.quantity || 1;
      const allLicenses = [];
      let success = true;
      
      try {
        // Get current stock before processing
        const [beforeStock] = await pool.execute(
          `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
          [transaction.product_id]
        );
        const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
        console.log(`Stock before processing for transaction ${transactionId}: ${stockBefore}`);
        
        // Start database transaction
        await pool.execute('START TRANSACTION');
        
        // Process license for each quantity
        for (let i = 0; i < quantity; i++) {
          const licenseResult = await processLicenseDelivery(
            transactionId,
            transaction.product_id,
            transaction.email,
            transaction.customer_name || 'Customer'
          );
          
          if (licenseResult.success) {
            allLicenses.push(licenseResult.license);
            console.log(`License ${i + 1} processed successfully for transaction ${transactionId}`);
          } else {
            console.error(`Failed to process license ${i + 1} for transaction ${transactionId}: ${licenseResult.error || licenseResult.message}`);
            success = false;
            break;
          }
        }
        
        // Verify stock was properly reduced
        const [afterStock] = await pool.execute(
          `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
          [transaction.product_id]
        );
        const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
        console.log(`Stock after processing for transaction ${transactionId}: ${stockAfter}`);
        
        // Verify stock reduction
        const expectedStockReduction = allLicenses.length;
        const actualStockReduction = stockBefore - stockAfter;
        
        if (actualStockReduction !== expectedStockReduction) {
          console.warn(`Stock reduction mismatch for transaction ${transactionId}! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
          
          // Force refresh stock view if needed
          if (actualStockReduction < expectedStockReduction) {
            console.log(`Attempting to refresh stock view for transaction ${transactionId}...`);
            await pool.execute(`
              UPDATE product_licenses 
              SET updated_at = NOW() 
              WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
            `, [transaction.product_id, transactionId]);
          }
        }
        
        if (success && allLicenses.length > 0) {
          // Store all licenses at once instead of one by one
          const licenseInfoJson = JSON.stringify(allLicenses);
          
          // Update transaction with all licenses
          await pool.execute(
            `UPDATE transactions SET license_info = ? WHERE id = ?`,
            [licenseInfoJson, transactionId]
          );
          
          // Commit the transaction
          await pool.execute('COMMIT');
          
          console.log(`Successfully processed ${allLicenses.length} licenses for transaction ${transactionId}`);
          return true;
        } else {
          // Rollback on failure
          await pool.execute('ROLLBACK');
          console.log(`Failed to process licenses for transaction ${transactionId}`);
          return false;
        }
      } catch (error) {
        // Rollback on error
        await pool.execute('ROLLBACK');
        console.error(`Error processing licenses for transaction ${transactionId}:`, error);
        return false;
      }
    } else {
      console.log(`Transaction ${transactionId} already has licenses, skipping processing`);
      return true;
    }
  } catch (error) {
    console.error(`Error checking licenses for transaction ${transactionId}:`, error);
    return false;
  }
}
