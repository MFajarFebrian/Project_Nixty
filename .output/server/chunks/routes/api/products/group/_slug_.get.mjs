import { c as defineEventHandler, e as createError, f as db } from '../../../../_/nitro.mjs';
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

const _slug__get = defineEventHandler(async (event) => {
  var _a;
  const slug = (_a = event.context.params) == null ? void 0 : _a.slug;
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product group slug is required"
    });
  }
  try {
    const [[baseProduct]] = await db.query(
      "SELECT name FROM products WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (!baseProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product group not found"
      });
    }
    const [products] = await db.query(
      `SELECT id, name, version, slug, description, short_description, price, image_url, status
       FROM products 
       WHERE name = ? AND status = 'active'
       ORDER BY version ASC`,
      [baseProduct.name]
    );
    if (!products || products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No active products found for this group."
      });
    }
    const mainProduct = products[0];
    return {
      product: mainProduct,
      versions: products
      // All available versions
    };
  } catch (err) {
    const error = err;
    console.error(`Error fetching product group with slug ${slug}:`, error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "An internal error occurred while fetching the product group."
    });
  }
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
