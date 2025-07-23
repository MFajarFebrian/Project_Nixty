import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.*,
        p.name as product_name,
        u.name as user_name,
        u.email as user_email
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.users u ON o.user_id = u.id
      ORDER BY o.created_at DESC 
      LIMIT 100
    `);
    
    return {
      success: true,
      data: rows
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch transactions'
    };
  }
});
