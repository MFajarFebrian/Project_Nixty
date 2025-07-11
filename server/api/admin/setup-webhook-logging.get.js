import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    console.log('Setting up webhook logging system...');

    // Create webhook_logs table
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS webhook_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(100) NOT NULL,
          webhook_type VARCHAR(50) NOT NULL DEFAULT 'midtrans',
          status VARCHAR(50) NOT NULL,
          request_payload JSON,
          response_status INT,
          error_message TEXT NULL,
          processing_duration_ms INT NULL,
          license_processing_success BOOLEAN NULL,
          licenses_processed INT DEFAULT 0,
          email_sent BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_webhook_logs_order_id (order_id),
          INDEX idx_webhook_logs_status (status),
          INDEX idx_webhook_logs_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ webhook_logs table created');
    } catch (tableError) {
      if (tableError.code !== 'ER_TABLE_EXISTS_ERROR') {
        throw tableError;
      }
      console.log('✅ webhook_logs table already exists');
    }

    // Create license_delivery_failures table for tracking failures
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS license_delivery_failures (
          id INT AUTO_INCREMENT PRIMARY KEY,
          transaction_id INT NOT NULL,
          order_id VARCHAR(100) NOT NULL,
          failure_reason TEXT NOT NULL,
          retry_count INT DEFAULT 0,
          max_retries INT DEFAULT 3,
          last_retry_at TIMESTAMP NULL,
          resolved BOOLEAN DEFAULT FALSE,
          resolved_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_ldf_transaction_id (transaction_id),
          INDEX idx_ldf_order_id (order_id),
          INDEX idx_ldf_resolved (resolved),
          FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ license_delivery_failures table created');
    } catch (tableError) {
      if (tableError.code !== 'ER_TABLE_EXISTS_ERROR') {
        throw tableError;
      }
      console.log('✅ license_delivery_failures table already exists');
    }

    return {
      success: true,
      message: 'Webhook logging system setup completed',
      tables_created: ['webhook_logs', 'license_delivery_failures']
    };

  } catch (error) {
    console.error('Error setting up webhook logging:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to setup webhook logging: ${error.message}`
    });
  }
});
