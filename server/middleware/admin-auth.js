import pool from '../utils/db';

/**
 * Admin authentication middleware
 * Verifies that the user is authenticated and has admin privileges
 */
export default defineEventHandler(async (event) => {
  // Only apply to admin API routes
  if (!event.node.req.url?.startsWith('/api/admin/')) {
    return;
  }

  try {
    // Get user ID from headers (you might need to adjust this based on your auth implementation)
    const userId = getHeader(event, 'x-user-id');
    const userEmail = getHeader(event, 'x-user-email');
    
    if (!userId && !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    // Verify user exists and is admin
    let query, params;
    if (userId) {
      query = 'SELECT id, email, account_type FROM users WHERE id = ? AND account_type = ?';
      params = [userId, 'admin'];
    } else {
      query = 'SELECT id, email, account_type FROM users WHERE email = ? AND account_type = ?';
      params = [userEmail, 'admin'];
    }

    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    // Add user info to event context for use in handlers
    event.context.adminUser = rows[0];
    
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Admin auth middleware error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication error'
    });
  }
});
