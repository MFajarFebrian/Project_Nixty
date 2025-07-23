import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication using secure method
    const user = await requireAuth(event);
    
    // Fetch fresh user data from database
    const [rows] = await db.query(
      'SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?',
      [user.id]
    );
    
    if (rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    const dbUser = rows[0];
    
    return {
      success: true,
      user: dbUser
    };
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw authentication errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profile data'
    });
  }
});
