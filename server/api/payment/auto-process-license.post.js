import db from '../../utils/db.js';
import { processLicenseDelivery } from '../../utils/licenseService.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id, transaction_status } = body;
    
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      });
    }
    
    console.log(`Auto-processing license for order: ${order_id}, status: ${transaction_status}`);
    
    // Only process if payment is successful
    if (transaction_status !== 'settlement' && transaction_status !== 'capture') {
      return {
        success: false,
        message: 'Payment not completed, license processing skipped',
        order_id
      };
    }
    
    // Get transaction details
    const [transactions] = await db.execute(
      'SELECT * FROM transactions WHERE order_id = ?',
      [order_id]
    );
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }
    
    const transaction = transactions[0];
    
    // Check if license already processed
    if (transaction.license_info) {
      console.log(`License already processed for order ${order_id}`);
      try {
        const existingLicenses = JSON.parse(transaction.license_info);
        return {
          success: true,
          message: 'License already processed',
          order_id,
          licenses_count: Array.isArray(existingLicenses) ? existingLicenses.length : 1,
          already_processed: true
        };
      } catch (e) {
        console.warn(`Could not parse existing license_info for order ${order_id}:`, e.message);
      }
    }
    
    // Update transaction status if needed
    if (transaction.status !== 'completed') {
      await db.execute(
        `UPDATE transactions SET status = 'completed', updated_at = NOW() WHERE order_id = ?`,
        [order_id]
      );
      console.log(`Transaction status updated to completed for order ${order_id}`);
    }
    
    // Process licenses
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    let licensesProcessed = 0;
    
    console.log(`Processing ${quantity} license(s) for order ${order_id}`);
    
    // Check stock before processing
    const [stockCheck] = await db.execute(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [transaction.product_id]
    );
    
    const availableStock = stockCheck.length > 0 ? stockCheck[0].available_stock : 0;
    console.log(`Available stock: ${availableStock} for product ${transaction.product_id}`);
    
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Required: ${quantity}, Available: ${availableStock}`);
    }
    
    // Process each license
    for (let i = 0; i < quantity; i++) {
      console.log(`Processing license ${i + 1}/${quantity} for order ${order_id}`);
      
      const licenseResult = await processLicenseDelivery(
        transaction.id,
        transaction.product_id,
        transaction.email,
        transaction.customer_name || 'Customer'
      );
      
      if (licenseResult.success) {
        allLicenses.push(licenseResult.license);
        licensesProcessed++;
        console.log(`✅ License ${i + 1} processed successfully for order ${order_id}`);
      } else {
        console.error(`❌ Failed to process license ${i + 1} for order ${order_id}:`, licenseResult.error || licenseResult.message);
        throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
      }
    }
    
    // Store all licenses in transaction (only if not already stored by processLicenseDelivery)
    if (allLicenses.length > 0) {
      // Check if license_info is already populated
      const [currentTransaction] = await db.execute(
        'SELECT license_info FROM transactions WHERE id = ?',
        [transaction.id]
      );
      
      if (!currentTransaction[0]?.license_info) {
        await db.execute(
          `UPDATE transactions SET license_info = ? WHERE id = ?`,
          [JSON.stringify(allLicenses), transaction.id]
        );
        console.log(`✅ ${allLicenses.length} license(s) stored in transaction ${transaction.id} for order ${order_id}`);
      } else {
        console.log(`📝 License info already exists in transaction ${transaction.id}, skipping update`);
      }
    }
    
    // Verify final stock
    const [finalStock] = await db.execute(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [transaction.product_id]
    );
    const finalAvailableStock = finalStock.length > 0 ? finalStock[0].available_stock : 0;
    console.log(`Final available stock: ${finalAvailableStock} for product ${transaction.product_id}`);
    
    return {
      success: true,
      message: `Successfully processed ${licensesProcessed} license(s)`,
      order_id,
      transaction_id: transaction.id,
      licenses_processed: licensesProcessed,
      total_quantity: quantity,
      stock_before: availableStock,
      stock_after: finalAvailableStock,
      licenses: allLicenses.map(license => ({
        license_type: license.license_type,
        product_key: license.product_key ? '***' + license.product_key.slice(-4) : null,
        email: license.email || null,
        additional_info: license.additional_info || null
      }))
    };
    
  } catch (error) {
    console.error('Auto license processing error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to process license automatically'
    });
  }
});
