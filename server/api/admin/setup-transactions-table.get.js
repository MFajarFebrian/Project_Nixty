import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    // Check if transactions table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'transactions'
    `;
    
    const [checkResult] = await db.query(checkTableQuery);
    
    if (checkResult[0].count === 0) {
      // Create transactions table
      const createTableQuery = `
        CREATE TABLE transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NULL,
          product_id VARCHAR(255) NOT NULL,
          product_name VARCHAR(500) NOT NULL,
          customer_name VARCHAR(255) NULL,
          email VARCHAR(255) NULL,
          amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(100) NULL,
          va_number VARCHAR(100) NULL,
          transaction_time DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_order_id (order_id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status)
        )
      `;
      
      await db.query(createTableQuery);
      
      return {
        success: true,
        message: 'Transactions table created successfully',
        tableExists: false,
        created: true
      };
    } else {
      return {
        success: true,
        message: 'Transactions table already exists',
        tableExists: true,
        created: false
      };
    }
  } catch (error) {
    console.error('Error setting up transactions table:', error);
    return {
      success: false,
      message: 'Failed to setup transactions table',
      error: error.message
    };
  }
});
