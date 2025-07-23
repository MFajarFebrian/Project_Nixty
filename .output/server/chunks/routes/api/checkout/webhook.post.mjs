import { c as defineEventHandler, r as readBody, f as db, e as createError, n as midtransConfig } from '../../../_/nitro.mjs';
import midtransClient from 'midtrans-client';
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

new midtransClient.CoreApi({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});
const webhook_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Received Midtrans Webhook:", body);
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;
  let newStatus = "pending";
  if (transaction_status == "capture") {
    if (fraud_status == "accept") {
      newStatus = "completed";
    }
  } else if (transaction_status == "settlement") {
    newStatus = "completed";
  } else if (transaction_status == "cancel" || transaction_status == "deny" || transaction_status == "expire") {
    newStatus = "failed";
  } else if (transaction_status == "pending") {
    newStatus = "pending";
  }
  try {
    const [result] = await db.execute(
      `UPDATE transactions SET status = ?, payment_method = ?, payment_gateway_status = ?, payment_gateway_payload = ?, updated_at = NOW() WHERE order_id = ?`,
      [newStatus, body.payment_type || "midtrans", transaction_status, JSON.stringify(body), order_id]
    );
    if (result.affectedRows > 0) {
      console.log(`Transaction ${order_id} updated to ${newStatus}`);
      if (newStatus === "completed") {
        const [transactionRows] = await db.execute("SELECT id, product_id, quantity, user_id, email, customer_name, product_name FROM transactions WHERE order_id = ?", [order_id]);
        if (transactionRows.length > 0) {
          const transactionId = transactionRows[0].id;
          const productId = transactionRows[0].product_id;
          const quantity = transactionRows[0].quantity || 1;
          const userId = transactionRows[0].user_id;
          const customerEmail = transactionRows[0].email;
          const customerName = transactionRows[0].customer_name || "Customer";
          const productName = transactionRows[0].product_name || `Product ${productId}`;
          const [availableLicenses] = await db.execute(
            `SELECT id, license_type, product_key, email, password, additional_info, send_license, max_usage, notes 
             FROM product_licenses 
             WHERE product_id = ? 
             AND status = 'available' 
             AND (send_license < max_usage OR send_license IS NULL)
             ORDER BY created_at ASC 
             LIMIT ?`,
            [productId, quantity]
          );
          if (availableLicenses.length >= quantity) {
            const licenseInfo = availableLicenses.map((license) => ({
              license_id: license.id,
              license_type: license.license_type,
              product_key: license.product_key,
              email: license.email,
              password: license.password,
              additional_info: license.additional_info,
              notes: license.notes,
              send_license: (license.send_license || 0) + 1,
              max_usage: license.max_usage || 1
            }));
            await db.execute(
              `UPDATE transactions SET license_info = ? WHERE id = ?`,
              [JSON.stringify(licenseInfo), transactionId]
            );
            for (const license of availableLicenses) {
              const newSendLicense = (license.send_license || 0) + 1;
              const newStatus2 = newSendLicense >= license.max_usage ? "used" : "available";
              await db.execute(
                `UPDATE product_licenses 
                 SET send_license = ?, status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [newSendLicense, newStatus2, license.id]
              );
            }
            console.log(`\u2705 ${quantity} license(s) assigned to transaction ${transactionId}:`);
            licenseInfo.forEach((license, index) => {
              console.log(`   License ${index + 1}: ${license.license_type} - ${license.product_key || license.email}`);
            });
            let customEmail = null;
            try {
              const [customEmailLogs] = await db.execute(
                "SELECT log_value FROM payment_gateway_logs WHERE transaction_id = ? AND log_key = 'custom_email' LIMIT 1",
                [transactionId]
              );
              if (customEmailLogs.length > 0 && customEmailLogs[0].log_value) {
                customEmail = customEmailLogs[0].log_value;
                console.log(`Found custom email in logs: ${customEmail}`);
              }
            } catch (logError) {
              console.error(`Error fetching custom email from logs:`, logError);
            }
            try {
              let emailResult;
              if (quantity > 1) {
                emailResult = await sendMultipleLicenseEmail(
                  customerEmail,
                  customerName,
                  productName,
                  licenseInfo,
                  order_id,
                  customEmail !== customerEmail ? customEmail : null
                );
                console.log("Email sending result:", emailResult);
                if (!emailResult.success) {
                  console.error(`Failed to send license email: ${emailResult.error || emailResult.message}`);
                } else {
                  console.log(`\u2705 License email sent successfully to: ${customerEmail}${customEmail ? ` and ${customEmail}` : ""}`);
                }
              } else {
                emailResult = await sendLicenseEmail(
                  customerEmail,
                  customerName,
                  productName,
                  licenseInfo[0],
                  order_id,
                  customEmail !== customerEmail ? customEmail : null
                );
                console.log("Email sending result:", emailResult);
                if (!emailResult.success) {
                  console.error(`Failed to send license email: ${emailResult.error || emailResult.message}`);
                } else {
                  console.log(`\u2705 License email sent successfully to: ${customerEmail}${customEmail ? ` and ${customEmail}` : ""}`);
                }
              }
            } catch (emailError) {
              console.error("Error sending license email:", emailError);
            }
          } else {
            console.warn(`\u26A0\uFE0F  Insufficient licenses available for product ${productId}. Required: ${quantity}, Available: ${availableLicenses.length}`);
          }
        }
      }
    } else {
      console.warn(`No transaction found with order_id: ${order_id}`);
    }
  } catch (error) {
    console.error("Webhook DB Error:", error);
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
  return { message: "Webhook processed successfully" };
});

export { webhook_post as default };
//# sourceMappingURL=webhook.post.mjs.map
