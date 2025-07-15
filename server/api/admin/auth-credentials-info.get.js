import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    const user = await requireAuth(event);
    
    // Check if user is admin
    if (!user || user.account_type !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }
    
    console.log('Getting auth_credentials information...');
    
    // 1. Check if auth_credentials column exists
    const [columns] = await db.execute(
      `SELECT column_name, column_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_schema = DATABASE() 
       AND table_name = 'transactions' 
       AND column_name = 'auth_credentials'`
    );
    
    if (columns.length === 0) {
      return {
        success: false,
        message: 'auth_credentials column does not exist in transactions table'
      };
    }
    
    // 2. Get sample transactions with auth_credentials
    const [sampleTransactions] = await db.execute(`
      SELECT 
        id, 
        order_id, 
        product_name, 
        status, 
        auth_credentials,
        created_at
      FROM transactions 
      WHERE auth_credentials IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    // 3. Get transactions without auth_credentials but with license_info
    const [transactionsWithLicenseOnly] = await db.execute(`
      SELECT 
        id, 
        order_id, 
        product_name, 
        status, 
        license_info,
        created_at
      FROM transactions 
      WHERE license_info IS NOT NULL 
      AND auth_credentials IS NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    // 4. Get statistics
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN auth_credentials IS NOT NULL THEN 1 ELSE 0 END) as with_auth_credentials,
        SUM(CASE WHEN license_info IS NOT NULL THEN 1 ELSE 0 END) as with_license_info,
        SUM(CASE WHEN auth_credentials IS NOT NULL AND license_info IS NOT NULL THEN 1 ELSE 0 END) as with_both
      FROM transactions
    `);
    
    return {
      success: true,
      column_info: columns[0],
      statistics: stats[0],
      sample_transactions_with_auth: sampleTransactions,
      sample_transactions_license_only: transactionsWithLicenseOnly,
      explanation: {
        purpose: "auth_credentials is designed to store authentication credentials for services that require login",
        usage: "Typically used for cloud services, subscriptions, or SaaS products",
        format: "JSON format containing login credentials like username, password, account tokens, etc",
        examples: [
          {
            type: "Cloud Service Account",
            format: {
              username: "user@service.com",
              password: "generated_password",
              account_type: "premium",
              expires_at: "2024-12-31"
            }
          },
          {
            type: "API Access",
            format: {
              api_key: "key_xxxxxxxxxxxxx",
              api_secret: "secret_yyyyyyyyy", 
              endpoint: "https://api.service.com",
              permissions: ["read", "write"]
            }
          },
          {
            type: "Service Login",
            format: {
              login_url: "https://service.com/login",
              username: "customer_123",
              password: "temp_password_456",
              additional_info: "Change password on first login"
            }
          }
        ]
      }
    };
    
  } catch (error) {
    console.error('Error getting auth_credentials info:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get auth_credentials info: ${error.message}`
    });
  }
});
