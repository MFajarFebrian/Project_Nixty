import db from '../../utils/db.js';
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
    
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    const users = existingUsers;
    let user;
    
    if (users.length === 0) {
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const [result] = await db.query(
        'INSERT INTO users (email, name, password, account_type, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
        [email, name, hashedPassword, 'user', google_id, picture]
      );
      
      const insertId = result.insertId;
      
      const [newUsers] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [insertId]
      );
      
      user = newUsers[0];
    } else {
      user = users[0];
      
      if (!user.google_id) {
        await db.query(
          'UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?',
          [google_id, picture, user.id]
        );
        
        user.google_id = google_id;
        user.profile_picture = picture;
      }
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Google login successful',
      user: userWithoutPassword
    };
    
  } catch (error) {
    console.error('Google login error:', error);
    
    return {
      success: false,
      message: 'An error occurred during Google login'
    };
  }
}); 