import { c as defineEventHandler, i as adminAuth, f as db, e as createError } from '../../../_/nitro.mjs';
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

const updateCategorySlugs_get = defineEventHandler(async (event) => {
  try {
    await adminAuth(event);
    const [beforeCategories] = await db.execute(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);
    await db.execute(`
      UPDATE categories
      SET slug = 'office'
      WHERE id = 1
    `);
    await db.execute(`
      UPDATE categories
      SET slug = 'project'
      WHERE id = 2
    `);
    await db.execute(`
      UPDATE categories
      SET slug = 'visio'
      WHERE id = 3
    `);
    const [afterCategories] = await db.execute(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);
    return {
      success: true,
      message: "Slug kategori berhasil diperbarui",
      before: beforeCategories,
      after: afterCategories
    };
  } catch (error) {
    console.error("Error updating category slugs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update category slugs"
    });
  }
});

export { updateCategorySlugs_get as default };
//# sourceMappingURL=update-category-slugs.get.mjs.map
