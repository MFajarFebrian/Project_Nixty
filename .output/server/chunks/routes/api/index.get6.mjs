import { c as defineEventHandler, f as db, e as createError } from '../../_/nitro.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }
    const dbUser = rows[0];
    return {
      success: true,
      user: dbUser
    };
  } catch (error) {
    console.error("Profile fetch error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch profile data"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get6.mjs.map
