import { c as defineEventHandler, r as readBody, f as db, n as midtransConfig, e as createError } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
import midtransClient from 'midtrans-client';
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

const syncAll_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    let body = {};
    try {
      body = await readBody(event);
    } catch (e) {
      body = {};
    }
    const isAutoSync = body && body.auto_sync === true;
    const syncLimit = isAutoSync ? 5 : 100;
    const specificTransactionIds = body && body.transactionIds || [];
    const [orders] = await db.execute(
      `SELECT id, status, created_at
       FROM nixty.orders 
       WHERE user_id = ? 
       AND status IN ('pending', 'failed') 
       ORDER BY created_at DESC
       LIMIT ?`,
      [user.id, syncLimit]
    );
    if (orders.length === 0) {
      return {
        success: true,
        message: "No orders to sync",
        data: { updated: 0, total: 0 }
      };
    }
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    const mapMidtransStatus = (midtransStatus, fraudStatus = null) => {
      switch (midtransStatus) {
        case "settlement":
          return "completed";
        case "capture":
          return fraudStatus === "accept" ? "completed" : "pending";
        case "pending":
          return "pending";
        case "deny":
        case "cancel":
        case "expire":
        case "failure":
          return "failed";
        default:
          return "pending";
      }
    };
    let updatedCount = 0;
    let totalProcessed = 0;
    const results = [];
    const updated = [];
    for (const order of orders) {
      totalProcessed++;
      try {
        let order_id;
        const [existingOrderId] = await db.execute(
          `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'order_id' LIMIT 1`,
          [order.id]
        );
        if (existingOrderId.length > 0) {
          order_id = existingOrderId[0].value;
        } else {
          order_id = `ORDER_${order.id}_${Date.now()}`;
          await db.execute(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [order.id, "order_id", order_id]
          );
        }
        console.log(`Syncing order ${order.id} with order_id: ${order_id}`);
        try {
          const midtransResponse = await coreApi.transaction.status(order_id);
          if (midtransResponse) {
            const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
            if (newStatus !== order.status) {
              const [result] = await db.execute(
                `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
                [newStatus, order.id, user.id]
              );
              if (result.affectedRows > 0) {
                const gatewayLogs = [
                  ["payment_method", midtransResponse.payment_type || null],
                  ["payment_gateway_status", midtransResponse.transaction_status],
                  ["payment_gateway_payload", JSON.stringify(midtransResponse)]
                ];
                for (const [key, value] of gatewayLogs) {
                  const [updateResult] = await db.execute(
                    `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                    [value, order.id, key]
                  );
                  if (updateResult.affectedRows === 0) {
                    await db.execute(
                      `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                      [order.id, key, value]
                    );
                  }
                }
                updatedCount++;
                updated.push(order.id);
                results.push({
                  id: order.id,
                  order_id,
                  old_status: order.status,
                  new_status: newStatus,
                  gateway_status: midtransResponse.transaction_status
                });
                if (newStatus === "completed" && order.status !== "completed") {
                  await processLicensesIfNeeded(order.id);
                }
              }
            }
          }
        } catch (midtransError) {
          if (midtransError.httpStatusCode === 404 || midtransError.message && midtransError.message.includes("404") && midtransError.message.includes("doesn't exist")) {
            console.log(`Order ${order.id} (${order_id}) not found in Midtrans - marking as failed`);
            const [updateResult] = await db.execute(
              `UPDATE nixty.orders SET status = 'failed' WHERE id = ? AND user_id = ?`,
              [order.id, user.id]
            );
            if (updateResult.affectedRows > 0) {
              const [logUpdateResult] = await db.execute(
                `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                ["not_found_in_gateway", order.id, "payment_gateway_status"]
              );
              if (logUpdateResult.affectedRows === 0) {
                await db.execute(
                  `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                  [order.id, "payment_gateway_status", "not_found_in_gateway"]
                );
              }
              results.push({
                id: order.id,
                order_id,
                status: "failed",
                message: "Order not found in Midtrans - marked as failed"
              });
            }
            continue;
          }
          throw midtransError;
        }
      } catch (error) {
        console.log(`Failed to sync order ${order.id}:`, error.message);
        results.push({
          id: order.id,
          error: error.message
        });
      }
      await new Promise((resolve) => setTimeout(resolve, isAutoSync ? 50 : 100));
    }
    return {
      success: true,
      message: `Successfully synced ${updatedCount} out of ${totalProcessed} orders`,
      updated,
      data: {
        updated: updatedCount,
        total: totalProcessed,
        auto_sync: isAutoSync,
        results
      }
    };
  } catch (error) {
    console.error("Error syncing orders:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to sync orders with Midtrans"
    });
  }
});
async function processLicensesIfNeeded(orderId) {
  try {
    const [existingLicenses] = await db.execute(
      `SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = ?`,
      [orderId]
    );
    if (existingLicenses[0].count === 0) {
      console.log(`Order ${orderId} completed but has no licenses. Processing now...`);
      const [orderDetails] = await db.execute(
        `SELECT product_id, quantity FROM nixty.orders WHERE id = ?`,
        [orderId]
      );
      if (orderDetails.length === 0) {
        console.log(`Order ${orderId} not found`);
        return false;
      }
      const order = orderDetails[0];
      const quantity = order.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const [availableLicense] = await db.execute(
          `SELECT id FROM nixty.product_license_base 
           WHERE product_id = ? AND status = 'available' 
           LIMIT 1`,
          [order.product_id]
        );
        if (availableLicense.length > 0) {
          await db.execute(
            `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
            [availableLicense[0].id]
          );
          await db.execute(
            `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
            [orderId, availableLicense[0].id]
          );
          console.log(`Successfully assigned license ${availableLicense[0].id} to order ${orderId}`);
        } else {
          console.error(`No available licenses found for product ${order.product_id}`);
          break;
        }
      }
    } else {
      console.log(`Order ${orderId} already has ${existingLicenses[0].count} license(s)`);
    }
    return true;
  } catch (error) {
    console.error(`Error processing licenses for order ${orderId}:`, error);
    return false;
  }
}

export { syncAll_post as default };
//# sourceMappingURL=sync-all.post.mjs.map
