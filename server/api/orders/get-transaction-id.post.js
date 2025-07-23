import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id } = body;
    
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      });
    }

    // Find the transaction ID by looking up the order_id directly in orders table
    const [orders] = await pool.execute(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );

    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }

    return {
      success: true,
      transaction_id: orders[0].id
    };

  } catch (error) {
    console.error('Error getting transaction ID:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get transaction ID',
    });
  }
});
