import { c as defineEventHandler, u as useRuntimeConfig, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { v as verifySignature } from '../../../_/midtrans-helper.mjs';
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
import 'crypto';

async function setPaymentGatewayLog(transactionId, key, value) {
  try {
    const [existing] = await db.execute(
      `SELECT id FROM nixty.payment_gateway_logs 
       WHERE transaction_id = ? AND key = ? LIMIT 1`,
      [transactionId, key]
    );
    if (existing.length > 0) {
      await db.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ?
         WHERE transaction_id = ? AND key = ?`,
        [value.toString(), transactionId, key]
      );
    } else {
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
async function assignLicenseToTransaction(transactionId, productId, quantity) {
  try {
    await db.execute("START TRANSACTION");
    const [availableLicenses] = await db.execute(`
      SELECT id, license_type FROM nixty.product_license_base
      WHERE product_id = ? AND status = 'available'
      LIMIT ?
    `, [productId, quantity]);
    if (availableLicenses.length < quantity) {
      await db.execute("ROLLBACK");
      return {
        success: false,
        message: `Not enough licenses available: requested ${quantity}, found ${availableLicenses.length}`
      };
    }
    for (const license of availableLicenses) {
      await db.execute(`
        UPDATE nixty.product_license_base
        SET status = 'used'
        WHERE id = ?
      `, [license.id]);
      await db.execute(`
        INSERT INTO nixty.transaction_license (transaction_id, license_id)
        VALUES (?, ?)
      `, [transactionId, license.id]);
    }
    await db.execute("COMMIT");
    return {
      success: true,
      licenses: availableLicenses,
      count: availableLicenses.length
    };
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("Error assigning licenses:", error);
    return {
      success: false,
      message: error.message
    };
  }
}
const notificationWithSchemaFixed_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  try {
    const body = await readBody(event);
    const orderId = body.order_id;
    console.log(`Midtrans notification received for order ${orderId}`);
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
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;
    const [transactionIdResult] = await db.execute(`
      SELECT transaction_id FROM nixty.payment_gateway_logs
      WHERE key = 'order_id' AND value = ?
      LIMIT 1
    `, [orderId]);
    if (transactionIdResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found for order_id: " + orderId
      });
    }
    const transactionId = transactionIdResult[0].transaction_id;
    const [transactions] = await db.execute(`
      SELECT t.*, p.id as product_id
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ?
    `, [transactionId]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction details not found: " + transactionId
      });
    }
    const transaction = transactions[0];
    let dbStatus = "pending";
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        dbStatus = "completed";
      }
    } else if (transactionStatus === "settlement") {
      dbStatus = "completed";
    } else if (["cancel", "expire", "deny"].includes(transactionStatus)) {
      dbStatus = "failed";
    }
    await db.execute(`
      UPDATE nixty.transactions
      SET status = ?
      WHERE id = ?
    `, [dbStatus, transactionId]);
    await setPaymentGatewayLog(transactionId, "transaction_status", transactionStatus);
    await setPaymentGatewayLog(transactionId, "payment_type", paymentType);
    await setPaymentGatewayLog(transactionId, "notification_received", (/* @__PURE__ */ new Date()).toISOString());
    await setPaymentGatewayLog(transactionId, "full_notification", JSON.stringify(body));
    console.log(`Transaction ${transactionId} status updated to ${dbStatus}`);
    let licenseResult = { success: false, count: 0 };
    if (dbStatus === "completed") {
      const [existingLicenses] = await db.execute(`
        SELECT COUNT(*) as count
        FROM nixty.transaction_license
        WHERE transaction_id = ?
      `, [transactionId]);
      const hasLicenses = existingLicenses[0].count > 0;
      if (!hasLicenses) {
        console.log(`Assigning licenses for transaction ${transactionId}`);
        const quantity = transaction.quantity || 1;
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
    return {
      status: "ok",
      message: "Notification processed successfully.",
      transaction_status: dbStatus,
      licenses_processed: licenseResult.count
    };
  } catch (err) {
    console.error("Error processing notification:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Failed to process notification"
    });
  }
});

export { notificationWithSchemaFixed_post as default };
//# sourceMappingURL=notification-with-schema-fixed.post.mjs.map
