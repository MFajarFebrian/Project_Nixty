import db from '../../utils/db';
import { requireAuth } from '../../utils/auth';

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
    
    console.log('Setting up license tracking tables and columns...');
    
    // 1. Check if license_usage_history table exists
    const [tables] = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'license_usage_history'"
    );
    
    // Create license_usage_history table if it doesn't exist
    if (tables.length === 0) {
      console.log('Creating license_usage_history table...');
      await db.execute(`
        CREATE TABLE license_usage_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          license_id INT NOT NULL,
          transaction_id INT NOT NULL,
          used_at DATETIME NOT NULL,
          usage_number INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (license_id) REFERENCES product_licenses(id),
          FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('license_usage_history table created successfully');
    } else {
      console.log('license_usage_history table already exists');
    }
    
    // 2. Check if send_license column exists in product_licenses table
    const [columns] = await db.execute(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'product_licenses' AND column_name = 'send_license'"
    );
    
    // Add send_license column if it doesn't exist
    if (columns.length === 0) {
      console.log('Adding send_license column to product_licenses table...');
      await db.execute(`
        ALTER TABLE product_licenses 
        ADD COLUMN send_license INT DEFAULT 0 AFTER usage_count;
      `);
      
      // Update send_license values based on usage_count
      await db.execute(`
        UPDATE product_licenses 
        SET send_license = usage_count 
        WHERE send_license IS NULL OR send_license = 0;
      `);
      console.log('send_license column added successfully');
    } else {
      console.log('send_license column already exists');
    }
    
    // 3. Check if license_info column exists in transactions table
    const [licenseInfoColumns] = await db.execute(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transactions' AND column_name = 'license_info'"
    );
    
    // Add license_info column if it doesn't exist
    if (licenseInfoColumns.length === 0) {
      console.log('Adding license_info column to transactions table...');
      await db.execute(`
        ALTER TABLE transactions 
        ADD COLUMN license_info JSON DEFAULT NULL AFTER auth_credentials;
      `);
      console.log('license_info column added successfully');
    } else {
      console.log('license_info column already exists');
    }
    
    return {
      success: true,
      message: 'License tracking tables and columns set up successfully'
    };
  } catch (error) {
    console.error('Error setting up license tracking:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to set up license tracking: ${error.message}`
    });
  }
}); 