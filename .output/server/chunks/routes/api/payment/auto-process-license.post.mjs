import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { s as sendMultipleLicenseEmail, a as sendLicenseEmail } from '../../../_/emailService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';
import 'path';
import 'url';
import 'dotenv';

const autoProcessLicense_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id, transaction_status } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    console.log(`Auto-processing license for order: ${order_id}, status: ${transaction_status}`);
    if (transaction_status !== "settlement" && transaction_status !== "capture") {
      return {
        success: false,
        message: "Payment not completed, license processing skipped",
        order_id
      };
    }
    const [orderResults] = await db.execute(
      "SELECT id FROM nixty.orders WHERE order_id = ?",
      [order_id]
    );
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transactionId = orderResults[0].id;
    const [orders] = await db.execute(
      `SELECT o.*, u.email as user_email, u.name as user_name, p.name as product_name
       FROM nixty.orders o
       LEFT JOIN nixty.users u ON o.user_id = u.id
       LEFT JOIN nixty.products p ON o.product_id = p.id
       WHERE o.id = ?`,
      [transactionId]
    );
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Order not found"
      });
    }
    const transaction = orders[0];
    const [existingLicenses] = await db.execute(
      "SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = ?",
      [transactionId]
    );
    if (existingLicenses[0].count > 0) {
      console.log(`License already processed for order ${order_id}`);
      return {
        success: true,
        message: "License already processed",
        order_id,
        licenses_count: existingLicenses[0].count,
        already_processed: true
      };
    }
    if (transaction.status !== "completed") {
      await db.execute(
        `UPDATE nixty.orders SET status = 'completed' WHERE id = ?`,
        [transactionId]
      );
      console.log(`Order status updated to completed for order ${order_id}`);
    }
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    let licensesProcessed = 0;
    console.log(`Processing ${quantity} license(s) for order ${order_id}`);
    const [stockCheck] = await db.execute(
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
    const availableStock = stockCheck.length > 0 ? parseInt(stockCheck[0].available_stock || 0) : 0;
    console.log(`Available stock: ${availableStock} for product ${transaction.product_id}`);
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Required: ${quantity}, Available: ${availableStock}`);
    }
    try {
      await db.execute("START TRANSACTION");
      console.log(`\u{1F510} Database transaction started for order ${order_id}`);
      const [availableLicenses] = await db.execute(
        `SELECT id FROM nixty.product_license_base 
         WHERE product_id = ? AND status = 'available' 
         ORDER BY id ASC 
         LIMIT ?`,
        [transaction.product_id, quantity]
      );
      if (availableLicenses.length < quantity) {
        console.error(`\u274C Not enough available licenses for order ${order_id}`);
        await db.execute("ROLLBACK");
        throw new Error(`Not enough available licenses. Required: ${quantity}, Found: ${availableLicenses.length}`);
      }
      console.log(`\u{1F3AF} Selected ${availableLicenses.length} licenses: ${availableLicenses.map((l) => l.id).join(", ")}`);
      for (let i = 0; i < quantity; i++) {
        const licenseId = availableLicenses[i].id;
        console.log(`Processing license ${i + 1}/${quantity} (ID: ${licenseId}) for order ${order_id}`);
        await db.execute(
          `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
          [licenseId]
        );
        await db.execute(
          `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
          [transactionId, licenseId]
        );
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
          console.log(`\u2705 License ${i + 1} (ID: ${licenseId}) processed successfully for order ${order_id}`);
        } else {
          console.error(`\u274C License details not found for license ID ${licenseId}`);
          await db.execute("ROLLBACK");
          throw new Error(`License details not found for license ID ${licenseId}`);
        }
        licensesProcessed++;
      }
      await db.execute("COMMIT");
      console.log(`\u2705 Database transaction committed for order ${order_id}`);
    } catch (transactionError) {
      console.error(`\u274C License processing transaction failed for order ${order_id}:`, transactionError);
      try {
        await db.execute("ROLLBACK");
        console.log(`\u{1F519} Transaction rolled back for order ${order_id}`);
      } catch (rollbackError) {
        console.error(`\u274C Rollback failed:`, rollbackError);
      }
      throw transactionError;
    }
    if (allLicenses.length > 0) {
      const licenseIds = allLicenses.map((license) => license.id);
      const uniqueLicenseIds = [...new Set(licenseIds)];
      if (licenseIds.length !== uniqueLicenseIds.length) {
        console.error(`\u274C Duplicate licenses detected! Total: ${licenseIds.length}, Unique: ${uniqueLicenseIds.length}`);
        throw new Error("Duplicate licenses were assigned. Please contact support.");
      }
      console.log(`\u2705 ${allLicenses.length} unique license(s) linked to order ${transactionId} for order ${order_id}`);
      allLicenses.forEach((license, index) => {
        console.log(`  License ${index + 1}: ID=${license.id}, Type=${license.license_type}, Key=${license.product_key ? license.product_key.substring(0, 8) + "***" : "N/A"}`);
      });
      const emailLicenses = allLicenses.map((license) => ({
        license_id: license.id,
        license_type: license.license_type,
        product_key: license.product_key,
        email: license.email,
        password: license.password,
        additional_info: license.additional_info || "",
        notes: license.notes || "",
        send_license: 1,
        max_usage: license.max_usage || 1
      }));
      const userEmail = transaction.user_email;
      const customerName = transaction.user_name || "Customer";
      const productName = transaction.product_name || `Product ${transaction.product_id}`;
      let finalEmail = userEmail;
      try {
        const [customEmailLogs] = await db.execute(
          "SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'custom_email' LIMIT 1",
          [transactionId]
        );
        if (customEmailLogs.length > 0 && customEmailLogs[0].value) {
          finalEmail = customEmailLogs[0].value;
          console.log(`Using custom email instead of user email: ${finalEmail}`);
        } else {
          console.log(`No custom email found, using user email: ${finalEmail}`);
        }
      } catch (logError) {
        console.error(`Error fetching custom email from logs:`, logError);
        console.log(`Fallback to user email: ${finalEmail}`);
      }
      if (!finalEmail || finalEmail.trim() === "") {
        console.error(`\u274C No valid email found for order ${order_id}`);
        throw new Error("No valid email address found for license delivery");
      }
      try {
        console.log(`\u{1F4E7} Attempting to send email to: ${finalEmail}`);
        console.log(`\u{1F4E7} Email details - Customer: ${customerName}, Product: ${productName}, Order: ${order_id}`);
        console.log(`\u{1F4E7} Number of licenses to send: ${emailLicenses.length}`);
        let emailResult;
        if (emailLicenses.length > 1) {
          console.log(`\u{1F4E7} Sending multiple licenses email...`);
          emailResult = await sendMultipleLicenseEmail(
            finalEmail,
            // Use single final email
            customerName,
            productName,
            emailLicenses,
            order_id,
            null
            // No CC email, send to one recipient only
          );
        } else {
          console.log(`\u{1F4E7} Sending single license email...`);
          emailResult = await sendLicenseEmail(
            finalEmail,
            // Use single final email
            customerName,
            productName,
            emailLicenses[0],
            order_id,
            null
            // No CC email, send to one recipient only
          );
        }
        if (emailResult.success) {
          console.log(`\u2705 License email sent successfully to: ${finalEmail}`);
          console.log(`\u2709\uFE0F Email Message ID: ${emailResult.messageId}`);
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
          console.error(`\u274C Failed to send license email: ${emailResult.error || emailResult.message}`);
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
        console.error("Error sending license email:", emailError);
        console.error("Error details:", {
          code: emailError.code,
          message: emailError.message,
          command: emailError.command
        });
      }
    }
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
      licenses: allLicenses.map((license) => ({
        license_type: license.license_type,
        product_key: license.product_key ? "***" + license.product_key.slice(-4) : null,
        email: license.email || null,
        additional_info: license.additional_info || null
      }))
    };
  } catch (error) {
    console.error("Auto license processing error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to process license automatically"
    });
  }
});

export { autoProcessLicense_post as default };
//# sourceMappingURL=auto-process-license.post.mjs.map
