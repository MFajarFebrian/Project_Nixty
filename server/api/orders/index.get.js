import db from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication using secure method
    const user = await requireAuth(event);
    
    // Get orders for the authenticated user only (using PostgreSQL schema)
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

    // Get license counts for completed orders
    const completedOrderIds = orders.filter(o => o.status === 'completed').map(o => o.id);
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
      
      // Map license counts to order IDs
      licenseCountResult.forEach(result => {
        licenseCounts[result.transaction_id] = parseInt(result.license_count);
      });
    }

    // Get Midtrans order IDs for failed orders
    const failedOrderIds = orders.filter(o => o.status === 'failed').map(o => o.id);
    const midtransOrderIds = {};

    if (failedOrderIds.length > 0) {
      const [paymentLogs] = await db.query(
        `SELECT transaction_id, value
         FROM nixty.payment_gateway_logs
         WHERE transaction_id = ANY($1) AND key = 'midtrans_order_id'`,
        [failedOrderIds]
      );
      
      paymentLogs.forEach(log => {
        midtransOrderIds[log.transaction_id] = log.value;
      });
    }

    // Transform orders to include proper formatting
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_id: order.order_id, // Custom Midtrans-style order ID
      user_id: order.user_id,
      product_id: order.product_id,
      quantity: order.quantity,
      total: parseFloat(order.total),
      status: order.status,
      created_at: order.created_at,
      license_count: order.status === 'completed' ? (licenseCounts[order.id] || 0) : 0,
      midtrans_order_id: order.status === 'failed' ? midtransOrderIds[order.id] || null : null,
      product_name: order.product_name,
      product_description: order.product_description,
      product_price: parseFloat(order.product_price || 0),
      product_image_url: order.product_image_url,
      category_name: order.category_name,
      category_slug: order.category_slug
    }));

    return {
      success: true,
      transactions: transformedOrders, // Keep the same response format for compatibility
      orders: transformedOrders // Also provide as orders for clarity
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (error.statusCode) {
      throw error; // Re-throw authentication errors
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user orders',
    });
  }
});
