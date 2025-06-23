import pool from '../../../utils/db';
import { validateTableName, validatePaginationParams } from '../../../utils/admin-validation';

/**
 * GET /api/admin/tables/[table]
 * Fetch records from a specific table with pagination, search, and filtering
 */
export default defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, 'table');
    const query = getQuery(event);

    // Validate table name
    validateTableName(tableName);

    // Validate and sanitize query parameters
    const { page, limit, offset, search, sortBy, sortOrder } = validatePaginationParams(query);

    // Get table structure first
    const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
    const columnNames = columns.map(col => col.Field);

    // Validate sortBy column
    if (!columnNames.includes(sortBy)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid sort column'
      });
    }

    // Build search conditions
    let searchConditions = '';
    let searchParams = [];
    
    if (search) {
      // Search in text columns only
      const textColumns = columns
        .filter(col => ['varchar', 'text', 'char'].some(type => col.Type.toLowerCase().includes(type)))
        .map(col => col.Field);
      
      if (textColumns.length > 0) {
        searchConditions = ' WHERE ' + textColumns.map(col => `${col} LIKE ?`).join(' OR ');
        searchParams = textColumns.map(() => `%${search}%`);
      }
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM ${tableName}${searchConditions}`,
      searchParams
    );
    const total = countResult[0].total;

    // Get records
    const [records] = await pool.execute(
      `SELECT * FROM ${tableName}${searchConditions} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      [...searchParams, limit, offset]
    );

    return {
      success: true,
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default,
          extra: col.Extra
        }))
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error fetching table data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch table data'
    });
  }
});
