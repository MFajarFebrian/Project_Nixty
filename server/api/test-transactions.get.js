import db from '../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    // Simple query to get transaction count
    const [countResult] = await db.execute('SELECT COUNT(*) AS count FROM transactions');
    const count = countResult[0]?.count || 0;

    // Get a sample of transactions if any exist
    let recentTransactions = [];
    if (count > 0) {
      [recentTransactions] = await db.execute(
        'SELECT id, order_id, product_name, amount, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 5'
      );
    }

    return {
      success: true,
      count,
      recentTransactions,
      message: count > 0 ? 'Transactions found' : 'No transactions found in database',
    };
  } catch (error) {
    console.error('Error testing transactions table:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error accessing transactions table'
    };
  }
}); 