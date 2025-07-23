import { c as defineEventHandler, g as getHeaders, e as createError, h as getQuery, f as db } from '../../../_/nitro.mjs';
import { W as WebhookLogger } from '../../../_/webhookLogger.mjs';
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

const licenseDeliveryStats_get = defineEventHandler(async (event) => {
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
    const query = getQuery(event);
    const days = parseInt(query.days) || 7;
    console.log(`Fetching license delivery stats for last ${days} days...`);
    const webhookStats = await WebhookLogger.getWebhookStats(days);
    const failedDeliveries = await WebhookLogger.getFailedDeliveries(50);
    const [transactionStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' OR payment_gateway_status = 'settlement' THEN 1 ELSE 0 END) as completed_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
        SUM(quantity) as total_licenses_requested
      FROM transactions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    const [licenseStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT t.id) as completed_transactions_with_licenses,
        SUM(t.quantity) as total_licenses_requested_completed,
        COUNT(luh.id) as licenses_delivered
      FROM transactions t
      LEFT JOIN license_usage_history luh ON t.id = luh.transaction_id
      WHERE (t.status = 'completed' OR t.payment_gateway_status = 'settlement')
      AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    const [productStats] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.version,
        COUNT(DISTINCT t.id) as transactions,
        SUM(t.quantity) as licenses_requested,
        COUNT(luh.id) as licenses_delivered,
        ROUND((COUNT(luh.id) / SUM(t.quantity)) * 100, 2) as delivery_rate
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id 
        AND (t.status = 'completed' OR t.payment_gateway_status = 'settlement')
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      LEFT JOIN license_usage_history luh ON t.id = luh.transaction_id
      GROUP BY p.id, p.name, p.version
      HAVING transactions > 0
      ORDER BY transactions DESC
    `, [days]);
    const [stockStatus] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.version,
        COUNT(pl.id) as total_licenses,
        SUM(CASE WHEN pl.status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN pl.status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN pl.status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN pl.status = 'reserved' THEN 1 ELSE 0 END) as reserved
      FROM products p
      LEFT JOIN product_licenses pl ON p.id = pl.product_id
      GROUP BY p.id, p.name, p.version
      HAVING total_licenses > 0
      ORDER BY available ASC
    `);
    const totalStats = transactionStats[0];
    const licenseStatsData = licenseStats[0];
    const deliverySuccessRate = licenseStatsData.total_licenses_requested_completed > 0 ? licenseStatsData.licenses_delivered / licenseStatsData.total_licenses_requested_completed * 100 : 0;
    const alerts = [];
    if (failedDeliveries.length > 0) {
      alerts.push({
        type: "error",
        title: `${failedDeliveries.length} Failed License Deliveries`,
        message: `${failedDeliveries.length} transactions have unresolved license delivery failures.`,
        action: "retry",
        count: failedDeliveries.length
      });
    }
    const lowStockProducts = stockStatus.filter((p) => p.available <= 5 && p.available > 0);
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: "warning",
        title: `${lowStockProducts.length} Products Low on Stock`,
        message: `${lowStockProducts.length} products have 5 or fewer licenses available.`,
        action: "restock",
        products: lowStockProducts.map((p) => `${p.name} (${p.available} left)`)
      });
    }
    const outOfStockProducts = stockStatus.filter((p) => p.available === 0);
    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: "error",
        title: `${outOfStockProducts.length} Products Out of Stock`,
        message: `${outOfStockProducts.length} products have no available licenses.`,
        action: "restock",
        products: outOfStockProducts.map((p) => `${p.name}`)
      });
    }
    if (deliverySuccessRate < 95 && licenseStatsData.total_licenses_requested_completed > 0) {
      alerts.push({
        type: "warning",
        title: `Low License Delivery Rate`,
        message: `Only ${deliverySuccessRate.toFixed(1)}% of licenses are being delivered successfully.`,
        action: "investigate",
        rate: deliverySuccessRate
      });
    }
    return {
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          total_transactions: totalStats.total_transactions,
          completed_transactions: totalStats.completed_transactions,
          pending_transactions: totalStats.pending_transactions,
          failed_transactions: totalStats.failed_transactions,
          total_licenses_requested: totalStats.total_licenses_requested,
          licenses_delivered: licenseStatsData.licenses_delivered,
          delivery_success_rate: Math.round(deliverySuccessRate * 100) / 100,
          failed_deliveries_count: failedDeliveries.length
        },
        webhook_stats: webhookStats,
        product_stats: productStats,
        stock_status: stockStatus,
        failed_deliveries: failedDeliveries.slice(0, 10),
        // Only return first 10 for preview
        alerts
      }
    };
  } catch (error) {
    console.error("Error fetching license delivery stats:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch stats: ${error.message}`
    });
  }
});

export { licenseDeliveryStats_get as default };
//# sourceMappingURL=license-delivery-stats.get.mjs.map
