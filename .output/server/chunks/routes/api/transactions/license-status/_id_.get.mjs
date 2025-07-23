import { c as defineEventHandler, e as createError, f as db } from '../../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const transactionId = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(`
      SELECT t.*, p.name as product_name, p.slug as product_slug
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `, [transactionId, user.id]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found or access denied"
      });
    }
    const transaction = transactions[0];
    const [paymentLogs] = await db.execute(`
      SELECT * FROM nixty.payment_gateway_logs
      WHERE transaction_id = ?
      ORDER BY id ASC
    `, [transactionId]);
    const paymentInfo = paymentLogs.reduce((acc, log) => {
      acc[log.key] = log.value;
      return acc;
    }, {});
    const [licenseAssignments] = await db.execute(`
      SELECT tl.*, plb.license_type, pk.product_key, pa.email, pa.password
      FROM nixty.transaction_license tl
      JOIN nixty.product_license_base plb ON tl.license_id = plb.id
      LEFT JOIN nixty.product_license_keys pk ON plb.id = pk.id AND plb.license_type = 'product_key'
      LEFT JOIN nixty.product_license_accounts pa ON plb.id = pa.id AND plb.license_type = 'email_password'
      WHERE tl.transaction_id = ?
    `, [transactionId]);
    const licenses = licenseAssignments.map((license) => {
      const licenseData = {
        license_id: license.license_id,
        license_type: license.license_type
      };
      if (license.license_type === "product_key" && license.product_key) {
        licenseData.product_key = license.product_key;
      } else if (license.license_type === "email_password" && license.email) {
        licenseData.email = license.email;
        licenseData.password = license.password;
      }
      return licenseData;
    });
    return {
      success: true,
      transaction: {
        id: transaction.id,
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_slug: transaction.product_slug,
        quantity: transaction.quantity,
        total: transaction.total,
        status: transaction.status,
        created_at: transaction.created_at
      },
      payment_status: {
        status: transaction.status,
        payment_type: paymentInfo.payment_type || "unknown",
        transaction_status: paymentInfo.transaction_status || transaction.status,
        order_id: paymentInfo.order_id || "",
        created_at: paymentInfo.transaction_time || transaction.created_at
      },
      licenses,
      license_count: licenses.length
    };
  } catch (error) {
    console.error("Error getting transaction license status:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to get transaction license status"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
