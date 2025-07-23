import pool from '../../utils/db';
import { requireAuth } from '../../utils/auth';
import { processLicenseDelivery } from '../../utils/licenseService';
import { sendLicenseEmail, sendMultipleLicenseEmail } from '../../utils/emailService.js';

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
        
        // Send email with license information
        let emailResult;
        try {
          // Check if we have a custom email in payment_gateway_logs
          let customEmail = null;
          try {
            const [customEmailLogs] = await pool.execute(
              "SELECT log_value FROM payment_gateway_logs WHERE transaction_id = ? AND log_key = 'custom_email' LIMIT 1",
              [transactionId]
            );
            
            if (customEmailLogs.length > 0 && customEmailLogs[0].log_value) {
              customEmail = customEmailLogs[0].log_value;
              console.log(`Found custom email in logs: ${customEmail}`);
            }
          } catch (logError) {
            console.error(`Error fetching custom email from logs:`, logError);
          }
          
          if (quantity > 1) {
            // Send multiple licenses
            emailResult = await sendMultipleLicenseEmail(
              transaction.email, 
              transaction.customer_name || 'Customer',
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses,
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          } else {
            // Send single license
            emailResult = await sendLicenseEmail(
              transaction.email,
              transaction.customer_name || 'Customer',
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses[0],
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          }
          
          if (emailResult.success) {
            console.log(`✅ License email sent successfully to: ${transaction.email}${customEmail ? ` and ${customEmail}` : ''}`);
          } else {
            console.error(`❌ Failed to send license email: ${emailResult.error || emailResult.message}`);
          }
        } catch (emailError) {
          console.error('Error sending license email:', emailError);
        }
        
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