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

const productLicenses_post = defineEventHandler(async (event) => {
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
    console.log("Product license creation request:", body);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    if (!body.product_id || !body.license_type) {
      throw createError({
        statusCode: 400,
        statusMessage: "product_id and license_type are required"
      });
    }
    if (!["product_key", "email_password"].includes(body.license_type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'license_type must be either "product_key" or "email_password"'
      });
    }
    const [productRows] = await db.query(
      "SELECT id, name FROM nixty.products WHERE id = $1 AND status = $2",
      [body.product_id, "active"]
    );
    if (productRows.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product not found or inactive"
      });
    }
    const baseLicenseData = {
      product_id: body.product_id,
      license_type: body.license_type,
      status: body.status || "available",
      notes: body.notes || null,
      send_license: 0,
      max_usage: 1
    };
    const baseLicense = await db.insert("product_license_base", baseLicenseData);
    const licenseId = baseLicense.id;
    if (body.license_type === "product_key") {
      const licenseKey = body.license_key || generateLicenseKey();
      console.log("Processing license key - provided:", body.license_key, "final:", licenseKey);
      await db.insert("product_license_keys", {
        id: licenseId,
        product_key: licenseKey
      });
    } else if (body.license_type === "email_password") {
      if (!body.email || !body.password) {
        throw createError({
          statusCode: 400,
          statusMessage: "email and password are required for email_password license type"
        });
      }
      await db.insert("product_license_accounts", {
        id: licenseId,
        email: body.email,
        password: body.password
      });
    }
    let licenseData;
    if (body.license_type === "product_key") {
      const [rows] = await db.query(`
        SELECT 
          plb.id, plb.product_id, plb.license_type, plb.status, plb.notes,
          plk.product_key as license_key,
          p.name as product_name
        FROM nixty.product_license_base plb
        JOIN nixty.product_license_keys plk ON plb.id = plk.id
        JOIN nixty.products p ON plb.product_id = p.id
        WHERE plb.id = $1
      `, [licenseId]);
      licenseData = rows[0];
    } else {
      const [rows] = await db.query(`
        SELECT 
          plb.id, plb.product_id, plb.license_type, plb.status, plb.notes,
          pla.email, pla.password,
          p.name as product_name
        FROM nixty.product_license_base plb
        JOIN nixty.product_license_accounts pla ON plb.id = pla.id
        JOIN nixty.products p ON plb.product_id = p.id
        WHERE plb.id = $1
      `, [licenseId]);
      licenseData = rows[0];
    }
    return {
      success: true,
      message: "Product license created successfully",
      data: licenseData
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error creating product license:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create product license"
    });
  }
});
function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) result += "-";
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export { productLicenses_post as default };
//# sourceMappingURL=product-licenses.post.mjs.map
