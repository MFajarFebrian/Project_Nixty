import { c as defineEventHandler, g as getHeaders, e as createError, f as db, h as getQuery } from '../../../_/nitro.mjs';
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

const cleanupNotFoundTransactions_get = defineEventHandler(async (event) => {
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
    try {
      const [users] = await db.execute(
        "SELECT role FROM users WHERE id = ? AND email = ? LIMIT 1",
        [userId, userEmail]
      );
      const isAdmin = users && users.length > 0 && users[0].role === "admin";
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: "Admin access required"
        });
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error("Error checking admin status:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to validate admin status"
      });
    }
    const query = getQuery(event);
    const daysOld = parseInt(query.days || "7", 10);
    const dryRun = query.dry_run === "true";
    if (isNaN(daysOld) || daysOld < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Days parameter must be a positive number"
      });
    }
    const [transactions] = await db.execute(
      `SELECT id, order_id, product_name, email, amount, created_at, updated_at
       FROM transactions 
       WHERE payment_gateway_status = 'not_found_in_gateway'
       AND updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
    if (transactions.length === 0) {
      return {
        success: true,
        message: `No transactions with 'not_found_in_gateway' status older than ${daysOld} days found`,
        data: {
          deleted: 0,
          dry_run: dryRun
        }
      };
    }
    if (dryRun) {
      return {
        success: true,
        message: `Found ${transactions.length} transactions with 'not_found_in_gateway' status older than ${daysOld} days (DRY RUN)`,
        data: {
          transactions,
          count: transactions.length,
          dry_run: true
        }
      };
    }
    const ids = transactions.map((t) => t.id);
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id IN (${placeholders})`,
      ids
    );
    return {
      success: true,
      message: `Successfully deleted ${result.affectedRows} transactions with 'not_found_in_gateway' status older than ${daysOld} days`,
      data: {
        deleted: result.affectedRows,
        transactions,
        dry_run: false
      }
    };
  } catch (error) {
    console.error("Error cleaning up not found transactions:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to clean up transactions"
    });
  }
});

export { cleanupNotFoundTransactions_get as default };
//# sourceMappingURL=cleanup-not-found-transactions.get.mjs.map
