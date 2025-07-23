import { c as defineEventHandler, q as scheduledTasks, e as createError } from '../../../_/nitro.mjs';
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

const triggerCleanup_post = defineEventHandler(async (event) => {
  try {
    console.log("\u{1F527} Manual cleanup trigger requested");
    await scheduledTasks.triggerCleanupNow();
    return {
      success: true,
      message: "Manual cleanup triggered successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("\u274C Manual cleanup trigger failed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to trigger manual cleanup"
    });
  }
});

export { triggerCleanup_post as default };
//# sourceMappingURL=trigger-cleanup.post.mjs.map
