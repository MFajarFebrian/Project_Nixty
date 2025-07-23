import pool from '../utils/db';
import { randomBytes } from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    // Get email from request body
    const { email } = await readBody(event);
    
    if (!email) {
      return {
        success: false,
        message: 'Email is required'
      };
    }
    
    // Check if user exists with this email
    const [users] = await pool.execute(
      'SELECT id, email, name FROM nixty.users WHERE email = ?',
      [email]
    );
    
    // Even if user doesn't exist, we'll return success
    // This is to prevent email enumeration attacks
    if (users.length === 0) {
      console.log(`Reset password requested for non-existent email: ${email}`);
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      };
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token expires in 1 hour
    
    // Store token in database
    await pool.execute(
      'UPDATE nixty.users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );
    
    // Generate reset URL
    const resetUrl = `${event.node.req.headers.origin || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // In a real application, you would send an email with the reset link
    // For this example, we'll just return the link in the response (for testing/demo purposes)
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    
    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      // In production, remove the resetUrl from response
      resetUrl: resetUrl
    };
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    return {
      success: false,
      message: 'An error occurred while processing your request'
    };
  }
}); 