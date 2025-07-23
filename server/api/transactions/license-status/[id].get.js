import db from '../../../utils/db';
import { requireAuth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Authenticate user
    const user = await requireAuth(event);
    
    // Get transaction ID from URL
    const transactionId = event.context.params?.id;
    
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required'
      });
    }
    
    // Get transaction details
    const [transactions] = await db.execute(`
      SELECT t.*, p.name as product_name, p.slug as product_slug
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `, [transactionId, user.id]);
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found or access denied'
      });
    }
    
    const transaction = transactions[0];
    
    // Get transaction payment status from logs
    const [paymentLogs] = await db.execute(`
      SELECT * FROM nixty.payment_gateway_logs
      WHERE transaction_id = ?
      ORDER BY id ASC
    `, [transactionId]);
    
    // Map logs to a more readable format
    const paymentInfo = paymentLogs.reduce((acc, log) => {
      acc[log.key] = log.value;
      return acc;
    }, {});
    
    // Get licenses assigned to this transaction
    const [licenseAssignments] = await db.execute(`
      SELECT tl.*, plb.license_type, pk.product_key, pa.email, pa.password
      FROM nixty.transaction_license tl
      JOIN nixty.product_license_base plb ON tl.license_id = plb.id
      LEFT JOIN nixty.product_license_keys pk ON plb.id = pk.id AND plb.license_type = 'product_key'
      LEFT JOIN nixty.product_license_accounts pa ON plb.id = pa.id AND plb.license_type = 'email_password'
      WHERE tl.transaction_id = ?
    `, [transactionId]);
    
    // Format the license data
    const licenses = licenseAssignments.map(license => {
      const licenseData = {
        license_id: license.license_id,
        license_type: license.license_type,
      };
      
      // Add type-specific data
      if (license.license_type === 'product_key' && license.product_key) {
        licenseData.product_key = license.product_key;
      } else if (license.license_type === 'email_password' && license.email) {
        licenseData.email = license.email;
        licenseData.password = license.password;
      }
      
      return licenseData;
    });
    
    return {
      success: true,
      transaction: {
        id: transaction.id,
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_slug: transaction.product_slug,
        quantity: transaction.quantity,
        total: transaction.total,
        status: transaction.status,
        created_at: transaction.created_at
      },
      payment_status: {
        status: transaction.status,
        payment_type: paymentInfo.payment_type || 'unknown',
        transaction_status: paymentInfo.transaction_status || transaction.status,
        order_id: paymentInfo.order_id || '',
        created_at: paymentInfo.transaction_time || transaction.created_at
      },
      licenses: licenses,
      license_count: licenses.length
    };
    
  } catch (error) {
    console.error('Error getting transaction license status:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to get transaction license status'
    });
  }
});
