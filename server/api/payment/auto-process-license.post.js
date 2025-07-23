import db from '../../utils/db.js';
import { processLicenseDelivery } from '../../utils/licenseService.js';
import { sendLicenseEmail, sendMultipleLicenseEmail } from '../../utils/emailService.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id, transaction_status } = body;
    
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      });
    }
    
    console.log(`Auto-processing license for order: ${order_id}, status: ${transaction_status}`);
    
    // Only process if payment is successful
    if (transaction_status !== 'settlement' && transaction_status !== 'capture') {
      return {
        success: false,
        message: 'Payment not completed, license processing skipped',
        order_id
      };
    }
    
    // Get transaction details directly from orders table using order_id
    const [orderResults] = await db.query(
      'SELECT id FROM nixty.orders WHERE order_id = $1',
      [order_id]
    );
    
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }
    
    const transactionId = orderResults[0].id;
    
    // Get order details with user and product information
    const [orders] = await db.query(
      `SELECT o.*, u.email as user_email, u.name as user_name, p.name as product_name
       FROM nixty.orders o
       LEFT JOIN nixty.users u ON o.user_id = u.id
       LEFT JOIN nixty.products p ON o.product_id = p.id
       WHERE o.id = $1`,
      [transactionId]
    );
    
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      });
    }
    
    const transaction = orders[0];
    
    // Check if license already processed
    const [existingLicenses] = await db.query(
      'SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = $1',
      [transactionId]
    );
    
    if (existingLicenses[0].count > 0) {
      console.log(`License already processed for order ${order_id}`);
      return {
        success: true,
        message: 'License already processed',
        order_id,
        licenses_count: existingLicenses[0].count,
        already_processed: true
      };
    }
    
    // Update order status if needed
    if (transaction.status !== 'completed') {
      await db.query(
        `UPDATE nixty.orders SET status = 'completed' WHERE id = $1`,
        [transactionId]
      );
      console.log(`Order status updated to completed for order ${order_id}`);
    }
    
    // Process licenses
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    let licensesProcessed = 0;
    
    console.log(`Processing ${quantity} license(s) for order ${order_id}`);
    
    // Check stock before processing
    const [stockCheck] = await db.query(
      `SELECT 
        COUNT(*) as total_licenses,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = $1`,
      [transaction.product_id]
    );
    
    const availableStock = stockCheck.length > 0 ? parseInt(stockCheck[0].available_stock || 0) : 0;
    console.log(`Available stock: ${availableStock} for product ${transaction.product_id}`);
    
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Required: ${quantity}, Available: ${availableStock}`);
    }
    
    // Start database transaction for license processing
    try {
      await db.execute('START TRANSACTION');
      console.log(`🔐 Database transaction started for order ${order_id}`);
      
      // Process all licenses at once to ensure no duplicate
      const [availableLicenses] = await db.execute(
        `SELECT id FROM nixty.product_license_base 
         WHERE product_id = ? AND status = 'available' 
         ORDER BY id ASC 
         LIMIT ?`,
        [transaction.product_id, quantity]
      );
      
      if (availableLicenses.length < quantity) {
        console.error(`❌ Not enough available licenses for order ${order_id}`);
        await db.execute('ROLLBACK');
        throw new Error(`Not enough available licenses. Required: ${quantity}, Found: ${availableLicenses.length}`);
      }
      
      console.log(`🎯 Selected ${availableLicenses.length} licenses: ${availableLicenses.map(l => l.id).join(', ')}`);
      
      for (let i = 0; i < quantity; i++) {
        const licenseId = availableLicenses[i].id;
        console.log(`Processing license ${i + 1}/${quantity} (ID: ${licenseId}) for order ${order_id}`);

        // Mark license as used and link to transaction
        await db.execute(
          `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
          [licenseId]
        );
        
        await db.execute(
          `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
          [transactionId, licenseId]
        );

        // Get the license details for response
        const [licenseDetails] = await db.execute(
          `SELECT plb.*, plk.product_key, pla.email, pla.password 
           FROM nixty.product_license_base plb
           LEFT JOIN nixty.product_license_keys plk ON plb.id = plk.id
           LEFT JOIN nixty.product_license_accounts pla ON plb.id = pla.id
           WHERE plb.id = ?`,
          [licenseId]
        );
        
        if (licenseDetails.length > 0) {
          allLicenses.push(licenseDetails[0]);
          console.log(`✅ License ${i + 1} (ID: ${licenseId}) processed successfully for order ${order_id}`);
        } else {
          console.error(`❌ License details not found for license ID ${licenseId}`);
          await db.execute('ROLLBACK');
          throw new Error(`License details not found for license ID ${licenseId}`);
        }
        
        licensesProcessed++;
      }
      
      // Commit transaction if all licenses processed successfully
      await db.execute('COMMIT');
      console.log(`✅ Database transaction committed for order ${order_id}`);
      
    } catch (transactionError) {
      console.error(`❌ License processing transaction failed for order ${order_id}:`, transactionError);
      try {
        await db.execute('ROLLBACK');
        console.log(`🔙 Transaction rolled back for order ${order_id}`);
      } catch (rollbackError) {
        console.error(`❌ Rollback failed:`, rollbackError);
      }
      throw transactionError;
    }
    
    // Verify all licenses are unique
    if (allLicenses.length > 0) {
      // Check for unique license IDs
      const licenseIds = allLicenses.map(license => license.id);
      const uniqueLicenseIds = [...new Set(licenseIds)];
      
      if (licenseIds.length !== uniqueLicenseIds.length) {
        console.error(`❌ Duplicate licenses detected! Total: ${licenseIds.length}, Unique: ${uniqueLicenseIds.length}`);
        throw new Error('Duplicate licenses were assigned. Please contact support.');
      }
      
      // Log license details for verification
      console.log(`✅ ${allLicenses.length} unique license(s) linked to order ${transactionId} for order ${order_id}`);
      allLicenses.forEach((license, index) => {
        console.log(`  License ${index + 1}: ID=${license.id}, Type=${license.license_type}, Key=${license.product_key ? license.product_key.substring(0, 8) + '***' : 'N/A'}`);
      });
      
      // Prepare license info for email
      const emailLicenses = allLicenses.map(license => ({
        license_id: license.id,
        license_type: license.license_type,
        product_key: license.product_key,
        email: license.email,
        password: license.password,
        additional_info: license.additional_info || '',
        notes: license.notes || '',
        send_license: 1,
        max_usage: license.max_usage || 1
      }));
      
      // Get customer information
      const userEmail = transaction.user_email; // User's registered email
      const customerName = transaction.user_name || 'Customer';
      const productName = transaction.product_name || `Product ${transaction.product_id}`;
      
      // Check for custom email in payment_gateway_logs and prioritize it
      let finalEmail = userEmail; // Default to user email
      try {
        const [customEmailLogs] = await db.execute(
          "SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'custom_email' LIMIT 1",
          [transactionId]
        );
        
        if (customEmailLogs.length > 0 && customEmailLogs[0].value) {
          finalEmail = customEmailLogs[0].value; // Override with custom email
          console.log(`Using custom email instead of user email: ${finalEmail}`);
        } else {
          console.log(`No custom email found, using user email: ${finalEmail}`);
        }
      } catch (logError) {
        console.error(`Error fetching custom email from logs:`, logError);
        console.log(`Fallback to user email: ${finalEmail}`);
      }
      
      // Validate final email
      if (!finalEmail || finalEmail.trim() === '') {
        console.error(`❌ No valid email found for order ${order_id}`);
        throw new Error('No valid email address found for license delivery');
      }
      
      // Send email with license information
      try {
        console.log(`📧 Attempting to send email to: ${finalEmail}`);
        console.log(`📧 Email details - Customer: ${customerName}, Product: ${productName}, Order: ${order_id}`);
        console.log(`📧 Number of licenses to send: ${emailLicenses.length}`);
        
        let emailResult;
        
if (emailLicenses.length > 1) {
          // Send multiple licenses in one email
          console.log(`📧 Sending multiple licenses email...`);
          emailResult = await sendMultipleLicenseEmail(
            finalEmail, // Use single final email
            customerName,
            productName,
            emailLicenses,
            order_id,
            null // No CC email, send to one recipient only
          );
        } else {
          // Send single license
          console.log(`📧 Sending single license email...`);
          emailResult = await sendLicenseEmail(
            finalEmail, // Use single final email
            customerName,
            productName,
            emailLicenses[0],
            order_id,
            null // No CC email, send to one recipient only
          );
        }
        
        if (emailResult.success) {
          console.log(`✅ License email sent successfully to: ${finalEmail}`);
          console.log(`✉️ Email Message ID: ${emailResult.messageId}`);
          
          // Log the success in a table if it exists
          try {
            await db.execute(
              `INSERT INTO nixty.email_logs (order_id, recipients, status, sent_at) 
               VALUES (?, ?, 'success', NOW())`,
              [order_id, finalEmail]
            );
          } catch (emailLogError) {
            console.warn(`Note: Could not log email in database - table might not exist: ${emailLogError.message}`);
          }
        } else {
          console.error(`❌ Failed to send license email: ${emailResult.error || emailResult.message}`);
          
          // Log the failure in a table if it exists
          try {
            await db.execute(
              `INSERT INTO nixty.email_logs (order_id, recipients, status, error_message, sent_at) 
               VALUES (?, ?, 'failed', ?, NOW())`,
              [order_id, finalEmail, emailResult.error || emailResult.message]
            );
          } catch (emailLogError) {
            console.warn(`Note: Could not log email failure in database - table might not exist: ${emailLogError.message}`);
          }
        }
      } catch (emailError) {
        console.error('Error sending license email:', emailError);
        console.error('Error details:', {
          code: emailError.code,
          message: emailError.message,
          command: emailError.command
        });
      }
    }
    
    // Verify final stock
    const [finalStock] = await db.execute(
      `SELECT 
        COUNT(*) as total_licenses,
        SUM(CASE 
          WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
          THEN (max_usage - COALESCE(send_license, 0))
          ELSE 0 
        END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?`,
      [transaction.product_id]
    );
    const finalAvailableStock = finalStock.length > 0 ? parseInt(finalStock[0].available_stock || 0) : 0;
    console.log(`Final available stock: ${finalAvailableStock} for product ${transaction.product_id}`);
    
    return {
      success: true,
      message: `Successfully processed ${licensesProcessed} license(s)`,
      order_id,
      transaction_id: transaction.id,
      licenses_processed: licensesProcessed,
      total_quantity: quantity,
      stock_before: availableStock,
      stock_after: finalAvailableStock,
      licenses: allLicenses.map(license => ({
        license_type: license.license_type,
        product_key: license.product_key ? '***' + license.product_key.slice(-4) : null,
        email: license.email || null,
        additional_info: license.additional_info || null
      }))
    };
    
  } catch (error) {
    console.error('Auto license processing error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to process license automatically'
    });
  }
});

