import { c as defineEventHandler, f as db, e as createError } from '../../_/nitro.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const [orders] = await db.query(
      `SELECT 
        o.id, 
        o.order_id,
        o.user_id,
        o.product_id,
        o.quantity,
        o.total,
        o.status,
        o.created_at,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image_url,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [user.id]
    );
    const completedOrderIds = orders.filter((o) => o.status === "completed").map((o) => o.id);
    let licenseCounts = {};
    if (completedOrderIds.length > 0) {
      const [licenseCountResult] = await db.query(
        `SELECT 
          ol.transaction_id,
          COUNT(ol.license_id) as license_count
        FROM nixty.orders_license ol
        WHERE ol.transaction_id = ANY($1)
        GROUP BY ol.transaction_id`,
        [completedOrderIds]
      );
      licenseCountResult.forEach((result) => {
        licenseCounts[result.transaction_id] = parseInt(result.license_count);
      });
    }
    const failedOrderIds = orders.filter((o) => o.status === "failed").map((o) => o.id);
    let midtransOrderIds = {};
    if (failedOrderIds.length > 0) {
      const [paymentLogs] = await db.query(
        `SELECT 
          transaction_id,
          key,
          value
        FROM nixty.payment_gateway_logs
        WHERE transaction_id = ANY($1)
        AND (key = 'order_id' OR key = 'midtrans_order_id' OR key = 'transaction_id')`,
        [failedOrderIds]
      );
      paymentLogs.forEach((log) => {
        if (!midtransOrderIds[log.transaction_id]) {
          midtransOrderIds[log.transaction_id] = log.value;
        }
      });
    }
    const transformedOrders = orders.map((order) => ({
      id: order.order_id || order.id,
      // Use custom order_id if available
      numeric_id: order.id,
      // Keep numeric ID for internal reference
      order_id: order.order_id,
      // Custom Midtrans-style order ID
      user_id: order.user_id,
      product_id: order.product_id,
      quantity: order.quantity,
      total: parseFloat(order.total),
      status: order.status,
      created_at: order.created_at,
      license_count: order.status === "completed" ? licenseCounts[order.id] || 0 : 0,
      midtrans_order_id: order.status === "failed" ? midtransOrderIds[order.id] || null : null,
      product_name: order.product_name,
      product_description: order.product_description,
      product_price: parseFloat(order.product_price || 0),
      product_image_url: order.product_image_url,
      category_name: order.category_name,
      category_slug: order.category_slug
    }));
    return {
      success: true,
      transactions: transformedOrders,
      // Keep the same response format for compatibility
      orders: transformedOrders
      // Also provide as orders for clarity
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user orders"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map
