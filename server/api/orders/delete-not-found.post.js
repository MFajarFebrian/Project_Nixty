import pool from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    // Get request body
    const body = await readBody(event);
    const { transactionId } = body;
    
    // Check if specific transaction ID was provided
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required',
      });
    }
    
    // First, verify the transaction exists, belongs to this user, and has the correct status
    const [transactions] = await pool.execute(
      `SELECT id, order_id, status, payment_gateway_status
       FROM transactions 
       WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    const transaction = transactions[0];
    
    // Check if the transaction has the not_found_in_gateway status
    if (transaction.payment_gateway_status !== 'not_found_in_gateway') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only transactions with "not found in gateway" status can be deleted',
      });
    }
    
    // Delete the transaction
    const [result] = await pool.execute(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    
    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete transaction',
      });
    }
    
    return {
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        transactionId: parseInt(transactionId),
        order_id: transaction.order_id
      }
    };
    
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete transaction',
    });
  }
}); 