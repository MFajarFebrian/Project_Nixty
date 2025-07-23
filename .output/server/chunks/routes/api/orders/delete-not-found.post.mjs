import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
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

const deleteNotFound_post = defineEventHandler(async (event) => {
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
      `SELECT id, order_id, status, payment_gateway_status
       FROM transactions 
       WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    if (transaction.payment_gateway_status !== "not_found_in_gateway") {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only transactions with "not found in gateway" status can be deleted'
      });
    }
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete transaction"
      });
    }
    return {
      success: true,
      message: "Transaction deleted successfully",
      data: {
        transactionId: parseInt(transactionId),
        order_id: transaction.order_id
      }
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete transaction"
    });
  }
});

export { deleteNotFound_post as default };
//# sourceMappingURL=delete-not-found.post.mjs.map
