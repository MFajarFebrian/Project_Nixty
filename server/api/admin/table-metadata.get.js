import pool from '../../utils/db.js';
import { requireAdmin } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event);
    
    const query = getQuery(event);
    const tableName = query.table;
    
    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Table name is required'
      });
    }
    
    // Get column information with proper ordering from database schema
    const [columns] = await pool.execute(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as \`default\`,
        EXTRA as extra,
        COLUMN_TYPE as full_type,
        ORDINAL_POSITION as position,
        COLUMN_COMMENT as comment,
        CHARACTER_MAXIMUM_LENGTH as max_length
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION ASC
    `, [process.env.DB_NAME || 'nixty', tableName]);
    
    // Process columns to add frontend-specific metadata
    const processedColumns = columns.map(column => ({
      name: column.name,
      type: column.full_type || column.type,
      nullable: column.nullable === 'YES',
      default: column.default,
      extra: column.extra || '',
      position: column.position,
      comment: column.comment || '',
      maxLength: column.max_length,
      // Add display metadata
      displayName: formatColumnName(column.name),
      isHidden: shouldHideColumn(column.name),
      isReadonly: isReadonlyColumn(column.name),
      inputType: getInputType(column),
      validation: getValidationRules(column)
    }));
    
    // Get visible columns (exclude hidden system columns)
    const visibleColumns = processedColumns.filter(col => !col.isHidden);
    
    // Get table info
    const [tableInfo] = await pool.execute(`
      SELECT 
        TABLE_COMMENT as comment,
        ENGINE as engine,
        TABLE_ROWS as row_count,
        CREATE_TIME as created_at
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.DB_NAME || 'nixty', tableName]);
    
    console.log(`Table metadata fetched for ${tableName}: ${visibleColumns.length} visible columns`);
    
    return {
      success: true,
      table: {
        name: tableName,
        displayName: getTableDisplayName(tableName),
        comment: tableInfo[0]?.comment || '',
        engine: tableInfo[0]?.engine || '',
        rowCount: tableInfo[0]?.row_count || 0,
        createdAt: tableInfo[0]?.created_at || null
      },
      columns: processedColumns,
      visibleColumns: visibleColumns,
      totalColumns: processedColumns.length
    };
    
  } catch (error) {
    console.error('Error fetching table metadata:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw authentication errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch table metadata'
    });
  }
});

// Helper functions
function formatColumnName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function shouldHideColumn(columnName) {
  const hiddenColumns = [
    'created_at', 'updated_at' // Hide system timestamps in edit forms
  ];
  return hiddenColumns.includes(columnName);
}

function isReadonlyColumn(columnName) {
  const readonlyColumns = [
    'id', 'created_at', 'updated_at'
  ];
  return readonlyColumns.includes(columnName);
}

function getInputType(column) {
  const { name, type } = column;
  
  // Email field
  if (name === 'email') return 'email';
  
  // Password field
  if (name === 'password') return 'password';
  
  // URL fields
  if (name.includes('url') || name.includes('link')) return 'url';
  
  // Number fields
  if (type.includes('int') || type.includes('decimal') || type.includes('float')) {
    return 'number';
  }
  
  // Date fields
  if (type.includes('date') || type.includes('timestamp')) {
    return 'datetime-local';
  }
  
  // Boolean fields
  if (type.includes('tinyint(1)') || name.startsWith('is_')) {
    return 'checkbox';
  }
  
  // Text areas
  if (type.includes('text') || ['description', 'content', 'notes'].includes(name)) {
    return 'textarea';
  }
  
  // Select fields
  if (type.includes('enum') || 
      ['status', 'account_type', 'license_type', 'payment_method'].includes(name) ||
      name.endsWith('_id')) {
    return 'select';
  }
  
  // Image upload fields
  if (name.includes('image') || name.includes('picture') || name.includes('photo')) {
    return 'file';
  }
  
  // Default to text
  return 'text';
}

function getValidationRules(column) {
  const rules = {};
  
  // Required validation
  if (column.nullable === false && !column.default && !column.extra.includes('auto_increment')) {
    rules.required = true;
  }
  
  // Length validation
  if (column.maxLength) {
    rules.maxLength = column.maxLength;
  }
  
  // Type-specific validation
  if (column.type.includes('int')) {
    rules.type = 'integer';
  } else if (column.type.includes('decimal') || column.type.includes('float')) {
    rules.type = 'number';
  } else if (column.name === 'email') {
    rules.type = 'email';
  }
  
  return rules;
}

function getTableDisplayName(tableName) {
  const displayNames = {
    'users': 'Users',
    'products': 'Products',
    'categories': 'Categories',
    'transactions': 'Transactions',
    'product_licenses': 'Product Licenses',
    'announcements': 'Announcements',
    'deals': 'Deals',
    'hero_slides': 'Hero Slides'
  };
  
  return displayNames[tableName] || tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}
