import db from './db.js';

/**
 * Validate user session and return user data
 * @param {Object} event - Nuxt event object
 * @returns {Object|null} User data if valid, null otherwise
 */
export async function validateUserSession(event) {
  try {
    const headers = getHeaders(event);
    const sessionUser = headers['x-user-session'];
    
    if (!sessionUser) {
      return null;
    }

    let user;
    try {
      user = JSON.parse(sessionUser);
    } catch (parseError) {
      console.error('Invalid session data format:', parseError);
      return null;
    }

    if (!user || !user.id || !user.email) {
      return null;
    }

    // Verify user exists in database and session data is valid
    const [rows] = await db.query(
      'SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?',
      [user.id]
    );

    if (rows.length === 0) {
      return null;
    }

    const dbUser = rows[0];
    
    // Basic validation - check if email matches
    if (dbUser.email !== user.email) {
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error('Error validating user session:', error);
    return null;
  }
}

/**
 * Require authentication for an API endpoint
 * @param {Object} event - Nuxt event object
 * @returns {Object} User data
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth(event) {
  const user = await validateUserSession(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    });
  }

  return user;
}

/**
 * Require admin authentication for an API endpoint
 * @param {Object} event - Nuxt event object
 * @returns {Object} User data
 * @throws {Error} If user is not authenticated or not admin
 */
export async function requireAdmin(event) {
  const user = await requireAuth(event);
  
  if (user.account_type !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    });
  }

  return user;
}
