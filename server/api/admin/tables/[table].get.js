import db from '../../../utils/db.js';
import { useSupabase } from '../../../utils/config.js';

/**
 * GET /api/admin/tables/[table]
 * Fetch records from a table
 */
export default defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, 'table');
    console.log(`Fetching data from table: ${tableName}`);

    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Table name is required'
      });
    }

    // Check for allowed tables (from nixty schema)
    const allowedTables = [
      'users', 'products', 'categories', 'transactions', 
      'product_license_base', 'product_license_keys', 'product_license_accounts',
      'product_tags', 'transaction_license', 'payment_gateway_logs'
    ];
    
    if (!allowedTables.includes(tableName)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access to table '${tableName}' is not allowed`
      });
    }
    
    // Count total records (use nixty schema for Supabase)
    const schemaPrefix = useSupabase ? 'nixty.' : '';
    let countQuery = `SELECT COUNT(*) as total FROM ${schemaPrefix}${tableName}`;
    const countParams = [];
    
    // Add product status filter for products table count
    if (tableName === 'products') {
      countQuery += ` WHERE status = $1`;
      countParams.push('active');
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = useSupabase ? parseInt(countResult[0].total) : countResult[0].total;
    console.log(`Total ${tableName === 'products' ? 'active ' : ''}records found: ${total}`);

    // Setup for joins and additional fields
    let joinClauses = [];
    let joinFields = [];
    let groupByFields = [];

    // Special handling for specific tables
    if (tableName === 'products') {
      // Join with categories and calculate stock from license tables
      joinClauses.push(`LEFT JOIN ${schemaPrefix}categories c ON t.category_id = c.id`);
      joinClauses.push(`LEFT JOIN (SELECT plb.product_id, COUNT(*) as total_licenses, COUNT(CASE WHEN plb.status = 'available' THEN 1 END) as available_stock FROM ${schemaPrefix}product_license_base plb INNER JOIN ${schemaPrefix}products p ON plb.product_id = p.id WHERE p.status = 'active' GROUP BY plb.product_id) plb ON t.id = plb.product_id`);
      joinFields.push('c.name AS categoryName');
      joinFields.push('COALESCE(plb.available_stock, 0) as stock');
      joinFields.push('COALESCE(plb.total_licenses, 0) as total_licenses');
    } else if (tableName === 'product_licenses') {
      // Join with products
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push('p.name AS product_name');
      joinFields.push('p.version AS product_version');
    } else if (tableName === 'transactions') {
      // Transactions doesn't have user_id, we use email from transactions table
      // Add product info if needed
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push('p.name AS product_name');
      joinFields.push('p.version AS product_version');
    }

    // Get records with pagination, search, and sorting
    const page = parseInt(getQuery(event).page) || 1;
    const pageSize = parseInt(getQuery(event).pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const search = getQuery(event).search || '';
    const orderBy = getQuery(event).orderBy || 'id';
    const orderDir = getQuery(event).orderDir || 'desc';
    
    // Get column info for search (database-specific)
    let columns;
    if (useSupabase) {
      // PostgreSQL: Get column info from information_schema
      [columns] = await db.query(`
        SELECT column_name as "Field", data_type as "Type", 
               is_nullable as "Null", column_default as "Default",
               '' as "Key", '' as "Extra"
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'nixty'
        ORDER BY ordinal_position
      `, [tableName]);
    } else {
      // MySQL: Use DESCRIBE
      [columns] = await db.query(`DESCRIBE ${tableName}`);
    }
    
    const searchableColumns = columns.map(col => col.Field);
    console.log('Searchable columns:', searchableColumns);
    
    // Build search conditions
    let searchConditions = 'WHERE 1=1';
    const searchParams = [];
    
    // Add product status filter for products table
    if (tableName === 'products') {
      searchConditions += ` AND t.status = $${searchParams.length + 1}`;
      searchParams.push('active');
    }
    
    if (search) {
      const searchTerms = search.split(' ').filter(term => term);
      if (searchTerms.length > 0) {
        const searchQueries = [];
        
        searchTerms.forEach(term => {
          const columnConditions = searchableColumns.map(col => {
            const paramIndex = searchParams.length + 1;
            searchParams.push(`%${term}%`);
            return `${col} LIKE $${paramIndex}`;
          });
          searchQueries.push(`(${columnConditions.join(' OR ')})`);
        });
        
        searchConditions += ` AND (${searchQueries.join(' AND ')})`;
      }
    }
    
    // Add filters if provided
    const filterParams = getQuery(event).filters ? JSON.parse(getQuery(event).filters) : {};
    
    Object.keys(filterParams).forEach(key => {
      const value = filterParams[key];
      if (value !== undefined && value !== '') {
        searchConditions += ` AND t.${key} = $${searchParams.length + 1}`;
        searchParams.push(value);
      }
    });
    
    // Build query with join information
    const selectedFields = ['t.*', ...joinFields];
    let query = `SELECT ${selectedFields.join(', ')} FROM ${schemaPrefix}${tableName} t ${joinClauses.join(' ')} ${searchConditions}`;
    
    // Add grouping if needed
    if (groupByFields.length > 0) {
      // For PostgreSQL, we need to include all non-aggregate columns in GROUP BY
      // Get all column names from the main table
      const mainTableColumns = columns.map(col => `t.${col.Field}`).join(', ');
      query += ` GROUP BY ${mainTableColumns}, ${groupByFields.join(', ')}`;
    }

    // Add sorting and pagination
    query += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${pageSize} OFFSET ${offset}`;
    
    console.log('SQL Query:', query);
    console.log('SQL Params:', searchParams);
    
    // Execute the query
    const [records] = await db.query(query, searchParams);
    
    console.log(`Retrieved ${records.length} records`);
    
    // Map column information for frontend
    const columnInfo = columns.map(col => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === 'YES',
      key: col.Key,
      default: col.Default,
      extra: col.Extra
    }));

    // If table is products, fetch categories for the dropdown
    let categories = [];
    if (tableName === 'products') {
      const [categoryRows] = await db.query(`SELECT id, name, slug FROM ${schemaPrefix}categories ORDER BY name ASC`);
      categories = categoryRows;
    }

    // Log untuk debugging
    console.log('Column info:', JSON.stringify(columnInfo));
    console.log('First record sample:', records.length > 0 ? JSON.stringify(records[0]) : 'No records');

    const response = {
      success: true,
      data: records,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        columns: columnInfo,
        relations: {
          categories: categories
        }
      }
    };
    
    console.log('Response structure:', JSON.stringify({
      success: response.success,
      dataLength: response.data.length,
      meta: {
        total: response.meta.total,
        page: response.meta.page,
        pageSize: response.meta.pageSize,
        pageCount: response.meta.pageCount,
        columnsCount: response.meta.columns.length
      }
    }));
    
    return response;

  } catch (error) {
    console.error('Error fetching table data:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch table data'
    });
  }
});
