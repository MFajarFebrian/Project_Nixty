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
      
      try {
        // Attempt to get licenses from license_usage_history, but handle if table doesn't exist
        const [historyLicenses] = await pool.execute(
          `SELECT 
            pl.license_type,
            pl.product_key,
            pl.email,
            pl.password,
            pl.additional_info,
            pl.notes,
            pl.expires_at,
            pl.send_license,
            pl.max_usage,
            luh.usage_number
          FROM license_usage_history luh
          JOIN product_licenses pl ON pl.id = luh.license_id
          WHERE luh.transaction_id = ?
          ORDER BY luh.used_at ASC`,
          [transactionId]
        );
        licenses = historyLicenses;
      } catch (err) {
        console.log('license_usage_history table may not exist, trying legacy method:', err.message);
        // Continue to legacy method if table doesn't exist
      }
      
      // If no history found, try legacy method (used_by_transaction_id)
      if (licenses.length === 0) {
        try {
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
              pl.max_usage,
              1 as usage_number
            FROM product_licenses pl
            WHERE pl.product_id = ? AND pl.used_by_transaction_id = ?
            ORDER BY pl.id ASC`,
            [transaction.product_id, transactionId]
          );
          licenses = legacyLicenses;
          
          // If still no licenses found, check transaction license_info JSON column
          if (licenses.length === 0 && transaction.license_info) {
            try {
              const licenseInfo = JSON.parse(transaction.license_info);
              if (Array.isArray(licenseInfo) && licenseInfo.length > 0) {
                licenses = licenseInfo;
              }
            } catch (jsonErr) {
              console.error('Error parsing license_info JSON:', jsonErr);
            }
          }
        } catch (err) {
          console.error('Error fetching legacy licenses:', err);
        }
      }

      // Always return array for consistent handling
      if (licenses.length > 0) {
        licenseData = licenses;
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
