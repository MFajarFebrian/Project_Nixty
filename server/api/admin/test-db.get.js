import pool from '../../utils/db';

/**
 * GET /api/admin/test-db
 * Simple database connection test
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Basic connection
    const [testResult] = await pool.execute('SELECT 1 as test, NOW() as current_time');
    console.log('Basic connection test:', testResult);
    
    // Test 2: Get database name
    const [dbResult] = await pool.execute('SELECT DATABASE() as db_name');
    console.log('Current database:', dbResult);
    
    // Test 3: Show tables
    const [tablesResult] = await pool.execute('SHOW TABLES');
    console.log('Tables result:', tablesResult);
    
    return {
      success: true,
      data: {
        connectionTest: testResult[0],
        database: dbResult[0],
        tablesCount: tablesResult.length,
        tables: tablesResult.map(row => Object.values(row)[0])
      }
    };
    
  } catch (error) {
    console.error('Database test error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: `Database test failed: ${error.message}`
    });
  }
});
