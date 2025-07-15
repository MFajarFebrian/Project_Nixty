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
    
    const body = await readBody(event);
    const { action, productId, authCredentials } = body;
    
    if (!action) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Action is required'
      });
    }
    
    console.log(`Setting up auth_credentials for action: ${action}`);
    
    if (action === 'add_to_product_licenses') {
      // Add auth_credentials support to product_licenses table
      if (!productId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Product ID is required for this action'
        });
      }
      
      // Check if auth_credentials column exists in product_licenses
      const [columns] = await db.execute(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_schema = DATABASE() 
         AND table_name = 'product_licenses' 
         AND column_name = 'auth_credentials'`
      );
      
      // Add column if it doesn't exist
      if (columns.length === 0) {
        await db.execute(`
          ALTER TABLE product_licenses 
          ADD COLUMN auth_credentials JSON DEFAULT NULL 
          AFTER additional_info
        `);
        console.log('Added auth_credentials column to product_licenses table');
      }
      
      // Update specific product licenses with auth_credentials
      if (authCredentials) {
        await db.execute(`
          UPDATE product_licenses 
          SET auth_credentials = ? 
          WHERE product_id = ? AND status = 'available'
        `, [JSON.stringify(authCredentials), productId]);
        
        console.log(`Updated product ${productId} licenses with auth_credentials`);
      }
      
      return {
        success: true,
        message: 'Auth credentials support added to product licenses',
        product_id: productId
      };
      
    } else if (action === 'migrate_existing_licenses') {
      // Migrate existing email/password licenses to use auth_credentials
      const [emailPasswordLicenses] = await db.execute(`
        SELECT id, email, password, additional_info 
        FROM product_licenses 
        WHERE license_type = 'email_password' 
        AND auth_credentials IS NULL
      `);
      
      let migrated = 0;
      for (const license of emailPasswordLicenses) {
        const authCreds = {
          type: 'email_password',
          email: license.email,
          password: license.password,
          additional_info: license.additional_info,
          migrated_at: new Date().toISOString()
        };
        
        await db.execute(`
          UPDATE product_licenses 
          SET auth_credentials = ? 
          WHERE id = ?
        `, [JSON.stringify(authCreds), license.id]);
        
        migrated++;
      }
      
      return {
        success: true,
        message: `Migrated ${migrated} email/password licenses to use auth_credentials`,
        migrated_count: migrated
      };
      
    } else if (action === 'update_webhook_handler') {
      // This would update the webhook handler to use auth_credentials
      // For now, just return instructions
      return {
        success: true,
        message: 'Webhook handler needs to be updated to support auth_credentials',
        instructions: [
          '1. Update webhook handler to check for auth_credentials in product_licenses',
          '2. Store auth_credentials in transactions table when license is assigned',
          '3. Update frontend to display auth_credentials alongside license_info',
          '4. Update email templates to include auth_credentials'
        ]
      };
      
    } else if (action === 'test_auth_credentials') {
      // Test auth_credentials functionality
      const [testTransactions] = await db.execute(`
        SELECT id, order_id, auth_credentials, license_info 
        FROM transactions 
        WHERE status = 'completed' 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      return {
        success: true,
        message: 'Auth credentials test completed',
        test_data: testTransactions.map(t => ({
          transaction_id: t.id,
          order_id: t.order_id,
          has_auth_credentials: !!t.auth_credentials,
          has_license_info: !!t.license_info,
          auth_credentials: t.auth_credentials ? JSON.parse(t.auth_credentials) : null,
          license_info: t.license_info ? JSON.parse(t.license_info) : null
        }))
      };
      
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action. Available actions: add_to_product_licenses, migrate_existing_licenses, update_webhook_handler, test_auth_credentials'
      });
    }
    
  } catch (error) {
    console.error('Error setting up auth_credentials:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to setup auth_credentials: ${error.message}`
    });
  }
});
