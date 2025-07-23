import db from '../utils/db.js';
import { H3Event } from 'h3';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);
    
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }
    
    const [users] = await db.query(
      'SELECT * FROM nixty.users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    const user = users[0];
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password'
      };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    };
    
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
}); 