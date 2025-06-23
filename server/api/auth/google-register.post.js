import pool from '../../utils/db';
import { H3Event } from 'h3';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const { email, name, google_id, picture } = await readBody(event);
    
    if (!email || !google_id) {
      return {
        success: false,
        message: 'Email and Google ID are required'
      };
    }
    
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    const users = existingUsers;
    
    if (users.length > 0) {
      return {
        success: false,
        message: 'A user with this email already exists'
      };
    }
    
    const randomPassword = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, name, password, account_type, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
      [email, name, hashedPassword, 'user', google_id, picture]
    );
    
    const insertId = result.insertId;
    
    const [newUsers] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [insertId]
    );
    
    const user = newUsers[0];
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Google registration successful',
      user: userWithoutPassword
    };
    
  } catch (error) {
    console.error('Google registration error:', error);
    
    return {
      success: false,
      message: 'An error occurred during Google registration'
    };
  }
}); 