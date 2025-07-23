import db from '../../../../utils/db.js';
import { validateTableName, validateRecordId } from '../../../../utils/admin-validation';
import { useSupabase } from '../../../../utils/config.js';

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
    const [existingRecord] = await db.query(
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
        const schemaPrefix = useSupabase ? 'nixty.' : '';
        const [adminCount] = await db.query(
          `SELECT COUNT(*) as count FROM ${schemaPrefix}users WHERE account_type = ?`,
          ['admin']
        );
        
        const countValue = useSupabase ? parseInt(adminCount[0].count) : adminCount[0].count;
        if (countValue <= 1) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete the last admin user'
          });
        }
      }
    }

    // Special handling for product deletion: delete related licenses first
    if (tableName === 'products') {
      try {
        const [deleteLicensesResult] = await db.query(
          'DELETE FROM product_licenses WHERE product_id = ?',
          [validRecordId]
        );
        
        const deletedLicensesCount = useSupabase ? deleteLicensesResult.rowCount : deleteLicensesResult.affectedRows;
        console.log(`Deleted ${deletedLicensesCount} related product licenses.`);

      } catch (licenseError) {
        console.error('Error deleting related product licenses:', licenseError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete related product licenses. Please check for dependencies on transactions.',
        });
      }
    }

    // Delete the record
    const [result] = await db.query(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );

    // Handle affectedRows for different databases
    const affectedRows = useSupabase ? result.rowCount : result.affectedRows;
    
    if (affectedRows === 0) {
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
        affectedRows: affectedRows
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
