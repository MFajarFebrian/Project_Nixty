import { defineEventHandler, readBody } from 'h3';
import crypto from 'crypto';
import db from '../../utils/db';
import { sendLicenseEmail, sendMultipleLicenseEmail } from '../../utils/emailService.js';
import { processLicenseDelivery, processMultipleLicenses } from '../../utils/licenseService.js';
import WebhookLogger from '../../utils/webhookLogger.js';

// In Nuxt 3 server routes, useRuntimeConfig is auto-imported.
// No need for: import { useRuntimeConfig } from '#app';

// This is a simplified handler. In a real-world scenario, you would use the official Midtrans Node.js library
// to verify the signature key for better security.
// See: https://github.com/midtrans/midtrans-nodejs-client

async function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureKey = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');
  return signatureKey;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  
  const startTime = Date.now();
  let webhookLogId = null;
  let orderId = null;
  
  try {
    const body = await readBody(event);
    orderId = body.order_id;
    
    // Log webhook start
    webhookLogId = await WebhookLogger.logWebhookStart(orderId, body);
    console.log(`[WEBHOOK-${webhookLogId}] Midtrans notification received for order ${orderId}`);
    
    
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

    // 2. Safely get transaction status and order ID
    const transactionStatus = body.transaction_status;
    orderId = body.order_id; // Use the already declared variable
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;

    // Helper to extract payment code/number
    let paymentCode = null;
    if (paymentType === 'bank_transfer' && body.va_numbers && body.va_numbers.length > 0) {
      paymentCode = body.va_numbers[0].va_number;
    } else if (paymentType === 'qris') {
      paymentCode = body.acquirer; // e.g., 'gopay', 'shopeepay'
    } else if (paymentType === 'cstore') {
      paymentCode = body.payment_code;
    }

    console.log(`Midtrans Notification: Received for order ${orderId} with status: ${transactionStatus}`);

    // 3. Update the transaction status in your database
    const updateQuery = `
      UPDATE transactions 
      SET 
        status = ?, 
        payment_gateway_status = ?, 
        payment_gateway_payload = ?,
        payment_method = ?,
        va_number = ?,
        updated_at = NOW()
      WHERE order_id = ?
    `;

    let dbStatus = 'pending'; // Default status

    // QRIS Status Flow: QRIS transactions typically start with 'pending' status
    // when the QR code is generated, then transition to 'settlement' when paid.
    // The flow is: pending → settlement (completed)
    
    if (transactionStatus == 'capture') {
      // For credit card transaction from charge, status is capture.
      // If fraud status is 'challenge', the status is 'pending'.
      // If fraud status is 'accept', the status is 'success'.
      if (fraudStatus == 'accept') {
        dbStatus = 'completed';
      }
    } else if (transactionStatus == 'settlement') {
      // All other payment types, 'settlement' means success.
      // For QRIS: This is the final successful status after payment is confirmed
      dbStatus = 'completed';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'expire' || transactionStatus == 'deny') {
      dbStatus = 'failed';
    }

    await db.execute(updateQuery, [
      dbStatus,
      transactionStatus,
      JSON.stringify(body), // Store the full notification payload for reference
      paymentType,
      paymentCode,
      orderId
    ]);
    
    console.log(`Midtrans Notification: Order ${orderId} status updated to ${dbStatus}. Payment via ${paymentType}.`);
    
    // 5. Process license delivery if payment is completed
    let licenseProcessingSuccess = false;
    let licensesProcessed = 0;
    let emailSent = false;
    
    if (dbStatus === 'completed') {
      console.log(`[WEBHOOK-${webhookLogId}] Processing license delivery for completed order ${orderId}`);
      
      // Start database transaction for license processing
      await db.execute('START TRANSACTION');
      
      try {
        // Get transaction details including custom email
        const [transactions] = await db.execute(
          'SELECT * FROM transactions WHERE order_id = ?',
          [orderId]
        );
        
        if (transactions.length > 0) {
          const transaction = transactions[0];
          let customEmail = transaction.email; // Default to transaction email
          
          // Extract custom email from payload if available
          if (transaction.payment_gateway_payload) {
            try {
              const payload = JSON.parse(transaction.payment_gateway_payload);
              if (payload.custom_email) {
                customEmail = payload.custom_email;
              }
            } catch (parseError) {
              console.error('Error parsing payment gateway payload:', parseError);
            }
          }
          
          // Get quantity from database (with fallback)
          let quantity = transaction.quantity || 1;
          
          // Fallback: try to get from item_details if quantity is 1 and item_details has different value
          if (quantity === 1 && body.item_details && Array.isArray(body.item_details) && body.item_details.length > 0) {
            const itemQuantity = body.item_details[0].quantity || 1;
            if (itemQuantity > 1) {
              quantity = itemQuantity;
              // Update database with correct quantity for future reference
              await db.execute(
                'UPDATE transactions SET quantity = ? WHERE id = ?',
                [quantity, transaction.id]
              );
            }
          }
          
          console.log(`Processing ${quantity} license(s) for order ${orderId}`);
          
          // Collect all license results for combined email
          const allLicenses = [];
          let licenseProcessSuccess = true;
          
          // Get current stock before processing
          const [beforeStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock before processing: ${stockBefore}`);
          
          // Process multiple licenses atomically
          const multipleLicensesResult = await processMultipleLicenses(
            transaction.id,
            transaction.product_id,
            quantity,
            customEmail,
            transaction.customer_name || 'Customer'
          );
          
          if (multipleLicensesResult.success) {
            allLicenses.push(...multipleLicensesResult.licenses);
            licensesProcessed = multipleLicensesResult.licenses.length;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${licensesProcessed} licenses`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process multiple licenses: ${multipleLicensesResult.error || multipleLicensesResult.message}`);
            licenseProcessSuccess = false;
          }
          
          // Verify stock was properly reduced
          const [afterStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock after processing: ${stockAfter}`);
          
          // Verify stock reduction
          const expectedStockReduction = licensesProcessed;
          const actualStockReduction = stockBefore - stockAfter;
          
          if (actualStockReduction !== expectedStockReduction) {
            console.warn(`[WEBHOOK-${webhookLogId}] Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
            
            // Force refresh stock view if needed
            if (actualStockReduction < expectedStockReduction) {
              console.log(`[WEBHOOK-${webhookLogId}] Attempting to refresh stock view...`);
              await db.execute(`
                UPDATE product_licenses 
                SET updated_at = NOW() 
                WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
              `, [transaction.product_id, transaction.id]);
            }
          }
          
          // If all licenses were processed successfully, store them in the transaction
          if (licenseProcessSuccess && allLicenses.length > 0) {
            // Store all licenses at once in the transaction record
            await db.execute(
              `UPDATE transactions 
               SET license_info = ? 
               WHERE id = ?`,
              [JSON.stringify(allLicenses), transaction.id]
            );
            
            licenseProcessingSuccess = true;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${allLicenses.length} licenses for order ${orderId}`);
            
            // Commit the transaction
            await db.execute('COMMIT');
          } else {
            // Rollback if any license processing failed
            await db.execute('ROLLBACK');
            console.error(`[WEBHOOK-${webhookLogId}] License processing failed, rolling back`);
          }
          
          // Send combined email with all licenses if successful
          if (licenseProcessingSuccess && allLicenses.length > 0) {
            console.log(`[WEBHOOK-${webhookLogId}] Sending email with ${allLicenses.length} license(s) to ${customEmail}...`);
            
            const emailResult = await sendMultipleLicenseEmail(
              customEmail,
              transaction.customer_name || 'Customer',
              transaction.product_name || `Product ${transaction.product_id}`,
              allLicenses
            );
            
            if (emailResult.success) {
              emailSent = true;
              console.log(`[WEBHOOK-${webhookLogId}] License email sent successfully`);
            } else {
              console.error(`[WEBHOOK-${webhookLogId}] Failed to send license email: ${emailResult.error || emailResult.message}`);
            }
          } else if (allLicenses.length > 0) {
            // Partial success - some licenses processed
            console.warn(`[WEBHOOK-${webhookLogId}] Partial license delivery for order ${orderId}: ${licensesProcessed}/${quantity} licenses processed`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process any licenses for order ${orderId}`);
          }
        }
      } catch (licenseError) {
        // Rollback transaction on error
        await db.execute('ROLLBACK');
        console.error(`[WEBHOOK-${webhookLogId}] Error processing license delivery:`, licenseError);
        
        // Log the delivery failure
        if (transactions?.length > 0) {
          await WebhookLogger.logLicenseDeliveryFailure(
            transactions[0].id,
            orderId,
            `License processing error: ${licenseError.message}`
          );
        }
        
        // Don't throw error here to avoid payment notification failure
      }
    }
    // Log webhook completion
    const processingDuration = Date.now() - startTime;
    await WebhookLogger.logWebhookComplete(
      webhookLogId,
      200,
      licenseProcessingSuccess,
      licensesProcessed,
      emailSent,
      processingDuration
    );
    
    console.log(`[WEBHOOK-${webhookLogId}] Completed in ${processingDuration}ms - Licenses: ${licensesProcessed}, Email: ${emailSent}`);
    
    // 4. Respond to Midtrans with a 200 OK
    return {
      status: 'ok',
      message: 'Notification processed successfully.',
      licenses_processed: licensesProcessed,
      email_sent: emailSent
    };

  } catch (err) {
    const processingDuration = Date.now() - startTime;
    
    // Log webhook error
    await WebhookLogger.logWebhookError(
      webhookLogId,
      err.message,
      err.statusCode || 500
    );
    
    console.error(`[WEBHOOK-${webhookLogId || 'UNKNOWN'}] Error after ${processingDuration}ms:`, err);
    
    // Even on error, return 200 to avoid Midtrans resending notifications
    // but log the error internally for manual checking
    return {
      status: 'error',
      message: 'Notification processed with errors',
      error: err.message
    };
  }
});
