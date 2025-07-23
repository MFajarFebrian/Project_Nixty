import { c as defineEventHandler, u as useRuntimeConfig, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import crypto from 'crypto';
import { s as sendMultipleLicenseEmail } from '../../../_/emailService.mjs';
import { a as processMultipleLicenses } from '../../../_/licenseService.mjs';
import { W as WebhookLogger } from '../../../_/webhookLogger.mjs';
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

async function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureKey = crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
  return signatureKey;
}
const notification_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  const startTime = Date.now();
  let webhookLogId = null;
  let orderId = null;
  try {
    const body = await readBody(event);
    orderId = body.order_id;
    webhookLogId = await WebhookLogger.logWebhookStart(orderId, body);
    console.log(`[WEBHOOK-${webhookLogId}] Midtrans notification received for order ${orderId}`);
    const receivedSignature = body.signature_key;
    const expectedSignature = await verifySignature(
      body.order_id,
      body.status_code,
      body.gross_amount,
      serverKey
    );
    if (receivedSignature !== expectedSignature) {
      console.error("Midtrans Notification: Invalid signature.");
      throw createError({ statusCode: 400, statusMessage: "Invalid signature" });
    }
    const transactionStatus = body.transaction_status;
    orderId = body.order_id;
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;
    let paymentCode = null;
    if (paymentType === "bank_transfer" && body.va_numbers && body.va_numbers.length > 0) {
      paymentCode = body.va_numbers[0].va_number;
    } else if (paymentType === "qris") {
      paymentCode = body.acquirer;
    } else if (paymentType === "cstore") {
      paymentCode = body.payment_code;
    }
    console.log(`Midtrans Notification: Received for order ${orderId} with status: ${transactionStatus}`);
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
    let dbStatus = "pending";
    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        dbStatus = "completed";
      }
    } else if (transactionStatus == "settlement") {
      dbStatus = "completed";
    } else if (transactionStatus == "cancel" || transactionStatus == "expire" || transactionStatus == "deny") {
      dbStatus = "failed";
    }
    await db.execute(updateQuery, [
      dbStatus,
      transactionStatus,
      JSON.stringify(body),
      // Store the full notification payload for reference
      paymentType,
      paymentCode,
      orderId
    ]);
    console.log(`Midtrans Notification: Order ${orderId} status updated to ${dbStatus}. Payment via ${paymentType}.`);
    let licenseProcessingSuccess = false;
    let licensesProcessed = 0;
    let emailSent = false;
    if (dbStatus === "completed") {
      console.log(`[WEBHOOK-${webhookLogId}] Processing license delivery for completed order ${orderId}`);
      await db.execute("START TRANSACTION");
      try {
        const [transactions2] = await db.execute(
          `SELECT o.*, u.email AS user_email, u.name AS user_name
           FROM nixty.orders o
           JOIN nixty.users u ON o.user_id = u.id
           WHERE o.order_id = ?`,
          [orderId]
        );
        if (transactions2.length > 0) {
          const transaction = transactions2[0];
          let customEmail = null;
          try {
            const [customEmailLogs] = await db.execute(
              `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'custom_email' LIMIT 1`,
              [transaction.id]
            );
            if (customEmailLogs.length > 0 && customEmailLogs[0].value) {
              customEmail = customEmailLogs[0].value;
              console.log(`[WEBHOOK-${webhookLogId}] Found custom email in logs: ${customEmail}`);
            }
          } catch (logError) {
            console.error(`[WEBHOOK-${webhookLogId}] Error fetching custom email from logs:`, logError);
          }
          let quantity = transaction.quantity || 1;
          if (quantity === 1 && body.item_details && Array.isArray(body.item_details) && body.item_details.length > 0) {
            const itemQuantity = body.item_details[0].quantity || 1;
            if (itemQuantity > 1) {
              quantity = itemQuantity;
              await db.execute(
                "UPDATE transactions SET quantity = ? WHERE id = ?",
                [quantity, transaction.id]
              );
            }
          }
          console.log(`Processing ${quantity} license(s) for order ${orderId}`);
          const allLicenses = [];
          let licenseProcessSuccess = true;
          const [beforeStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock before processing: ${stockBefore}`);
          const multipleLicensesResult = await processMultipleLicenses(
            transaction.id,
            transaction.product_id,
            quantity,
            customEmail,
            transaction.customer_name || "Customer"
          );
          if (multipleLicensesResult.success) {
            allLicenses.push(...multipleLicensesResult.licenses);
            licensesProcessed = multipleLicensesResult.licenses.length;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${licensesProcessed} licenses`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process multiple licenses: ${multipleLicensesResult.error || multipleLicensesResult.message}`);
            licenseProcessSuccess = false;
          }
          const [afterStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock after processing: ${stockAfter}`);
          const expectedStockReduction = licensesProcessed;
          const actualStockReduction = stockBefore - stockAfter;
          if (actualStockReduction !== expectedStockReduction) {
            console.warn(`[WEBHOOK-${webhookLogId}] Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
            if (actualStockReduction < expectedStockReduction) {
              console.log(`[WEBHOOK-${webhookLogId}] Attempting to refresh stock view...`);
              await db.execute(`
                UPDATE product_licenses 
                SET updated_at = NOW() 
                WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
              `, [transaction.product_id, transaction.id]);
            }
          }
          if (licenseProcessSuccess && allLicenses.length > 0) {
            await db.execute(
              `UPDATE transactions 
               SET license_info = ? 
               WHERE id = ?`,
              [JSON.stringify(allLicenses), transaction.id]
            );
            licenseProcessingSuccess = true;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${allLicenses.length} licenses for order ${orderId}`);
            await db.execute("COMMIT");
          } else {
            await db.execute("ROLLBACK");
            console.error(`[WEBHOOK-${webhookLogId}] License processing failed, rolling back`);
          }
          if (licenseProcessingSuccess && allLicenses.length > 0) {
            console.log(`[WEBHOOK-${webhookLogId}] Preparing to send email with ${allLicenses.length} license(s)`);
            console.log(`[WEBHOOK-${webhookLogId}] Email parameters:`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Primary email: ${transaction.email}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Customer name: ${transaction.customer_name || "Customer"}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Product name: ${transaction.product_name || `Product ${transaction.product_id}`}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Order ID: ${orderId}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Custom email: ${customEmail !== transaction.email ? customEmail : "None (using primary)"}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - License count: ${allLicenses.length}`);
            try {
              const emailResult = await sendMultipleLicenseEmail(
                transaction.user_email,
                // Use the fetched user email
                transaction.customer_name || "Customer",
                transaction.product_name || `Product ${transaction.product_id}`,
                allLicenses,
                orderId,
                // Include Order ID
                customEmail
                // Pass the retrieved custom email
              );
              console.log(`[WEBHOOK-${webhookLogId}] Email service response:`, emailResult);
              if (emailResult.success) {
                emailSent = true;
                console.log(`[WEBHOOK-${webhookLogId}] \u2705 License email sent successfully to: ${transaction.user_email}${customEmail ? ` and ${customEmail}` : ""}`);
              } else {
                console.error(`[WEBHOOK-${webhookLogId}] \u274C Failed to send license email:`);
                console.error(`[WEBHOOK-${webhookLogId}]    Error: ${emailResult.error || emailResult.message}`);
                if (emailResult.details) {
                  console.error(`[WEBHOOK-${webhookLogId}]    Details:`, emailResult.details);
                }
              }
            } catch (emailError) {
              console.error(`[WEBHOOK-${webhookLogId}] \u274C Exception thrown during email sending:`);
              console.error(`[WEBHOOK-${webhookLogId}]    Error: ${emailError.message}`);
              console.error(`[WEBHOOK-${webhookLogId}]    Stack:`, emailError.stack);
            }
          } else if (allLicenses.length > 0) {
            console.warn(`[WEBHOOK-${webhookLogId}] Partial license delivery for order ${orderId}: ${licensesProcessed}/${quantity} licenses processed`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process any licenses for order ${orderId}`);
          }
        }
      } catch (licenseError) {
        await db.execute("ROLLBACK");
        console.error(`[WEBHOOK-${webhookLogId}] Error processing license delivery:`, licenseError);
        if ((transactions == null ? void 0 : transactions.length) > 0) {
          await WebhookLogger.logLicenseDeliveryFailure(
            transactions[0].id,
            orderId,
            `License processing error: ${licenseError.message}`
          );
        }
      }
    }
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
    return {
      status: "ok",
      message: "Notification processed successfully.",
      licenses_processed: licensesProcessed,
      email_sent: emailSent
    };
  } catch (err) {
    const processingDuration = Date.now() - startTime;
    await WebhookLogger.logWebhookError(
      webhookLogId,
      err.message,
      err.statusCode || 500
    );
    console.error(`[WEBHOOK-${webhookLogId || "UNKNOWN"}] Error after ${processingDuration}ms:`, err);
    return {
      status: "error",
      message: "Notification processed with errors",
      error: err.message
    };
  }
});

export { notification_post as default };
//# sourceMappingURL=notification.post.mjs.map
