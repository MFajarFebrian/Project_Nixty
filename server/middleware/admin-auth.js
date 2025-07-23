import db from '../utils/db.js';
import { getHeaders, createError } from 'h3';

/**
 * Admin authentication middleware
 * Verifies that the user is authenticated and has admin privileges
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  
  // Only apply admin auth to admin API routes
  if (!url.pathname.startsWith('/api/admin/')) {
    return;
  }
  
  const config = useRuntimeConfig();
  
  // Skip authentication for development mode
  const isDev = process.env.NODE_ENV === 'development';
  const bypassAuth = isDev && config.public.bypassAdminAuth === 'true';
  
  if (bypassAuth) {
    console.log('Admin auth bypassed for development');
    // Add mock admin headers for development
    event.node.req.headers['x-user-id'] = 'dev-admin-id';
    event.node.req.headers['x-user-email'] = 'dev-admin@example.com';
    return;
  }
  
  // Regular authentication process
  const headers = getHeaders(event);
  const userId = headers['x-user-id'];
  const userEmail = headers['x-user-email'];
  
  if (!userId || !userEmail) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }
  
  // Check if user is an admin
  try {
    const [users] = await db.query(
      'SELECT account_type FROM nixty.users WHERE id = ? AND email = ? LIMIT 1', 
      [userId, userEmail]
    );
    
    const isAdmin = users && users.length > 0 && users[0].account_type === 'admin';
    
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
});
