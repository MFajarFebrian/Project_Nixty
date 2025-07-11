import db from '../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('Testing database connection...');
    
    // Simple test query
    const [result] = await db.query('SELECT 1 as test');
    
    console.log('Database connection successful');
    
    return {
      success: true,
      message: 'Database connection successful',
      testResult: result[0],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database connection failed:', error);
    
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
