import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const { order_id } = getQuery(event);
    
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      });
    }
    
    console.log(`Checking transaction status for order: ${order_id}`);
    
    // Get transaction from database
    const [transactions] = await db.execute(`
      SELECT 
        t.id,
        t.order_id,
        t.product_id,
        t.product_name,
        t.quantity,
        t.customer_name,
        t.email,
        t.amount,
        t.payment_method,
        t.payment_gateway_status,
        t.status,
        t.created_at,
        t.updated_at,
        t.license_info IS NOT NULL AS has_license,
        (SELECT COUNT(*) FROM payment_gateway_logs WHERE transaction_id = t.id AND log_key = 'custom_email') > 0 AS has_custom_email
      FROM transactions t
      WHERE t.order_id = ?
    `, [order_id]);
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Transaction not found for order ID: ${order_id}`
      });
    }
    
    const transaction = transactions[0];
    
    // Get custom email if exists
    if (transaction.has_custom_email) {
      const [customEmailRows] = await db.execute(`
        SELECT log_value 
        FROM payment_gateway_logs 
        WHERE transaction_id = ? AND log_key = 'custom_email'
        LIMIT 1
      `, [transaction.id]);
      
      if (customEmailRows.length > 0) {
        transaction.custom_email = customEmailRows[0].log_value;
      }
    }
    
    // Count licenses if any
    if (transaction.has_license && transaction.license_info) {
      try {
        const licenseInfo = JSON.parse(transaction.license_info);
        transaction.license_count = Array.isArray(licenseInfo) ? licenseInfo.length : 1;
      } catch (e) {
        transaction.license_count = 0;
      }
    } else {
      transaction.license_count = 0;
    }
    
    return {
      success: true,
      transaction
    };
    
  } catch (error) {
    console.error('Error checking transaction:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to check transaction'
    });
  }
}); 