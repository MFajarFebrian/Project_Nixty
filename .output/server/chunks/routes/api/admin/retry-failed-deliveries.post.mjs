import { c as defineEventHandler, g as getHeaders, e as createError, r as readBody, f as db } from '../../../_/nitro.mjs';
import { p as processLicenseDelivery } from '../../../_/licenseService.mjs';
import { s as sendMultipleLicenseEmail } from '../../../_/emailService.mjs';
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

const retryFailedDeliveries_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    const { transactionId, retryAll = false } = body;
    console.log("\u{1F504} Starting manual retry for failed license deliveries...");
    let results = [];
    if (retryAll) {
      const failedDeliveries = await WebhookLogger.getFailedDeliveries(100);
      console.log(`Found ${failedDeliveries.length} failed deliveries to retry`);
      for (const failure of failedDeliveries) {
        const retryResult = await retryLicenseDelivery(failure.transaction_id, failure.order_id);
        results.push({
          transaction_id: failure.transaction_id,
          order_id: failure.order_id,
          ...retryResult
        });
      }
    } else if (transactionId) {
      const [transactions] = await db.execute(
        "SELECT order_id FROM transactions WHERE id = ?",
        [transactionId]
      );
      if (transactions.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Transaction not found"
        });
      }
      const retryResult = await retryLicenseDelivery(transactionId, transactions[0].order_id);
      results.push({
        transaction_id: transactionId,
        order_id: transactions[0].order_id,
        ...retryResult
      });
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Either transactionId or retryAll=true is required"
      });
    }
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return {
      success: true,
      message: `Retry completed: ${successful} successful, ${failed} failed`,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  } catch (error) {
    console.error("Error retrying failed deliveries:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to retry deliveries"
    });
  }
});
async function retryLicenseDelivery(transactionId, orderId) {
  var _a;
  console.log(`\u{1F504} Retrying license delivery for transaction ${transactionId} (${orderId})`);
  try {
    await WebhookLogger.incrementRetryCount(transactionId);
    const [transactions] = await db.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    );
    if (transactions.length === 0) {
      throw new Error("Transaction not found");
    }
    const transaction = transactions[0];
    if (transaction.status !== "completed" && !["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase())) {
      throw new Error("Transaction is not completed");
    }
    let customEmail = transaction.email;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.custom_email) {
          customEmail = payload.custom_email;
        }
      } catch (parseError) {
        console.warn("Could not parse payload for custom email:", parseError.message);
      }
    }
    const [existingLicenses] = await db.execute(
      "SELECT COUNT(*) as count FROM license_usage_history WHERE transaction_id = ?",
      [transactionId]
    );
    const existingCount = existingLicenses[0].count;
    const quantity = transaction.quantity || 1;
    const remainingQuantity = quantity - existingCount;
    console.log(`Transaction ${transactionId}: ${existingCount}/${quantity} licenses already processed, ${remainingQuantity} remaining`);
    if (remainingQuantity <= 0) {
      await WebhookLogger.markLicenseDeliveryResolved(transactionId);
      return {
        success: true,
        message: "All licenses already processed",
        licenses_processed: existingCount,
        total_quantity: quantity
      };
    }
    await db.execute("START TRANSACTION");
    try {
      const allLicenses = [];
      let licensesProcessed = 0;
      const [existingLicenseData] = await db.execute(`
        SELECT 
          pl.license_type,
          pl.product_key,
          pl.email,
          pl.password,
          pl.additional_info,
          pl.notes,
          pl.expires_at,
          pl.usage_count,
          pl.max_usage
        FROM license_usage_history luh
        JOIN product_licenses pl ON pl.id = luh.license_id
        WHERE luh.transaction_id = ?
        ORDER BY luh.used_at ASC
      `, [transactionId]);
      existingLicenseData.forEach((license) => {
        allLicenses.push(license);
      });
      for (let i = 0; i < remainingQuantity; i++) {
        console.log(`Processing remaining license ${i + 1}/${remainingQuantity}...`);
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          customEmail,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          allLicenses.push(licenseResult.license);
          licensesProcessed++;
        } else {
          throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        }
      }
      let emailSent = false;
      if (allLicenses.length > 0) {
        const emailResult = await sendMultipleLicenseEmail(
          customEmail,
          transaction.customer_name || "Customer",
          transaction.product_name,
          allLicenses
        );
        if (emailResult.success) {
          emailSent = true;
          console.log(`License email sent successfully to ${customEmail} with ${allLicenses.length} license(s)`);
        } else {
          console.warn(`Failed to send license email: ${emailResult.error || emailResult.message}`);
        }
      }
      await db.execute("COMMIT");
      if (licensesProcessed === remainingQuantity) {
        await WebhookLogger.markLicenseDeliveryResolved(transactionId);
      }
      return {
        success: true,
        message: `Successfully processed ${licensesProcessed} remaining licenses`,
        licenses_processed: licensesProcessed,
        total_licenses: allLicenses.length,
        email_sent: emailSent,
        total_quantity: quantity
      };
    } catch (processingError) {
      await db.execute("ROLLBACK");
      throw processingError;
    }
  } catch (error) {
    console.error(`Failed to retry license delivery for transaction ${transactionId}:`, error);
    return {
      success: false,
      error: error.message,
      licenses_processed: 0
    };
  }
}

export { retryFailedDeliveries_post as default };
//# sourceMappingURL=retry-failed-deliveries.post.mjs.map
