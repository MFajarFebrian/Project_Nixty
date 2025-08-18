import bcrypt from 'bcryptjs';
import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication using secure method
    const user = await requireAuth(event);
    
    // Get request body
    const body = await readBody(event);
    const { currentPassword, newPassword } = body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current password and new password are required'
      });
    }
    
    // Validate new password strength
    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New password must be at least 8 characters long'
      });
    }
    
    // Get current user data including password
    const [rows] = await db.query(
      'SELECT password FROM nixty.users WHERE id = ?',
      [user.id]
    );
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }
    
    const currentUser = rows[0];
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current password is incorrect'
      });
    }
    
    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New password must be different from current password'
      });
    }
    
    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password in database
    await db.query(
      'UPDATE nixty.users SET password = ? WHERE id = ?',
      [hashedNewPassword, user.id]
    );
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
    
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw known errors (validation, auth, etc.)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to change password'
    });
  }
});
