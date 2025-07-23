import db from '../../utils/db.js';
import { requireAuth } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Validate user authentication using secure method
    const user = await requireAuth(event);
    
    // Get request body
    const body = await readBody(event);
    const { name, email, phone } = body;
    
    // Validate required fields
    if (!name && !email && !phone) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one field (name, email, or phone) is required'
      });
    }
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      });
    }
    
    // Validate phone format if provided (basic validation)
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid phone number format'
      });
    }
    
    // Check if email already exists (if email is being updated)
    if (email) {
      const [existingUsers] = await db.query(
        'SELECT id FROM nixty.users WHERE email = ? AND id != ?',
        [email, user.id]
      );
      
      if (existingUsers.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email already exists'
        });
      }
    }
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    updateValues.push(user.id);
    
    // Update user profile
    await db.query(
      `UPDATE nixty.users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Fetch updated user data
    const [rows] = await db.query(
      'SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?',
      [user.id]
    );
    
    return {
      success: true,
      message: 'Profile updated successfully',
      user: rows[0]
    };
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw known errors (validation, auth, etc.)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    });
  }
});
