import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { p as processLicenseDelivery } from '../../../_/licenseService.mjs';
import { s as sendMultipleLicenseEmail } from '../../../_/emailService.mjs';
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

const retryLicenseDelivery_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    if (transaction.status !== "completed") {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction must be completed to retry license delivery"
      });
    }
    let customEmail = transaction.email;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.custom_email) {
          customEmail = payload.custom_email;
        }
      } catch (parseError) {
        console.error("Error parsing payment gateway payload:", parseError);
      }
    }
    const [existingLicenses] = await db.execute(
      `SELECT COUNT(*) as count FROM license_usage_history WHERE transaction_id = ?`,
      [transactionId]
    );
    const existingCount = existingLicenses[0].count;
    let totalQuantity = 1;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.licenses_requested) {
          totalQuantity = payload.licenses_requested;
        }
      } catch (parseError) {
        console.error("Error parsing quantity from payload:", parseError);
      }
    }
    const remainingQuantity = totalQuantity - existingCount;
    if (remainingQuantity <= 0) {
      return {
        success: true,
        message: "All licenses already processed",
        existingCount,
        totalQuantity
      };
    }
    console.log(`Retrying license delivery: ${remainingQuantity} remaining out of ${totalQuantity}`);
    const allLicenses = [];
    let processSuccess = true;
    const [existingLicenseData] = await db.execute(
      `SELECT 
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
      ORDER BY luh.used_at ASC`,
      [transactionId]
    );
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
        console.log(`Remaining license ${i + 1} processed successfully`);
      } else {
        console.error(`Failed to process remaining license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        processSuccess = false;
        break;
      }
    }
    if (allLicenses.length > 0) {
      const emailResult = await sendMultipleLicenseEmail(
        customEmail,
        transaction.customer_name || "Customer",
        transaction.product_name,
        allLicenses
      );
      if (emailResult.success) {
        console.log(`Updated license email sent successfully to ${customEmail} with ${allLicenses.length} license(s)`);
        if (processSuccess && allLicenses.length === totalQuantity) {
          await db.execute(
            `UPDATE transactions SET 
             payment_gateway_payload = JSON_REMOVE(
               COALESCE(payment_gateway_payload, '{}'),
               '$.partial_license_delivery'
             ) WHERE id = ?`,
            [transactionId]
          );
        }
      } else {
        console.error(`Failed to send updated license email: ${emailResult.error || emailResult.message}`);
        processSuccess = false;
      }
    }
    return {
      success: processSuccess,
      message: processSuccess ? "License delivery retry completed successfully" : "License delivery retry completed with errors",
      licensesProcessed: allLicenses.length,
      totalQuantity,
      remainingQuantity: processSuccess ? 0 : totalQuantity - allLicenses.length
    };
  } catch (error) {
    console.error("Error retrying license delivery:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to retry license delivery"
    });
  }
});

export { retryLicenseDelivery_post as default };
//# sourceMappingURL=retry-license-delivery.post.mjs.map
