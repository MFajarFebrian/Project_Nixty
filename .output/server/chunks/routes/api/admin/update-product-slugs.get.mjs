import { c as defineEventHandler, f as db, e as createError } from '../../../_/nitro.mjs';
import { a as requireAdmin } from '../../../_/auth.mjs';
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

const updateProductSlugs_get = defineEventHandler(async (event) => {
  try {
    await requireAdmin(event);
    console.log("Starting product slug update...");
    const updates = [
      { categoryId: 1, slug: "office" },
      // Microsoft Office
      { categoryId: 2, slug: "project" },
      // Microsoft Project  
      { categoryId: 3, slug: "visio" }
      // Microsoft Visio
    ];
    let totalUpdated = 0;
    for (const update of updates) {
      const [result] = await db.execute(
        "UPDATE products SET slug = ? WHERE category_id = ?",
        [update.slug, update.categoryId]
      );
      totalUpdated += result.affectedRows;
      console.log(`Updated ${result.affectedRows} products with category_id ${update.categoryId} to slug '${update.slug}'`);
    }
    const [updatedProducts] = await db.execute(`
      SELECT p.id, p.name, p.version, p.slug, p.category_id, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.category_id, p.version
    `);
    console.log("Product slug update completed successfully");
    return {
      success: true,
      message: `Successfully updated ${totalUpdated} product slugs`,
      totalUpdated,
      updatedProducts
    };
  } catch (error) {
    console.error("Error updating product slugs:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update product slugs"
    });
  }
});

export { updateProductSlugs_get as default };
//# sourceMappingURL=update-product-slugs.get.mjs.map
