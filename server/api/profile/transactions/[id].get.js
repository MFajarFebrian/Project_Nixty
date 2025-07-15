import db from '~/server/utils/db';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);
  
  const transactionId = getRouterParam(event, 'id');
  
  if (!transactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Transaction ID is required'
    });
  }
  
  try {
    // Get transaction details
    const [rows] = await db.execute(`
      SELECT 
        t.id,
        t.order_id,
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.amount,
        t.quantity,
        t.status,
        t.payment_method,
        t.payment_gateway_status,
        t.payment_gateway_payload,
        t.license_info,
        t.created_at,
        t.updated_at,
        p.name as product_name_full,
        p.version as product_version,
        p.image_url as product_image
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `, [transactionId, user.id]);
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }
    
    const transaction = rows[0];
    
    // Parse payment gateway payload if exists
    let paymentGatewayPayload = null;
    if (transaction.payment_gateway_payload) {
      try {
        paymentGatewayPayload = JSON.parse(transaction.payment_gateway_payload);
      } catch (error) {
        console.error('Error parsing payment gateway payload:', error);
      }
    }
    
    // Parse license info if exists
    let licenseInfo = null;
    if (transaction.license_info) {
      try {
        licenseInfo = JSON.parse(transaction.license_info);
      } catch (error) {
        console.error('Error parsing license info:', error);
      }
    }
    
    return {
      success: true,
      transaction: {
        id: transaction.id,
        order_id: transaction.order_id,
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_version: transaction.product_version,
        product_image: transaction.product_image,
        customer_name: transaction.customer_name,
        email: transaction.email,
        amount: transaction.amount,
        quantity: transaction.quantity,
        status: transaction.status,
        payment_method: transaction.payment_method,
        payment_gateway_status: transaction.payment_gateway_status,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        payment_gateway_payload: paymentGatewayPayload,
        license_info: licenseInfo,
        has_license: licenseInfo && licenseInfo.length > 0
      }
    };
    
  } catch (error) {
    console.error('Error retrieving transaction:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve transaction'
    });
  }
});
