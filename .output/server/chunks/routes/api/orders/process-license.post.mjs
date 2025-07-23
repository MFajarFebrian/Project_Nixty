import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
import { p as processLicenseDelivery } from '../../../_/licenseService.mjs';
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

const processLicense_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_id, 
        t.product_name, 
        t.quantity,
        t.status, 
        t.payment_gateway_status,
        t.customer_name,
        t.email
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const isCompleted = transaction.status === "completed" || ["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction is not completed"
      });
    }
    const quantity = transaction.quantity || 1;
    const licenses = [];
    let success = true;
    console.log(`Processing ${quantity} license(s) for transaction ${transactionId}`);
    const [beforeStock] = await db.execute(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [transaction.product_id]
    );
    const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
    console.log(`Stock before processing: ${stockBefore}`);
    await db.execute("START TRANSACTION");
    try {
      for (let i = 0; i < quantity; i++) {
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          licenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
        } else {
          success = false;
          console.error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
          break;
        }
      }
      const [afterStock] = await db.execute(
        `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
        [transaction.product_id]
      );
      const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
      console.log(`Stock after processing: ${stockAfter}`);
      const expectedStockReduction = licenses.length;
      const actualStockReduction = stockBefore - stockAfter;
      if (actualStockReduction !== expectedStockReduction) {
        console.warn(`Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
        if (actualStockReduction < expectedStockReduction) {
          console.log(`Attempting to refresh stock view...`);
          await db.execute(`
            UPDATE product_licenses 
            SET updated_at = NOW() 
            WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
          `, [transaction.product_id, transaction.id]);
        }
      }
      if (success) {
        await db.execute(
          `UPDATE transactions 
           SET license_info = ? 
           WHERE id = ?`,
          [JSON.stringify(licenses), transaction.id]
        );
        await db.execute("COMMIT");
        console.log(`Licenses stored in transaction ${transactionId}`);
        let emailResult;
        try {
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
          if (quantity > 1) {
            emailResult = await sendMultipleLicenseEmail(
              transaction.email,
              transaction.customer_name || "Customer",
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses,
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          } else {
            emailResult = await sendLicenseEmail(
              transaction.email,
              transaction.customer_name || "Customer",
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses[0],
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          }
          if (emailResult.success) {
            console.log(`\u2705 License email sent successfully to: ${transaction.email}${customEmail ? ` and ${customEmail}` : ""}`);
          } else {
            console.error(`\u274C Failed to send license email: ${emailResult.error || emailResult.message}`);
          }
        } catch (emailError) {
          console.error("Error sending license email:", emailError);
        }
      } else {
        await db.execute("ROLLBACK");
        console.log(`License processing failed for transaction ${transactionId}, rolling back`);
      }
    } catch (error) {
      await db.execute("ROLLBACK");
      console.error(`Error processing licenses: ${error.message}`);
      throw error;
    }
    return {
      success,
      message: success ? `Successfully processed ${licenses.length} license(s)` : "Failed to process licenses",
      data: {
        transaction_id: transaction.id,
        order_id: transaction.order_id,
        licenses: success ? licenses : []
      }
    };
  } catch (error) {
    console.error("Error processing license:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "An error occurred while processing license"
    });
  }
});

export { processLicense_post as default };
//# sourceMappingURL=process-license.post.mjs.map
