import pool from '../utils/db';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    // Get token and new password from request body
    const { token, password } = await readBody(event);
    
    if (!token || !password) {
      return {
        success: false,
        message: 'Token and password are required'
      };
    }
    
    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    // Find user with this reset token
    const [users] = await pool.execute(
      'SELECT * FROM nixty.users WHERE reset_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      };
    }
    
    const user = users[0];
    
    // Check if token has expired
    const tokenExpiry = new Date(user.reset_token_expires);
    const now = new Date();
    
    if (now > tokenExpiry) {
      return {
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      };
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user's password and clear reset token
    await pool.execute(
      'UPDATE nixty.users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    return {
      success: true,
      message: 'Your password has been reset successfully. You can now login with your new password.'
    };
    
  } catch (error) {
    console.error('Reset password error:', error);
    
    return {
      success: false,
      message: 'An error occurred while resetting your password'
    };
  }
});