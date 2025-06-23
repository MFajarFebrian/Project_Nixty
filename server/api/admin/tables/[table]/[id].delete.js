import pool from '../../../../utils/db';
import { validateTableName, validateRecordId } from '../../../../utils/admin-validation';

/**
 * Get user-friendly record type name
 */
function getRecordTypeName(tableName) {
  const typeNames = {
    'users': 'user',
    'products': 'product',
    'categories': 'category',
    'announcements': 'announcement',
    'deals': 'deal',
    'hero_slides': 'hero slide',
    'transactions': 'transaction',
    'product_licenses': 'product license'
  };
  return typeNames[tableName] || tableName.slice(0, -1); // Remove 's' from plural
}

/**
 * DELETE /api/admin/tables/[table]/[id]
 * Delete a record from the specified table
 */
export default defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, 'table');
    const recordId = getRouterParam(event, 'id');

    // Validate table name and record ID
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);

    // Check if record exists and get it before deletion
    const [existingRecord] = await pool.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );

    if (existingRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found'
      });
    }

    // Special handling for certain tables
    if (tableName === 'users') {
      // Prevent deletion of admin users if it's the last admin
      if (existingRecord[0].account_type === 'admin') {
        const [adminCount] = await pool.execute(
          'SELECT COUNT(*) as count FROM users WHERE account_type = ?',
          ['admin']
        );
        
        if (adminCount[0].count <= 1) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete the last admin user'
          });
        }
      }
    }

    // Check for foreign key constraints
    const foreignKeyChecks = {
      categories: [
        { table: 'products', column: 'category_id', name: 'products' }
      ],
      products: [
        { table: 'deals', column: 'product_id', name: 'deals' },
        { table: 'hero_slides', column: 'product_id', name: 'hero slides' },
        { table: 'product_licenses', column: 'product_id', name: 'product licenses' }
      ],
      transactions: [
        { table: 'product_licenses', column: 'used_by_transaction_id', name: 'product licenses' }
      ]
    };

    if (foreignKeyChecks[tableName]) {
      for (const check of foreignKeyChecks[tableName]) {
        const [relatedRecords] = await pool.execute(
          `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} = ?`,
          [validRecordId]
        );
        
        if (relatedRecords[0].count > 0) {
          const count = relatedRecords[0].count;
          const recordType = getRecordTypeName(tableName);
          throw createError({
            statusCode: 400,
            statusMessage: `Cannot delete this ${recordType}: it is currently being used by ${count} ${check.name}. Please remove or reassign the related ${check.name} first.`
          });
        }
      }
    }

    // Delete the record
    const [result] = await pool.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );

    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found or already deleted'
      });
    }

    return {
      success: true,
      message: 'Record deleted successfully',
      data: {
        deletedRecord: existingRecord[0],
        affectedRows: result.affectedRows
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error deleting record:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete record'
    });
  }
});
