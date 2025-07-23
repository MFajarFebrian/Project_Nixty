import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
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

const getTransactionId_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const [orders] = await db.execute(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    return {
      success: true,
      transaction_id: orders[0].id
    };
  } catch (error) {
    console.error("Error getting transaction ID:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get transaction ID"
    });
  }
});

export { getTransactionId_post as default };
//# sourceMappingURL=get-transaction-id.post.mjs.map
