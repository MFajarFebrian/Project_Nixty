import pool from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication
    const user = await requireAuth(event);
    
    console.log('🧹 Starting auto-cleanup for user:', user.id);
    
    // Delete transactions that have been marked as "not found in gateway" for more than 1 hour
    const [result] = await pool.execute(
      `DELETE FROM transactions 
       WHERE user_id = $1 
       AND payment_gateway_status = 'not_found_in_gateway' 
       AND updated_at < NOW() - INTERVAL '1 hour'`,
      [user.id]
    );
    
    console.log('🧹 Auto-cleanup completed. Deleted', result.affectedRows, 'transactions');
    
    return {
      success: true,
      message: `Auto-cleanup completed. Deleted ${result.affectedRows} transactions.`,
      data: {
        deleted_count: result.affectedRows
      }
    };
    
  } catch (error) {
    console.error('Error in auto-cleanup:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to perform auto-cleanup',
    });
  }
}); 