import { c as defineEventHandler, f as db, e as createError } from '../../_/nitro.mjs';
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

const categories_get = defineEventHandler(async (event) => {
  try {
    const [categories] = await db.query("SELECT id, name, slug FROM nixty.categories ORDER BY name");
    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch categories"
    });
  }
});

export { categories_get as default };
//# sourceMappingURL=categories.get.mjs.map
