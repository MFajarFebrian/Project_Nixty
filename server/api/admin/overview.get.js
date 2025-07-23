
import db from '../../utils/db.js';
import { useCache } from '../../utils/cache.js';
import { rateLimiter } from '../../utils/rateLimiter.js';

/**
 * GET /api/admin/overview
 * Get overview statistics for the admin dashboard
 */
export default defineEventHandler(async (event) => {
  try {
    // Apply rate limiting
    rateLimiter('admin')(event);
    
    const query = getQuery(event);
    const { startDate, endDate, period } = query;
    
    console.log('Admin overview API called with filters:', { startDate, endDate, period });

    // Test basic database connection first
    try {
      const [testResult] = await db.query('SELECT 1 as test');
      console.log('Database connection test successful:', testResult);
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Database connection failed: ${error.message}`
      });
    }

    const stats = {};
    const chartData = {};

    // Get list of existing tables first
    let existingTables = [];
    try {
      // Use PostgreSQL compatible query for nixty schema
      const [tableResult] = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'nixty'");
      existingTables = tableResult.map(row => row.table_name);
      console.log('Existing tables:', existingTables);
    } catch (error) {
      console.error('Error getting table list:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to get table list: ${error.message}`
      });
    }

    // Use all existing tables from nixty schema
    const tables = existingTables.filter(table => {
      // Filter out any system tables if needed
      return !table.startsWith('_') && !table.includes('pg_');
    });

    console.log('Tables to query:', tables);

    await Promise.all(tables.map(async table => {
      try {
        const count = await useCache(`count_${table}`, async () => {
          const [result] = await db.query(`SELECT COUNT(*) as count FROM nixty.${table}`);
          return result[0].count;
        });
        stats[table] = count;
        console.log(`${table}: ${stats[table]} records (cached)`);
      } catch (error) {
        console.error(`Error counting ${table}:`, error);
        stats[table] = 0;
      }
    }));

    // Build date filter conditions
    const dateClauses = [];
    const dateParams = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateClauses.push(`created_at >= ?`);
      dateParams.push(start);
      dateClauses.push(`created_at <= ?`);
      dateParams.push(end);
    }

    const buildQuery = (baseQuery, conditions = [], params = []) => {
      let whereClause = '';
      const allConditions = [...conditions, ...dateClauses];
      if (allConditions.length > 0) {
        whereClause = ` WHERE ${allConditions.join(' AND ')}`;
      }
      return {
        sql: `${baseQuery}${whereClause}`,
        params: [...params, ...dateParams],
      };
    };
    
    // Get chart data
    if (tables.includes('transactions')) {
      try {
        const { groupBy } = getQuery(event); // daily, weekly, monthly
        let dateGroupFormat;
        switch (groupBy) {
          case 'daily':
            dateGroupFormat = '%Y-%m-%d';
            break;
          case 'weekly':
            dateGroupFormat = '%x-%v';
            break;
          case 'monthly':
          default:
            dateGroupFormat = '%Y-%m';
            break;
        }

        const chartQueryBase = `
          SELECT
            TO_CHAR(created_at, ?) AS period,
            SUM(amount) AS total
          FROM transactions`;
        
        // Convert MySQL date format to PostgreSQL format
        let pgDateFormat;
        switch (groupBy) {
          case 'daily':
            pgDateFormat = 'YYYY-MM-DD';
            break;
          case 'weekly':
            pgDateFormat = 'IYYY-IW';
            break;
          case 'monthly':
          default:
            pgDateFormat = 'YYYY-MM';
            break;
        }
        const chartConditions = [`(status = 'settlement' OR status = 'completed')`];
        const chartQuery = buildQuery(chartQueryBase, chartConditions, [pgDateFormat]);
        chartQuery.sql += ` GROUP BY period`; // Add GROUP BY clause
        
        console.log('Executing chart query:', chartQuery.sql, 'with params:', chartQuery.params);
        const [chartResult] = await db.query(chartQuery.sql, chartQuery.params);
        
        chartData.labels = chartResult.map(row => row.period);
        chartData.values = chartResult.map(row => parseFloat(row.total));
        
        console.log(`Generated chart data with ${chartResult.length} results grouped by '${groupBy || 'monthly'}'`);
      } catch (error) {
        console.error('Error generating chart data:', error);
        chartData.labels = [];
        chartData.values = [];
      }
    }

    // Get additional statistics
    try {
      // Recent transactions (only if transactions table exists)
      if (tables.includes('transactions')) {
        try {
          // Total transactions count
          const txCountQuery = buildQuery('SELECT COUNT(*) as count FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')']);
          const [totalTransactions] = await db.query(txCountQuery.sql, txCountQuery.params);
          stats.transactions = totalTransactions[0].count;
          // Alias for clarity in frontend metrics
          stats.totalOrders = stats.transactions;
          
          // Total revenue
          const revenueQuery = buildQuery('SELECT COALESCE(SUM(amount), 0) as total FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')']);
          const [revenue] = await db.query(revenueQuery.sql, revenueQuery.params);
          stats.totalRevenue = parseFloat(revenue[0].total);

          // Active users based on transactions within date range
          try {
            const activeUsersQuery = buildQuery(
              'SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions',
              [
                '(status = \'settlement\' OR status = \'completed\')',
                'user_id IS NOT NULL'
              ]
            );
            const [activeUsers] = await db.query(activeUsersQuery.sql, activeUsersQuery.params);
            stats.activeUsers = activeUsers[0].count;
          } catch (error) {
            console.error('Error getting active users stats:', error);
            stats.activeUsers = 0;
          }

          // Products sold (total licenses purchased/sent) based on quantity in transactions within date range
          try {
            const productsSoldQuery = buildQuery(
              'SELECT COALESCE(SUM(quantity), 0) as total FROM nixty.transactions',
              ['(status = \'settlement\' OR status = \'completed\')']
            );
            const [productsSold] = await db.query(productsSoldQuery.sql, productsSoldQuery.params);
            stats.productsSold = parseInt(productsSold[0].total, 10);
          } catch (error) {
            console.error('Error getting products sold stats:', error);
            stats.productsSold = 0;
          }

        } catch (error) {
          console.error('Error getting transaction stats:', error);
          stats.transactions = 0;
          stats.totalRevenue = 0;
        }
      }

      // Active products (only if products table exists)
      if (tables.includes('products')) {
        try {
          const [activeProducts] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.products WHERE status = $1',
            ['active']
          );
          stats.activeProducts = activeProducts[0].count;

          // Featured products
          const [featuredProducts] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.products WHERE is_featured = $1',
            [true]
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
          const [adminUsers] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.users WHERE account_type = $1',
            ['admin']
          );
          stats.adminUsers = adminUsers[0].count;
        } catch (error) {
          console.error('Error getting user stats:', error);
          stats.adminUsers = 0;
        }
      }

      // Active announcements (only if announcements table exists)
      if (tables.includes('announcements')) {
        try {
          const [activeAnnouncements] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.announcements WHERE status = $1',
            ['active']
          );
          stats.activeAnnouncements = activeAnnouncements[0].count;
        } catch (error) {
          console.error('Error getting announcement stats:', error);
          stats.activeAnnouncements = 0;
        }
      }

      // License stats (only if product_license_base table exists)
      if (tables.includes('product_license_base')) {
        try {
          // Available licenses
          const [availableLicenses] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1',
            ['available']
          );
          stats.availableLicenses = availableLicenses[0].count;

          // Used licenses
          const [usedLicenses] = await db.query(
            'SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1',
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

    // After additional stats calculated, compute previous period comparisons if date range provided
    let percentChange = {};
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // length in ms (inclusive)
        const periodMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - periodMs);

        const prevDateClauses = [];
        const prevDateParams = [];
        prevDateClauses.push(`created_at >= ?`);
        prevDateParams.push(prevStart);
        prevDateClauses.push(`created_at <= ?`);
        prevDateParams.push(prevEnd);

        const buildPrevQuery = (baseQuery, conditions = [], params = []) => {
          let whereClause = '';
          const allConditions = [...conditions, ...prevDateClauses];
          if (allConditions.length > 0) {
            whereClause = ` WHERE ${allConditions.join(' AND ')}`;
          }
          return {
            sql: `${baseQuery}${whereClause}`,
            params: [...params, ...prevDateParams]
          };
        };

        // Previous orders count
        let prevOrders = 0;
        if (tables.includes('transactions')) {
          const prevOrdersQuery = buildPrevQuery('SELECT COUNT(*) as count FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')']);
          const [prevOrdersRes] = await db.query(prevOrdersQuery.sql, prevOrdersQuery.params);
          prevOrders = prevOrdersRes[0].count;
        }

        // Previous active users
        let prevActiveUsers = 0;
        if (tables.includes('transactions')) {
          const prevUsersQuery = buildPrevQuery('SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')', 'user_id IS NOT NULL']);
          const [prevUsersRes] = await db.query(prevUsersQuery.sql, prevUsersQuery.params);
          prevActiveUsers = prevUsersRes[0].count;
        }

        // Previous products sold
        let prevProductsSold = 0;
        if (tables.includes('transactions')) {
          const prevSoldQuery = buildPrevQuery('SELECT COALESCE(SUM(quantity),0) as total FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')']);
          const [prevSoldRes] = await db.query(prevSoldQuery.sql, prevSoldQuery.params);
          prevProductsSold = parseInt(prevSoldRes[0].total, 10);
        }

        // Previous revenue
        let prevRevenue = 0;
        if (tables.includes('transactions')) {
          const prevRevenueQuery = buildPrevQuery('SELECT COALESCE(SUM(amount),0) as total FROM nixty.transactions', ['(status = \'settlement\' OR status = \'completed\')']);
          const [prevRevRes] = await db.query(prevRevenueQuery.sql, prevRevenueQuery.params);
          prevRevenue = parseFloat(prevRevRes[0].total);
        }

        const calcPct = (current, prev) => {
          if (!prev || prev === 0) return null;
          return Number(((current - prev) / prev * 100).toFixed(1));
        };

        percentChange = {
          totalOrders: calcPct(stats.totalOrders || 0, prevOrders),
          activeUsers: calcPct(stats.activeUsers || 0, prevActiveUsers),
          productsSold: calcPct(stats.productsSold || 0, prevProductsSold),
          totalRevenue: calcPct(stats.totalRevenue || 0, prevRevenue)
        };
      } catch (err) {
        console.error('Failed to compute previous period stats:', err);
      }
    }

    // Get recent activity (last 10 transactions) - only if transactions table exists
    let recentActivity = [];
    if (tables.includes('transactions')) {
      try {
        const recentActivityData = await useCache('recent_activity', async () => {
          const activityQuery = buildQuery('SELECT id, product_id, total, status, created_at FROM nixty.transactions');
          const finalActivityQuery = `${activityQuery.sql} ORDER BY created_at DESC LIMIT 10`;

          console.log('Executing recent activity query with date filter:', { sql: finalActivityQuery, params: activityQuery.params });
          const [activity] = await db.query(finalActivityQuery, activityQuery.params);
          console.log(`Found ${activity.length} recent transactions`);
          return activity;
        });
        recentActivity = recentActivityData;
      } catch (error) {
        console.error('Error getting recent activity:', error);
      }
    }

    // Get table information for existing tables only
    const tableInfo = {};
    for (const table of tables) {
      try {
          const [columns] = await db.query(`
            SELECT column_name as "Field", data_type as "Type", 
                   is_nullable as "Null", column_default as "Default",
                   '' as "Key", '' as "Extra"
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'nixty'
            ORDER BY ordinal_position
          `, [table]);
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
        tables: tableInfo,
        chartData,
        percentChange
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

