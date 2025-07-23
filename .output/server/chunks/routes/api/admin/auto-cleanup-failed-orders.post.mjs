import { c as defineEventHandler, f as db, e as createError } from '../../../_/nitro.mjs';
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

const autoCleanupFailedOrders_post = defineEventHandler(async (event) => {
  try {
    console.log("\u{1F9F9} Starting auto-cleanup of failed orders older than 1 week...");
    const oneWeekAgo = /* @__PURE__ */ new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const [failedOrders] = await db.execute(
      `SELECT id, user_id, product_id, status, created_at 
       FROM nixty.orders 
       WHERE status = 'failed' 
       AND created_at < ?`,
      [oneWeekAgo]
    );
    if (failedOrders.length === 0) {
      console.log("\u2705 No failed orders to cleanup");
      return {
        success: true,
        message: "No failed orders to cleanup",
        data: {
          deleted_count: 0,
          cleanup_date: oneWeekAgo.toISOString()
        }
      };
    }
    console.log(`\u{1F4CB} Found ${failedOrders.length} failed orders to cleanup`);
    let deletedCount = 0;
    const errors = [];
    for (const order of failedOrders) {
      try {
        console.log(`\u{1F5D1}\uFE0F Cleaning up order ${order.id} (created: ${order.created_at})`);
        await db.execute("START TRANSACTION");
        await db.execute(
          "DELETE FROM nixty.payment_gateway_logs WHERE transaction_id = ?",
          [order.id]
        );
        await db.execute(
          "DELETE FROM nixty.orders_license WHERE transaction_id = ?",
          [order.id]
        );
        const [deleteResult] = await db.execute(
          "DELETE FROM nixty.orders WHERE id = ?",
          [order.id]
        );
        if (deleteResult.affectedRows > 0) {
          deletedCount++;
          console.log(`\u2705 Successfully deleted order ${order.id}`);
        }
        await db.execute("COMMIT");
      } catch (error) {
        await db.execute("ROLLBACK");
        console.error(`\u274C Error deleting order ${order.id}:`, error.message);
        errors.push({
          order_id: order.id,
          error: error.message
        });
      }
    }
    console.log(`\u{1F3AF} Auto-cleanup completed: ${deletedCount}/${failedOrders.length} orders deleted`);
    return {
      success: true,
      message: `Auto-cleanup completed: ${deletedCount} failed orders deleted`,
      data: {
        deleted_count: deletedCount,
        total_found: failedOrders.length,
        cleanup_date: oneWeekAgo.toISOString(),
        errors
      }
    };
  } catch (error) {
    console.error("\u274C Auto-cleanup failed:", error);
    try {
      await db.execute("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to perform auto-cleanup of failed orders"
    });
  }
});

export { autoCleanupFailedOrders_post as default };
//# sourceMappingURL=auto-cleanup-failed-orders.post.mjs.map
