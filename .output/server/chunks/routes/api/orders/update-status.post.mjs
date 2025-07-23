import { c as defineEventHandler, r as readBody, e as createError, n as midtransConfig, f as db } from '../../../_/nitro.mjs';
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

const updateStatus_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { order_id } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    let midtransResponse;
    try {
      midtransResponse = await coreApi.transaction.status(order_id);
    } catch (midtransError) {
      console.log("Midtrans API Error:", midtransError.message);
      if (midtransError.message && (midtransError.message.includes("404") || midtransError.message.includes("not found"))) {
        const [orderResults2] = await db.execute(
          `SELECT id FROM nixty.orders WHERE order_id = ?`,
          [order_id]
        );
        if (orderResults2.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: "Transaction not found"
          });
        }
        const transactionId2 = orderResults2[0].id;
        const [userCheck] = await db.execute(
          `SELECT id FROM nixty.orders WHERE id = ? AND user_id = ?`,
          [transactionId2, user.id]
        );
        if (userCheck.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: "Transaction not found or not owned by user"
          });
        }
        const [updateResult] = await db.execute(
          `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
          ["not_found_in_gateway", transactionId2, "payment_gateway_status"]
        );
        if (updateResult.affectedRows === 0) {
          await db.execute(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [transactionId2, "payment_gateway_status", "not_found_in_gateway"]
          );
        }
        const [updatedTransaction2] = await db.execute(
          `SELECT 
            o.id, 
            o.product_id, 
            o.quantity, 
            o.total, 
            o.status, 
            o.created_at,
            p.name as product_name
          FROM nixty.orders o
          LEFT JOIN nixty.products p ON o.product_id = p.id
          WHERE o.id = ?`,
          [transactionId2]
        );
        const [gatewayLogs2] = await db.execute(
          `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
          [transactionId2]
        );
        const gatewayData2 = {};
        gatewayLogs2.forEach((log) => {
          gatewayData2[log.key] = log.value;
        });
        return {
          success: true,
          message: "Transaction marked as not found in gateway",
          data: {
            transaction: {
              ...updatedTransaction2[0],
              ...gatewayData2
            },
            midtrans_response: null,
            not_found_in_gateway: true
          }
        };
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to check transaction status with Midtrans"
      });
    }
    if (!midtransResponse) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found in Midtrans"
      });
    }
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
    const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
    const [orderResults] = await db.execute(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transactionId = orderResults[0].id;
    const [result] = await db.execute(
      `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
      [newStatus, transactionId, user.id]
    );
    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found or not owned by user"
      });
    }
    const gatewayLogs = [
      ["payment_method", midtransResponse.payment_type || null],
      ["payment_gateway_status", midtransResponse.transaction_status],
      ["payment_gateway_payload", JSON.stringify(midtransResponse)]
    ];
    for (const [key, value] of gatewayLogs) {
      const [updateResult] = await db.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
        [value, transactionId, key]
      );
      if (updateResult.affectedRows === 0) {
        await db.execute(
          `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
          [transactionId, key, value]
        );
      }
    }
    const [updatedTransaction] = await db.execute(
      `SELECT 
        o.id, 
        o.product_id, 
        o.quantity, 
        o.total, 
        o.status, 
        o.created_at,
        p.name as product_name
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      WHERE o.id = ?`,
      [transactionId]
    );
    const [allGatewayLogs] = await db.execute(
      `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
      [transactionId]
    );
    const gatewayData = {};
    allGatewayLogs.forEach((log) => {
      gatewayData[log.key] = log.value;
    });
    return {
      success: true,
      message: "Transaction status updated successfully",
      data: {
        transaction: {
          ...updatedTransaction[0],
          ...gatewayData
        },
        midtrans_response: midtransResponse
      }
    };
  } catch (error) {
    console.error("Error updating transaction status:", error);
    if (error.statusCode) {
      throw error;
    }
    if (error.message && error.message.includes("404")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found in Midtrans"
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update transaction status"
    });
  }
});

export { updateStatus_post as default };
//# sourceMappingURL=update-status.post.mjs.map
