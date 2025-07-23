import { c as defineEventHandler, f as db, e as createError } from '../../../../_/nitro.mjs';
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

const available_get = defineEventHandler(async (event) => {
  try {
    const [rows] = await db.execute("SELECT id, name, slug FROM categories ORDER BY name ASC");
    return {
      success: true,
      categories: rows
    };
  } catch (error) {
    console.error("Error fetching available categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch available categories"
    });
  }
});

export { available_get as default };
//# sourceMappingURL=available.get.mjs.map
