import db from '../../../../utils/db';
import bcrypt from 'bcryptjs';
import { validateTableName, validateRecordId, validateRecordData } from '../../../../utils/admin-validation';
import { useSupabase } from '../../../../utils/config.js';

/**
 * PUT /api/admin/tables/[table]/[id]
 * Update an existing record in the specified table
 */
export default defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, 'table');
    const recordId = getRouterParam(event, 'id');
    const body = await readBody(event);

    // Validate table name and record ID
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);

    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      });
    }

    // Validate and sanitize input data
    let validData;
    try {
      console.log('Update request body:', JSON.stringify(body, null, 2));
      validData = validateRecordData(tableName, body, true);
      console.log('Validated data:', JSON.stringify(validData, null, 2));
    } catch (error) {
      console.error('Validation error details:', error.validationErrors || error.message);
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation errors',
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }

    // Check if record exists
    const [existingRecord] = await db.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );

    if (existingRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found'
      });
    }

    // Special handling for users table
    if (tableName === 'users') {
      // Check email uniqueness (if email is being updated)
      if (validData.email) {
        const [existingUser] = await db.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [validData.email, validRecordId]
        );

        if (existingUser.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'A user with this email already exists'
          });
        }
      }

      // Hash password (if password is being updated)
      if (validData.password) {
        validData.password = await bcrypt.hash(validData.password, 10);
      }
    }

    // Get column information for boolean conversion (only for MySQL)
    if (!useSupabase) {
      const [columns] = await db.execute(`DESCRIBE ${tableName}`);
      const columnInfo = columns.reduce((acc, col) => {
        acc[col.Field] = col;
        return acc;
      }, {});
      
      // Convert boolean values for MySQL (tinyint)
      Object.keys(validData).forEach(key => {
        const column = columnInfo[key];
        if (column && typeof validData[key] === 'boolean' && column.Type.includes('tinyint(1)')) {
          validData[key] = validData[key] ? 1 : 0;
        }
      });
    }
    // Note: For PostgreSQL/Supabase, boolean values are handled natively

    if (Object.keys(validData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid data provided'
      });
    }

    // Use optimized db.update method (handles both MySQL and PostgreSQL)
    // Note: db.update expects (tableName, data, id) in that order
    const updatedRecord = await db.update(tableName, validData, recordId);
    
    return {
      success: true,
      data: updatedRecord
    };
  } catch (error) {
    console.error('Error updating record:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update record'
    });
  }
});
