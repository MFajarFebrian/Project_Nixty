import db from '../utils/db.js';
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
    
    const [existingUsers] = await db.query(
      'SELECT id FROM nixty.users WHERE email = $1',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO nixty.users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, account_type',
      [email, hashedPassword, name || null]
    );
    
    const newUser = result[0];
    
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