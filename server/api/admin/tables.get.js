import pool from '../../utils/db';
import { H3Event } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await pool.execute(
      'SHOW TABLES FROM nixty'
    );
    
    const tables = rows.map(row => {
      return Object.values(row)[0];
    });
    
    return {
      success: true,
      tables
    };
    
  } catch (error) {
    console.error('Error fetching tables:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching tables'
    };
  }
}); 