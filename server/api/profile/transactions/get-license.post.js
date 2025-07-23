import db from '../../../utils/db.js';
import { requireAuth } from '../../../utils/auth.js';

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);
  
  const body = await readBody(event);
  const { order_id, transaction_id } = body;
  
  if (!order_id && !transaction_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID or Transaction ID is required'
    });
  }
  
  try {
    // Get transaction details including license info
    let query = '';
    let params = [];
    
    if (order_id) {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM nixty.transactions t
        LEFT JOIN nixty.products p ON t.product_id = p.id
        WHERE t.order_id = ? AND t.user_id = ?
      `;
      params = [order_id, user.id];
    } else {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM nixty.transactions t
        LEFT JOIN nixty.products p ON t.product_id = p.id
        WHERE t.id = ? AND t.user_id = ?
      `;
      params = [transaction_id, user.id];
    }
    
    const [rows] = await db.query(query, params);
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }
    
    const transaction = rows[0];
    
    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return {
        success: false,
        message: 'Transaction not completed yet',
        status: transaction.status,
        order_id: transaction.order_id
      };
    }
    
    // Parse license info
    let licenseInfo = [];
    if (transaction.license_info) {
      try {
        licenseInfo = JSON.parse(transaction.license_info);
      } catch (error) {
        console.error('Error parsing license info:', error);
      }
    }
    
    if (licenseInfo.length === 0) {
      return {
        success: false,
        message: 'No license information available',
        order_id: transaction.order_id
      };
    }
    
    // Format license info for response
    const formattedLicenses = licenseInfo.map(license => {
      const formatted = {
        license_type: license.license_type,
        additional_info: license.additional_info
      };
      
      // Add relevant fields based on license type
      switch (license.license_type) {
        case 'product_key':
          formatted.product_key = license.product_key;
          break;
        case 'email_password':
          formatted.email = license.email;
          formatted.password = license.password;
          break;
        default:
          // Include all available fields for unknown types
          if (license.product_key) formatted.product_key = license.product_key;
          if (license.email) formatted.email = license.email;
          if (license.password) formatted.password = license.password;
      }
      
      return formatted;
    });
    
    return {
      success: true,
      transaction: {
        id: transaction.id,
        order_id: transaction.order_id,
        product_name: transaction.product_name,
        product_version: transaction.product_version,
        status: transaction.status,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      },
      licenses: formattedLicenses,
      license_count: formattedLicenses.length
    };
    
  } catch (error) {
    console.error('Error retrieving license info:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve license information'
    });
  }
});
