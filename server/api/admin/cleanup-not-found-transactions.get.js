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
    const daysOld = parseInt(query.days || '7', 10); // Default to 7 days
    const dryRun = query.dry_run === 'true'; // Default to false
    
    if (isNaN(daysOld) || daysOld < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Days parameter must be a positive number'
      });
    }
    
    // Find transactions with not_found_in_gateway status older than specified days
    const [transactions] = await db.execute(
      `SELECT id, order_id, product_name, email, amount, created_at, updated_at
       FROM transactions 
       WHERE payment_gateway_status = 'not_found_in_gateway'
       AND updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
    
    if (transactions.length === 0) {
      return {
        success: true,
        message: `No transactions with 'not_found_in_gateway' status older than ${daysOld} days found`,
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
        message: `Found ${transactions.length} transactions with 'not_found_in_gateway' status older than ${daysOld} days (DRY RUN)`,
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
      message: `Successfully deleted ${result.affectedRows} transactions with 'not_found_in_gateway' status older than ${daysOld} days`,
      data: {
        deleted: result.affectedRows,
        transactions,
        dry_run: false
      }
    };
    
  } catch (error) {
    console.error('Error cleaning up not found transactions:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clean up transactions',
    });
  }
}); 