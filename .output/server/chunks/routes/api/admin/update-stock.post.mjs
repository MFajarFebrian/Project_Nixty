import { c as defineEventHandler, g as getHeaders, e as createError, r as readBody, f as db } from '../../../_/nitro.mjs';
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

const updateStock_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    console.log("Stock update request:", body);
    const productId = body.productId || body.product_id;
    const newStock = body.stock || body.new_stock;
    const licenseType = body.license_type;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "productId is required"
      });
    }
    if (newStock === void 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "new_stock is required"
      });
    }
    if (newStock < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Stock cannot be negative"
      });
    }
    const [productRows] = await db.query(`
      SELECT 
        p.id, p.name, p.version, p.license_type_default,
        COALESCE(psv.available_stock, 0) as current_stock
      FROM products p
      LEFT JOIN product_stock_view psv ON p.id = psv.product_id
      WHERE p.id = ?
    `, [productId]);
    if (productRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    const product = productRows[0];
    const oldStock = product.current_stock || 0;
    const licenseTypeToUse = licenseType || product.license_type_default || "product_key";
    const stockDifference = newStock - oldStock;
    if (stockDifference <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot reduce stock through this API. Use the licenses management interface to manage individual licenses."
      });
    }
    const licenseAddPromises = [];
    for (let i = 0; i < stockDifference; i++) {
      const productKey = `${product.name.substring(0, 3).toUpperCase()}-${product.version}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const licenseData = {
        product_id: productId,
        license_type: licenseTypeToUse,
        product_key: licenseTypeToUse === "product_key" ? productKey : null,
        email: licenseTypeToUse === "email_password" ? `auto-gen-${productId}-${i}@example.com` : null,
        password: licenseTypeToUse === "email_password" ? `auto-pass-${Math.random().toString(36).substring(2, 10)}` : null,
        additional_info: JSON.stringify({ generated_by: userEmail, generated_at: (/* @__PURE__ */ new Date()).toISOString() }),
        status: "available",
        notes: "Auto-generated license by stock management system",
        send_license: 0,
        max_usage: 1,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      licenseAddPromises.push(db.insert("product_licenses", licenseData));
    }
    await Promise.all(licenseAddPromises);
    const [updatedStockView] = await db.query(`
      SELECT * FROM product_stock_view WHERE product_id = ?
    `, [productId]);
    const updatedStock = updatedStockView.length > 0 ? updatedStockView[0] : { available_stock: 0 };
    console.log(`Stock updated for product ${productId}: ${oldStock} \u2192 ${updatedStock.available_stock}`);
    return {
      success: true,
      message: `Stock updated successfully from ${oldStock} to ${updatedStock.available_stock}`,
      data: {
        product: {
          id: product.id,
          name: product.name,
          version: product.version,
          stock: updatedStock.available_stock,
          available_stock: updatedStock.available_stock,
          used_licenses: updatedStock.used_licenses || 0,
          expired_licenses: updatedStock.expired_licenses || 0,
          reserved_licenses: updatedStock.reserved_licenses || 0,
          total_licenses: updatedStock.total_licenses || 0
        },
        stock_change: {
          old_stock: oldStock,
          new_stock: updatedStock.available_stock,
          difference: updatedStock.available_stock - oldStock,
          licenses_added: stockDifference
        }
      }
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "An error occurred while updating stock"
    });
  }
});

export { updateStock_post as default };
//# sourceMappingURL=update-stock.post.mjs.map
