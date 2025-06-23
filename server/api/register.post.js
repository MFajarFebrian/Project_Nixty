import pool from '../utils/db';
import { H3Event } from 'h3';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {

    const { email, password, name } = await readBody(event);
    
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }
    
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name || null]
    );
    
    const insertResult = result;
    
    const [newUsers] = await pool.execute(
      'SELECT id, email, name, account_type, created_at FROM users WHERE id = ?',
      [insertResult.insertId]
    );
    
    const newUser = newUsers[0];
    
    return {
      success: true,
      message: 'Registration successful',
      user: newUser
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
}); 