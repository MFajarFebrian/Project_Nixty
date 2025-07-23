import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../../_/nitro.mjs';
import { r as requireAuth } from '../../../../_/auth.mjs';
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

const getLicense_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const { order_id, transaction_id } = body;
  if (!order_id && !transaction_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID or Transaction ID is required"
    });
  }
  try {
    let query = "";
    let params = [];
    if (order_id) {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        WHERE t.order_id = ? AND t.user_id = ?
      `;
      params = [order_id, user.id];
    } else {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        WHERE t.id = ? AND t.user_id = ?
      `;
      params = [transaction_id, user.id];
    }
    const [rows] = await db.execute(query, params);
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = rows[0];
    if (transaction.status !== "completed") {
      return {
        success: false,
        message: "Transaction not completed yet",
        status: transaction.status,
        order_id: transaction.order_id
      };
    }
    let licenseInfo = [];
    if (transaction.license_info) {
      try {
        licenseInfo = JSON.parse(transaction.license_info);
      } catch (error) {
        console.error("Error parsing license info:", error);
      }
    }
    if (licenseInfo.length === 0) {
      return {
        success: false,
        message: "No license information available",
        order_id: transaction.order_id
      };
    }
    const formattedLicenses = licenseInfo.map((license) => {
      const formatted = {
        license_type: license.license_type,
        additional_info: license.additional_info
      };
      switch (license.license_type) {
        case "product_key":
          formatted.product_key = license.product_key;
          break;
        case "email_password":
          formatted.email = license.email;
          formatted.password = license.password;
          break;
        default:
          if (license.product_key) formatted.product_key = license.product_key;
          if (license.email) formatted.email = license.email;
          if (license.password) formatted.password = license.password;
      }
      return formatted;
    });
    return {
      success: true,
      transaction: {
        id: transaction.id,
        order_id: transaction.order_id,
        product_name: transaction.product_name,
        product_version: transaction.product_version,
        status: transaction.status,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      },
      licenses: formattedLicenses,
      license_count: formattedLicenses.length
    };
  } catch (error) {
    console.error("Error retrieving license info:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve license information"
    });
  }
});

export { getLicense_post as default };
//# sourceMappingURL=get-license.post.mjs.map
