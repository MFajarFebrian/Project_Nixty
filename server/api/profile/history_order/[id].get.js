import pool from '../../../utils/db';
import { requireAuth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get transaction ID from route parameter
    const transactionId = getRouterParam(event, 'id');
    
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required',
      });
    }

    // Get detailed transaction info with license data
    const [transactions] = await pool.execute(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_name, 
        t.quantity,
        t.amount, 
        t.status, 
        t.payment_method, 
        t.va_number, 
        t.created_at,
        t.updated_at,
        t.customer_name,
        t.email,
        t.product_id,
        t.payment_gateway_status,
        t.payment_gateway_payload,
        t.license_info,
        p.name as product_name_full,
        p.version as product_version,
        p.description as product_description,
        p.price as product_price,
        p.currency as product_currency,
        p.license_type_default,
        c.name as category_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
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

    // If transaction is completed, get license information
    let licenseData = null;
    const isCompleted = transaction.status === 'completed' || 
                       ['settlement', 'capture'].includes(transaction.payment_gateway_status?.toLowerCase());
    
    if (isCompleted) {
      // Start with an empty licenses array
      let licenses = [];
      
      // First try to get licenses from the license_info JSON column (our primary source now)
      if (transaction.license_info) {
        try {
          console.log('Raw license_info from database:', transaction.license_info);
          
          // Handle different data formats
          let licenseInfo;
          if (typeof transaction.license_info === 'string') {
            licenseInfo = JSON.parse(transaction.license_info);
          } else if (Buffer.isBuffer(transaction.license_info)) {
            // Handle binary data (sometimes MySQL returns JSON as buffer)
            licenseInfo = JSON.parse(transaction.license_info.toString());
          } else {
            licenseInfo = transaction.license_info;
          }
          
          console.log('Parsed license_info:', licenseInfo);
            
          if (Array.isArray(licenseInfo) && licenseInfo.length > 0) {
            licenses = licenseInfo;
            console.log(`Found ${licenses.length} licenses in license_info JSON column`);
          } else if (licenseInfo && typeof licenseInfo === 'object') {
            // Handle case where it's a single object instead of an array
            licenses = [licenseInfo];
            console.log('Found single license object in license_info');
          }
        } catch (jsonErr) {
          console.error('Error parsing license_info JSON:', jsonErr);
        }
      }
      
      // If no licenses found in JSON column, try legacy methods as fallback
      if (licenses.length === 0) {
        try {
          // Try to get from product_licenses table directly (legacy method)
          const [legacyLicenses] = await pool.execute(
            `SELECT 
              pl.license_type,
              pl.product_key,
              pl.email,
              pl.password,
              pl.additional_info,
              pl.notes,
              pl.expires_at,
              pl.send_license,
              pl.max_usage
            FROM product_licenses pl
            WHERE pl.product_id = ? AND pl.used_by_transaction_id = ?
            ORDER BY pl.id ASC`,
            [transaction.product_id, transactionId]
          );
          
          if (legacyLicenses.length > 0) {
            licenses = legacyLicenses;
            console.log(`Found ${licenses.length} licenses using legacy method`);
          }
        } catch (err) {
          console.log('Error fetching legacy licenses, but continuing:', err.message);
        }
      }

      // Always return array for consistent handling
      if (licenses.length > 0) {
        licenseData = licenses;
        console.log('Final license data to be returned:', licenseData);
      }
    }

    return {
      success: true,
      data: {
        ...transaction,
        license: licenseData
      },
    };
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    if (error.statusCode) {
      throw error; // Re-throw authentication/validation errors
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transaction details',
    });
  }
});
