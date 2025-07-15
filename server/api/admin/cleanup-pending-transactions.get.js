import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }
    
    // Verify user is an admin
    try {
      const [users] = await db.execute(
        'SELECT role FROM users WHERE id = ? AND email = ? LIMIT 1', 
        [userId, userEmail]
      );
      
      const isAdmin = users && users.length > 0 && users[0].role === 'admin';
      
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        });
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      
      console.error('Error checking admin status:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to validate admin status'
      });
    }
    
    // Get query parameters
    const query = getQuery(event);
    const minutesOld = parseInt(query.minutes || '1', 10); // Default to 1 minute
    const dryRun = query.dry_run === 'true'; // Default to false
    
    if (isNaN(minutesOld) || minutesOld < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Minutes parameter must be a positive number'
      });
    }
    
    // Find transactions with pending status older than specified minutes
    const [transactions] = await db.execute(
      `SELECT id, order_id, product_name, email, amount, status, created_at, updated_at
       FROM transactions 
       WHERE status = 'pending'
       AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [minutesOld]
    );
    
    if (transactions.length === 0) {
      return {
        success: true,
        message: `No pending transactions older than ${minutesOld} minutes found`,
        data: {
          deleted: 0,
          dry_run: dryRun
        }
      };
    }
    
    // If this is a dry run, just return the transactions that would be deleted
    if (dryRun) {
      return {
        success: true,
        message: `Found ${transactions.length} pending transactions older than ${minutesOld} minutes (DRY RUN)`,
        data: {
          transactions,
          count: transactions.length,
          dry_run: true
        }
      };
    }
    
    // Delete the transactions
    const ids = transactions.map(t => t.id);
    const placeholders = ids.map(() => '?').join(',');
    
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id IN (${placeholders})`,
      ids
    );
    
    return {
      success: true,
      message: `Successfully deleted ${result.affectedRows} pending transactions older than ${minutesOld} minutes`,
      data: {
        deleted: result.affectedRows,
        transactions,
        dry_run: false
      }
    };
    
  } catch (error) {
    console.error('Error cleaning up pending transactions:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clean up pending transactions',
    });
  }
});
