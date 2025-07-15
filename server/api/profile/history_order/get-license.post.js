import pool from '../../../utils/db';
import { requireAuth } from '../../../utils/auth';
import { processLicenseDelivery } from '../../../utils/licenseService';

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
    
    // Verify the transaction belongs to this user
    const [transactions] = await pool.execute(
      `SELECT 
        t.id, 
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    const transaction = transactions[0];
    
    // Check if transaction is completed
    const isCompleted = transaction.status === 'completed' || 
                       ['settlement', 'capture'].includes(transaction.payment_gateway_status?.toLowerCase());
                       
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction is not completed yet',
      });
    }
    
    // Try to process license delivery
    console.log(`Manual license retrieval for transaction ${transactionId}`);
    
    // Get quantity from transaction
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    
    // Start a transaction
    await pool.execute('START TRANSACTION');
    
    try {
      // Process license for the quantity
      for (let i = 0; i < quantity; i++) {
        console.log(`Processing license ${i + 1}/${quantity}...`);
        
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || 'Customer'
        );
        
        if (licenseResult.success) {
          allLicenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
          
          // Store license in transaction record for easy retrieval
          try {
            // Check if license_info exists
            const [licenseInfoResult] = await pool.execute(
              `SELECT license_info FROM transactions WHERE id = ?`,
              [transaction.id]
            );
            
            if (!licenseInfoResult[0].license_info) {
              // If license_info is NULL, initialize with a new array containing the license
              const licenseArray = [licenseResult.license];
              await pool.execute(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(licenseArray), transaction.id]
              );
            } else {
              // If license_info already exists, parse it, append the new license, and update
              let existingLicenses = [];
              try {
                existingLicenses = JSON.parse(licenseInfoResult[0].license_info);
                if (!Array.isArray(existingLicenses)) {
                  existingLicenses = [existingLicenses]; // Convert to array if it's not already
                }
              } catch (parseError) {
                console.error(`Error parsing existing license_info:`, parseError);
                existingLicenses = [];
              }
              
              // Add the new license
              existingLicenses.push(licenseResult.license);
              
              // Update with the new array
              await pool.execute(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(existingLicenses), transaction.id]
              );
            }
            
            console.log(`License ${i + 1} stored in transaction record`);
          } catch (licenseStoreError) {
            console.error(`Failed to store license info:`, licenseStoreError);
          }
        } else {
          throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        }
      }
      
      // Commit the transaction
      await pool.execute('COMMIT');
      
      // If successful, retrieve the license_info from the transaction record
      const [updatedTransaction] = await pool.execute(
        `SELECT license_info FROM transactions WHERE id = ?`,
        [transaction.id]
      );
      
      let licenseInfo = null;
      
      if (updatedTransaction.length > 0 && updatedTransaction[0].license_info) {
        try {
          licenseInfo = JSON.parse(updatedTransaction[0].license_info);
        } catch (e) {
          console.error('Error parsing license_info:', e);
        }
      }
      
      return {
        success: true,
        message: 'License retrieved successfully',
        license: licenseInfo || allLicenses
      };
    } catch (error) {
      // Rollback transaction on error
      await pool.execute('ROLLBACK');
      console.error('Error processing license delivery:', error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to process license',
      });
    }
  } catch (error) {
    console.error('Error retrieving license:', error);
    if (error.statusCode) {
      throw error; // Re-throw authentication/validation errors
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve license',
    });
  }
});
