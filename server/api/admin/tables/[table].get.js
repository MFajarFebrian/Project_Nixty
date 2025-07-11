import pool from '../../../utils/db';

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

    // Check for allowed tables
    const allowedTables = [
      'users', 'products', 'categories', 'transactions', 
      'product_licenses', 'announcements', 'deals', 'hero_slides'
    ];
    
    if (!allowedTables.includes(tableName)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access to table '${tableName}' is not allowed`
      });
    }
    
    // Count total records
    const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
    const total = countResult[0].total;
    console.log(`Total records found: ${total}`);

    // Setup for joins and additional fields
    let joinClauses = [];
    let joinFields = [];
    let groupByFields = [];

    // Special handling for specific tables
    if (tableName === 'products') {
      // Join with categories
      joinClauses.push('LEFT JOIN categories c ON t.category_id = c.id');
      joinFields.push('c.name AS categoryName');

      // Join with product_stock_view untuk mendapatkan data stok
      joinClauses.push('LEFT JOIN product_stock_view psv ON t.id = psv.product_id');
      joinFields.push('psv.available_stock');
      joinFields.push('psv.used_licenses');
      joinFields.push('psv.expired_licenses');
      joinFields.push('psv.reserved_licenses');
      joinFields.push('psv.total_licenses');
      
      // Group by untuk menghindari duplikasi
      groupByFields = ['t.id'];
    } else if (tableName === 'product_licenses') {
      // Join with products
      joinClauses.push('LEFT JOIN products p ON t.product_id = p.id');
      joinFields.push('p.name AS product_name');
      joinFields.push('p.version AS product_version');
    } else if (tableName === 'transactions') {
      // Transactions tidak memiliki user_id, sehingga tidak perlu join dengan users
      // Kita bisa menggunakan email yang sudah ada di tabel transactions
    }

    // Get records with pagination, search, and sorting
    const page = parseInt(getQuery(event).page) || 1;
    const pageSize = parseInt(getQuery(event).pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const search = getQuery(event).search || '';
    const orderBy = getQuery(event).orderBy || 'id';
    const orderDir = getQuery(event).orderDir || 'desc';
    
    // Get column info for search
    const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
    const searchableColumns = columns.map(col => col.Field);
    console.log('Searchable columns:', searchableColumns);
    
    // Build search conditions
    let searchConditions = '';
    const searchParams = [];
    
    if (search) {
      const searchTerms = search.split(' ').filter(term => term);
      if (searchTerms.length > 0) {
        const searchQueries = [];
        
        searchTerms.forEach(term => {
          const columnConditions = searchableColumns.map(col => `${col} LIKE ?`);
          searchQueries.push(`(${columnConditions.join(' OR ')})`);
          
          searchableColumns.forEach(() => {
            searchParams.push(`%${term}%`);
          });
        });
        
        searchConditions = `WHERE (${searchQueries.join(' AND ')})`;
      }
    } else {
      searchConditions = 'WHERE 1=1';
    }
    
    // Add filters if provided
    const filterParams = getQuery(event).filters ? JSON.parse(getQuery(event).filters) : {};
    
    Object.keys(filterParams).forEach(key => {
      const value = filterParams[key];
      if (value !== undefined && value !== '') {
        searchConditions += ` AND t.${key} = ?`;
        searchParams.push(value);
      }
    });
    
    // Build query with join information
    const selectedFields = ['t.*', ...joinFields];
    let query = `SELECT ${selectedFields.join(', ')} FROM ${tableName} t ${joinClauses.join(' ')} ${searchConditions}`;
    
    // Add grouping if needed
    if (groupByFields.length > 0) {
      query += ` GROUP BY ${groupByFields.join(', ')}`;
    }

    // Add sorting and pagination
    query += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${pageSize} OFFSET ${offset}`;
    
    console.log('SQL Query:', query);
    console.log('SQL Params:', searchParams);
    
    // Execute the query
    const [records] = await pool.execute(query, searchParams);
    
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
      const [categoryRows] = await pool.execute('SELECT id, name, slug FROM categories ORDER BY name ASC');
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
