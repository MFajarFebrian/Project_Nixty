import pool from '../../utils/db';

/**
 * GET /api/admin/overview
 * Get overview statistics for the admin dashboard
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Admin overview API called');

    // Test basic database connection first
    try {
      const [testResult] = await pool.execute('SELECT 1 as test');
      console.log('Database connection test successful:', testResult);
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Database connection failed: ${error.message}`
      });
    }

    const stats = {};

    // Get list of existing tables first
    let existingTables = [];
    try {
      const [tableResult] = await pool.execute('SHOW TABLES');
      existingTables = tableResult.map(row => Object.values(row)[0]);
      console.log('Existing tables:', existingTables);
    } catch (error) {
      console.error('Error getting table list:', error);
      console.error('Trying alternative query...');

      // Try alternative approach
      try {
        const [altResult] = await pool.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()");
        existingTables = altResult.map(row => row.table_name);
        console.log('Tables from information_schema:', existingTables);
      } catch (altError) {
        console.error('Alternative query also failed:', altError);
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to get table list: ${error.message}`
        });
      }
    }

    // Only query tables that actually exist
    const requestedTables = ['users', 'products', 'categories', 'announcements', 'deals', 'hero_slides', 'transactions', 'product_licenses'];
    const tables = requestedTables.filter(table => existingTables.includes(table));

    console.log('Tables to query:', tables);

    for (const table of tables) {
      try {
        const [result] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result[0].count;
        console.log(`${table}: ${stats[table]} records`);
      } catch (error) {
        console.error(`Error counting ${table}:`, error);
        stats[table] = 0;
      }
    }

    // Get additional statistics
    try {
      // Recent transactions (only if transactions table exists)
      if (tables.includes('transactions')) {
        try {
          const [recentTransactions] = await pool.execute(
            'SELECT COUNT(*) as count FROM transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
          );
          stats.recentTransactions = recentTransactions[0].count;

          // Total revenue (from completed transactions)
          const [revenue] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = ?',
            ['settlement']
          );
          stats.totalRevenue = parseFloat(revenue[0].total);
        } catch (error) {
          console.error('Error getting transaction stats:', error);
          stats.recentTransactions = 0;
          stats.totalRevenue = 0;
        }
      }

      // Active products (only if products table exists)
      if (tables.includes('products')) {
        try {
          const [activeProducts] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE status = ?',
            ['active']
          );
          stats.activeProducts = activeProducts[0].count;

          // Featured products
          const [featuredProducts] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE is_featured = ?',
            [1]
          );
          stats.featuredProducts = featuredProducts[0].count;
        } catch (error) {
          console.error('Error getting product stats:', error);
          stats.activeProducts = 0;
          stats.featuredProducts = 0;
        }
      }

      // Admin users (only if users table exists)
      if (tables.includes('users')) {
        try {
          const [adminUsers] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE account_type = ?',
            ['admin']
          );
          stats.adminUsers = adminUsers[0].count;
        } catch (error) {
          console.error('Error getting user stats:', error);
          stats.adminUsers = 0;
        }
      }

      // Active deals (only if deals table exists)
      if (tables.includes('deals')) {
        try {
          const [activeDeals] = await pool.execute(
            'SELECT COUNT(*) as count FROM deals WHERE status = ? AND (expires_at IS NULL OR expires_at > NOW())',
            ['active']
          );
          stats.activeDeals = activeDeals[0].count;
        } catch (error) {
          console.error('Error getting deal stats:', error);
          stats.activeDeals = 0;
        }
      }

      // License stats (only if product_licenses table exists)
      if (tables.includes('product_licenses')) {
        try {
          // Available licenses
          const [availableLicenses] = await pool.execute(
            'SELECT COUNT(*) as count FROM product_licenses WHERE status = ?',
            ['available']
          );
          stats.availableLicenses = availableLicenses[0].count;

          // Used licenses
          const [usedLicenses] = await pool.execute(
            'SELECT COUNT(*) as count FROM product_licenses WHERE status = ?',
            ['used']
          );
          stats.usedLicenses = usedLicenses[0].count;
        } catch (error) {
          console.error('Error getting license stats:', error);
          stats.availableLicenses = 0;
          stats.usedLicenses = 0;
        }
      }

    } catch (error) {
      console.error('Error getting additional stats:', error);
    }

    // Get recent activity (last 10 transactions) - only if transactions table exists
    let recentActivity = [];
    if (tables.includes('transactions')) {
      try {
        const [activity] = await pool.execute(
          'SELECT id, order_id, product_name, amount, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 10'
        );
        recentActivity = activity;
        console.log(`Found ${recentActivity.length} recent transactions`);
      } catch (error) {
        console.error('Error getting recent activity:', error);
      }
    }

    // Get table information for existing tables only
    const tableInfo = {};
    for (const table of tables) {
      try {
        const [columns] = await pool.execute(`DESCRIBE ${table}`);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' '),
          columnCount: columns.length,
          recordCount: stats[table] || 0,
          columns: columns.map(col => ({
            name: col.Field,
            type: col.Type,
            nullable: col.Null === 'YES',
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          }))
        };
        console.log(`Table info for ${table}: ${columns.length} columns, ${stats[table]} records`);
      } catch (error) {
        console.error(`Error getting info for ${table}:`, error);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' '),
          columnCount: 0,
          recordCount: 0,
          columns: []
        };
      }
    }

    return {
      success: true,
      data: {
        statistics: stats,
        recentActivity,
        tables: tableInfo
      }
    };

  } catch (error) {
    console.error('Error getting admin overview:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get admin overview: ${error.message}`
    });
  }
});
