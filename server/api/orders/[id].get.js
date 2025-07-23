import pool from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get order ID from route parameter
    const orderId = getRouterParam(event, 'id');
    
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      });
    }

    // Get detailed order info with product data using PostgreSQL schema
    // Try to find by order_id first (new custom IDs), then fallback to numeric id
    let orderQuery, orderParams;
    
    if (orderId && isNaN(orderId)) {
      // Custom order ID (e.g., ORDER-123456-20250720-0743)
      orderQuery = `SELECT 
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
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.order_id = $1 AND o.user_id = $2`;
      orderParams = [orderId, user.id];
    } else {
      // Numeric ID (legacy support)
      orderQuery = `SELECT 
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
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.id = $1 AND o.user_id = $2`;
      orderParams = [parseInt(orderId), user.id];
    }
    
    const [orders] = await pool.query(orderQuery, orderParams);

    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      });
    }

    const order = orders[0];

    // Get payment gateway logs for this order
    // Use order_ref if available, otherwise use transaction_id for legacy support
    const [paymentLogs] = await pool.query(
      `SELECT 
        id,
        key,
        value
      FROM nixty.payment_gateway_logs
      WHERE (order_ref = $1 OR transaction_id = $2)
      ORDER BY id ASC`,
      [order.order_id || orderId, order.id]
    );

    // Extract Midtrans order ID from payment logs for failed orders
    let midtransOrderId = null;
    if (order.status === 'failed' && paymentLogs.length > 0) {
      const orderIdLog = paymentLogs.find(log => 
        log.key === 'order_id' || 
        log.key === 'midtrans_order_id' || 
        log.key === 'transaction_id' ||
        log.key === 'gross_amount'
      );
      if (orderIdLog) {
        midtransOrderId = orderIdLog.value;
      }
    }

    // If order is completed, get license information
    let licenseData = null;
    const isCompleted = order.status === 'completed';
    
    if (isCompleted) {
      try {
        // Get license information from the orders_license table and join with license details
        const [orderLicenses] = await pool.query(
          `SELECT 
            ol.license_id,
            plb.license_type,
            plb.status as license_status,
            plb.notes,
            plb.max_usage,
            plb.send_license,
            plk.product_key,
            pla.email,
            pla.password
          FROM nixty.orders_license ol
          INNER JOIN nixty.product_license_base plb ON ol.license_id = plb.id
          LEFT JOIN nixty.product_license_keys plk ON plb.id = plk.id AND plb.license_type = 'product_key'
          LEFT JOIN nixty.product_license_accounts pla ON plb.id = pla.id AND plb.license_type = 'email_password'
          WHERE ol.transaction_id = $1`,
          [order.id]
        );
        
        if (orderLicenses.length > 0) {
          // Transform the license data to match the expected format
          licenseData = orderLicenses.map(license => ({
            license_type: license.license_type,
            status: license.license_status,
            notes: license.notes,
            max_usage: license.max_usage,
            send_license: license.send_license,
            product_key: license.product_key || null,
            email: license.email || null,
            password: license.password || null,
            account: license.email ? {
              email: license.email,
              password: license.password
            } : null
          }));
          
          console.log(`Found ${licenseData.length} licenses for order ${orderId}`);
        }
      } catch (err) {
        console.error('Error fetching license data:', err);
        // Continue without license data if there's an error
      }
    }

    return {
      success: true,
      order: {
        id: order.order_id || order.id, // Use custom order_id if available, fallback to numeric id
        numeric_id: order.id, // Keep numeric ID for internal reference
        order_id: order.order_id, // Custom Midtrans-style order ID
        user_id: order.user_id,
        product_id: order.product_id,
        quantity: order.quantity,
        total: parseFloat(order.total),
        status: order.status,
        created_at: order.created_at,
        midtrans_order_id: midtransOrderId, // Show Midtrans order ID for failed orders
        product: {
          name: order.product_name,
          description: order.product_description,
          price: parseFloat(order.product_price),
          image_url: order.product_image_url,
          category: {
            id: order.category_id,
            name: order.category_name,
            slug: order.category_slug
          }
        },
        licenses: licenseData || [] // Always return as array for consistency
      },
      paymentLogs: paymentLogs || []
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    if (error.statusCode) {
      throw error; // Re-throw authentication/validation errors
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch order details',
    });
  }
});
