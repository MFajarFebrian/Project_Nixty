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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  try {
    const productId = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID is required"
      });
    }
    const [result] = await db.execute(`
      SELECT 
        COUNT(*) AS total_stock,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?
    `, [productId]);
    if (!result || result.length === 0) {
      return {
        success: true,
        data: {
          product_id: productId,
          total_stock: 0,
          available_stock: 0
        }
      };
    }
    return {
      success: true,
      data: {
        product_id: productId,
        total_stock: result[0].total_stock || 0,
        available_stock: result[0].available_stock || 0
      }
    };
  } catch (error) {
    console.error("Error fetching product stock:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch product stock"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
