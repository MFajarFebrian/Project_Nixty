import pool from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication using secure method
    const user = await requireAuth(event);
    
    // Get transactions for the authenticated user only
    const [transactions] = await pool.execute(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_name, 
        t.amount, 
        t.status, 
        t.payment_method, 
        t.va_number, 
        t.created_at,
        t.customer_name,
        t.email,
        t.product_id,
        t.payment_gateway_status,
        p.name as product_name_full,
        p.version as product_version,
        p.description as product_description
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC`,
      [user.id]
    );

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    if (error.statusCode) {
      throw error; // Re-throw authentication errors
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user transactions',
    });
  }
});
