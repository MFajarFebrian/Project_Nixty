import { c as defineEventHandler, f as db, e as createError } from '../../../_/nitro.mjs';
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

const autoCleanup_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    console.log("\u{1F9F9} Starting auto-cleanup for user:", user.id);
    const [result] = await db.execute(
      `DELETE FROM transactions 
       WHERE user_id = $1 
       AND payment_gateway_status = 'not_found_in_gateway' 
       AND updated_at < NOW() - INTERVAL '1 hour'`,
      [user.id]
    );
    console.log("\u{1F9F9} Auto-cleanup completed. Deleted", result.affectedRows, "transactions");
    return {
      success: true,
      message: `Auto-cleanup completed. Deleted ${result.affectedRows} transactions.`,
      data: {
        deleted_count: result.affectedRows
      }
    };
  } catch (error) {
    console.error("Error in auto-cleanup:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to perform auto-cleanup"
    });
  }
});

export { autoCleanup_post as default };
//# sourceMappingURL=auto-cleanup.post.mjs.map
