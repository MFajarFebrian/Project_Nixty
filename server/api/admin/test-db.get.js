import pool from '../../utils/db';

/**
 * GET /api/admin/test-db
 * Test database connection and basic functionality
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing database connection...');

    // Test 1: Basic connection
    const [testResult] = await pool.execute('SELECT 1 as test');
    console.log('Basic connection test:', testResult);

    // Test 2: Check if tables exist
    const [tablesResult] = await pool.execute('SHOW TABLES');
    const existingTables = tablesResult.map(row => Object.values(row)[0]);
    console.log('Existing tables:', existingTables);

    // Test 3: Check each required table
    const requiredTables = ['users', 'products', 'categories', 'announcements', 'deals', 'hero_slides', 'transactions', 'product_licenses'];
    const tableStatus = {};

    for (const table of requiredTables) {
      try {
        const [countResult] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        tableStatus[table] = {
          exists: true,
          recordCount: countResult[0].count
        };
      } catch (error) {
        tableStatus[table] = {
          exists: false,
          error: error.message
        };
      }
    }

    // Test 4: Check for admin users
    let adminUsers = [];
    try {
      const [adminResult] = await pool.execute('SELECT id, email, account_type FROM users WHERE account_type = ?', ['admin']);
      adminUsers = adminResult;
    } catch (error) {
      console.error('Error checking admin users:', error);
    }

    // Test 5: Check for sample data
    let sampleData = {};
    try {
      // Check products
      const [productsResult] = await pool.execute('SELECT COUNT(*) as count FROM products');
      sampleData.products = productsResult[0].count;

      // Check categories
      const [categoriesResult] = await pool.execute('SELECT COUNT(*) as count FROM categories');
      sampleData.categories = categoriesResult[0].count;

      // Check transactions
      const [transactionsResult] = await pool.execute('SELECT COUNT(*) as count FROM transactions');
      sampleData.transactions = transactionsResult[0].count;
    } catch (error) {
      console.error('Error checking sample data:', error);
    }

    return {
      success: true,
      message: 'Database connection test completed',
      data: {
        connection: 'OK',
        existingTables,
        tableStatus,
        adminUsers: adminUsers.length,
        sampleData
      }
    };

  } catch (error) {
    console.error('Database test failed:', error);
    
    return {
      success: false,
      message: 'Database connection test failed',
      error: error.message,
      data: {
        connection: 'FAILED',
        error: error.message
      }
    };
  }
});
