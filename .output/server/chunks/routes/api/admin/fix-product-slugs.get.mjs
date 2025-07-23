import { c as defineEventHandler, i as adminAuth, f as db, e as createError } from '../../../_/nitro.mjs';
import { g as generateProductSlug } from '../../../_/admin-validation.mjs';
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

const fixProductSlugs_get = defineEventHandler(async (event) => {
  try {
    await adminAuth(event);
    const [beforeProducts] = await db.execute(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    const updatePromises = beforeProducts.map(async (product) => {
      const newSlug = generateProductSlug(product.name);
      await db.execute(
        "UPDATE products SET slug = ? WHERE id = ?",
        [newSlug, product.id]
      );
    });
    await Promise.all(updatePromises);
    const [afterProducts] = await db.execute(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    return {
      success: true,
      message: "Product slugs have been updated successfully",
      before: beforeProducts,
      after: afterProducts
    };
  } catch (error) {
    console.error("Error fixing product slugs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fix product slugs"
    });
  }
});

export { fixProductSlugs_get as default };
//# sourceMappingURL=fix-product-slugs.get.mjs.map
