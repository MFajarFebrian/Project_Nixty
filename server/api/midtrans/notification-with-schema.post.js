import db from '../../utils/db';
import { verifySignature } from '../../utils/midtrans-helper';

// Helper function to get payment gateway logs by key
async function getPaymentGatewayLog(transactionId, key) {
  try {
    const [rows] = await db.execute(
      `SELECT value FROM nixty.payment_gateway_logs 
       WHERE transaction_id = ? AND key = ? LIMIT 1`,
      [transactionId, key]
    );
    return rows.length > 0 ? rows[0].value : null;
  } catch (error) {
    console.error(`Error getting payment gateway log ${key}:`, error);
    return null;
  }
}

// Helper function to set payment gateway log
async function setPaymentGatewayLog(transactionId, key, value) {
  try {
    // Check if entry exists
    const [existing] = await db.execute(
      `SELECT id FROM nixty.payment_gateway_logs 
       WHERE transaction_id = ? AND key = ? LIMIT 1`,
      [transactionId, key]
    );
    
    if (existing.length > 0) {
      // Update existing log
      await db.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ?
         WHERE transaction_id = ? AND key = ?`,
        [value.toString(), transactionId, key]
      );
    } else {
      // Insert new log
      await db.execute(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value)
         VALUES (?, ?, ?)`,
        [transactionId, key, value.toString()]
      );
    }
    return true;
  } catch (error) {
    console.error(`Error setting payment gateway log ${key}:`, error);
    return false;
  }
}

// Helper function to assign a license to a transaction
async function assignLicenseToTransaction(transactionId, productId, quantity) {
  try {
    // Start transaction
    await db.execute('START TRANSACTION');
    
    // Find available licenses
    const [availableLicenses] = await db.execute(`
      SELECT id, license_type FROM nixty.product_license_base
      WHERE product_id = ? AND status = 'available'
      LIMIT ?
    `, [productId, quantity]);
    
    if (availableLicenses.length < quantity) {
      await db.execute('ROLLBACK');
      return {
        success: false,
        message: `Not enough licenses available: requested ${quantity}, found ${availableLicenses.length}`
      };
    }
    
    // Assign each license
    for (const license of availableLicenses) {
      // Mark license as used
      await db.execute(`
        UPDATE nixty.product_license_base
        SET status = 'used'
        WHERE id = ?
      `, [license.id]);
      
      // Record license usage in transaction_license table
      await db.execute(`
        INSERT INTO nixty.transaction_license (transaction_id, license_id)
        VALUES (?, ?)
      `, [transactionId, license.id]);
    }
    
    // Commit transaction
    await db.execute('COMMIT');
    
    return {
      success: true,
      licenses: availableLicenses,
      count: availableLicenses.length
    };
  } catch (error) {
    // Rollback on error
    await db.execute('ROLLBACK');
    console.error('Error assigning licenses:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  
  try {
    const body = await readBody(event);
    const orderId = body.order_id;
    
    console.log(`Midtrans notification received for order ${orderId}`);
    
    // 1. Validate the signature key to ensure the notification is from Midtrans
    const receivedSignature = body.signature_key;
    const expectedSignature = await verifySignature(
      body.order_id,
      body.status_code,
      body.gross_amount,
      serverKey
    );

    if (receivedSignature !== expectedSignature) {
      console.error('Midtrans Notification: Invalid signature.');
      throw createError({ statusCode: 400, statusMessage: 'Invalid signature' });
    }

    // 2. Get transaction status and related info
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;

    // Find the transaction using order_id from the payment gateway logs
    const [transactionIdResult] = await db.execute(`
      SELECT transaction_id FROM nixty.payment_gateway_logs
      WHERE key = 'order_id' AND value = ?
      LIMIT 1
    `, [orderId]);
    
    if (transactionIdResult.length === 0) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Transaction not found for order_id: ' + orderId 
      });
    }
    
    const transactionId = transactionIdResult[0].transaction_id;
    
    // Get transaction details
    const [transactions] = await db.execute(`
      SELECT t.*, p.id as product_id
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ?
    `, [transactionId]);
    
    if (transactions.length === 0) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Transaction details not found: ' + transactionId 
      });
    }
    
    const transaction = transactions[0];
    
    // Determine database status
    let dbStatus = 'pending'; // Default status
    
    if (transactionStatus === 'capture') {
      // For credit card transaction from charge, status is capture.
      // If fraud status is 'challenge', the status is 'pending'.
      // If fraud status is 'accept', the status is 'success'.
      if (fraudStatus === 'accept') {
        dbStatus = 'completed';
      }
    } else if (transactionStatus === 'settlement') {
      // All other payment types, 'settlement' means success.
      // For QRIS: This is the final successful status after payment is confirmed
      dbStatus = 'completed';
    } else if (['cancel', 'expire', 'deny'].includes(transactionStatus)) {
      dbStatus = 'failed';
    }
    
    // Update transaction status
    await db.execute(`
      UPDATE nixty.transactions
      SET status = ?
      WHERE id = ?
    `, [dbStatus, transactionId]);
    
    // Store payment details in payment_gateway_logs
    await setPaymentGatewayLog(transactionId, 'transaction_status', transactionStatus);
    await setPaymentGatewayLog(transactionId, 'payment_type', paymentType);
    await setPaymentGatewayLog(transactionId, 'notification_received', new Date().toISOString());
    await setPaymentGatewayLog(transactionId, 'full_notification', JSON.stringify(body));
    
    console.log(`Transaction ${transactionId} status updated to ${dbStatus}`);
    
    // If payment completed, assign licenses
    let licenseResult = { success: false, count: 0 };
    
    if (dbStatus === 'completed') {
      // Check if licenses have already been assigned
      const [existingLicenses] = await db.execute(`
        SELECT COUNT(*) as count
        FROM nixty.transaction_license
        WHERE transaction_id = ?
      `, [transactionId]);
      
      const hasLicenses = existingLicenses[0].count > 0;
      
      if (!hasLicenses) {
        console.log(`Assigning licenses for transaction ${transactionId}`);
        
        // Get the quantity from transaction
        const quantity = transaction.quantity || 1;
        
        // Assign licenses
        licenseResult = await assignLicenseToTransaction(
          transactionId,
          transaction.product_id,
          quantity
        );
        
        if (licenseResult.success) {
          console.log(`Successfully assigned ${licenseResult.count} licenses to transaction ${transactionId}`);
        } else {
          console.error(`Failed to assign licenses to transaction ${transactionId}: ${licenseResult.message}`);
        }
      } else {
        console.log(`Licenses already assigned for transaction ${transactionId}`);
        licenseResult = { success: true, count: existingLicenses[0].count };
      }
    }
    
    // 4. Respond to Midtrans with a 200 OK
    return {
      status: 'ok',
      message: 'Notification processed successfully.',
      transaction_status: dbStatus,
      licenses_processed: licenseResult.count
    };

  } catch (err) {
    console.error('Error processing notification:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to process notification'
    });
  }
});
