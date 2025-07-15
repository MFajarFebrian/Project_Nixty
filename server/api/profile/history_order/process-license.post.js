import pool from '../../../utils/db';
import { requireAuth } from '../../../utils/auth';
import { processLicenseDelivery } from '../../../utils/licenseService';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get transaction ID from request body
    const body = await readBody(event);
    const { transactionId } = body;
    
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required'
      });
    }
    
    // Get transaction details
    const [transactions] = await pool.execute(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_id, 
        t.product_name, 
        t.quantity,
        t.status, 
        t.payment_gateway_status,
        t.customer_name,
        t.email
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }
    
    const transaction = transactions[0];
    
    // Check if transaction is completed
    const isCompleted = transaction.status === 'completed' || 
                        ['settlement', 'capture'].includes(transaction.payment_gateway_status?.toLowerCase());
    
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction is not completed'
      });
    }
    
    // Process license delivery
    const quantity = transaction.quantity || 1;
    const licenses = [];
    let success = true;
    
    console.log(`Processing ${quantity} license(s) for transaction ${transactionId}`);
    
    // Get current stock before processing
    const [beforeStock] = await pool.execute(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [transaction.product_id]
    );
    const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
    console.log(`Stock before processing: ${stockBefore}`);
    
    // Start database transaction
    await pool.execute('START TRANSACTION');
    
    try {
      // Process license for each quantity
      for (let i = 0; i < quantity; i++) {
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || 'Customer'
        );
        
        if (licenseResult.success) {
          licenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
        } else {
          success = false;
          console.error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
          break;
        }
      }
      
      // Verify stock was properly reduced
      const [afterStock] = await pool.execute(
        `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
        [transaction.product_id]
      );
      const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
      console.log(`Stock after processing: ${stockAfter}`);
      
      // Verify stock reduction
      const expectedStockReduction = licenses.length;
      const actualStockReduction = stockBefore - stockAfter;
      
      if (actualStockReduction !== expectedStockReduction) {
        console.warn(`Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
        
        // Force refresh stock view if needed
        if (actualStockReduction < expectedStockReduction) {
          console.log(`Attempting to refresh stock view...`);
          await pool.execute(`
            UPDATE product_licenses 
            SET updated_at = NOW() 
            WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
          `, [transaction.product_id, transaction.id]);
        }
      }
      
      if (success) {
        // Store all licenses in transaction record
        await pool.execute(
          `UPDATE transactions 
           SET license_info = ? 
           WHERE id = ?`,
          [JSON.stringify(licenses), transaction.id]
        );
        
        await pool.execute('COMMIT');
        console.log(`Licenses stored in transaction ${transactionId}`);
      } else {
        await pool.execute('ROLLBACK');
        console.log(`License processing failed for transaction ${transactionId}, rolling back`);
      }
    } catch (error) {
      await pool.execute('ROLLBACK');
      console.error(`Error processing licenses: ${error.message}`);
      throw error;
    }
    
    return {
      success,
      message: success 
        ? `Successfully processed ${licenses.length} license(s)` 
        : 'Failed to process licenses',
      data: {
        transaction_id: transaction.id,
        order_id: transaction.order_id,
        licenses: success ? licenses : []
      }
    };
    
  } catch (error) {
    console.error('Error processing license:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'An error occurred while processing license'
    });
  }
}); 