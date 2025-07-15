import db from '../../../utils/db';
import bcrypt from 'bcryptjs';
import { validateTableName, validateRecordData } from '../../../utils/admin-validation';
import { useSupabase } from '../../../utils/config.js';

/**
 * POST /api/admin/tables/[table]
 * Create a new record in the specified table
 */
export default defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, 'table');
    const body = await readBody(event);

    // Validate table name
    validateTableName(tableName);

    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      });
    }

    // Validate and sanitize input data
    let validData;
    try {
      validData = validateRecordData(tableName, body, false);
    } catch (error) {
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation errors',
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }

    // Special handling for users table
    if (tableName === 'users') {
      // Check email uniqueness
      if (validData.email) {
        const [existingUser] = await db.execute(
          'SELECT id FROM users WHERE email = ?',
          [validData.email]
        );

        if (existingUser.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'A user with this email already exists'
          });
        }
      }

      // Hash password
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

    // Use optimized db.insert method (handles both MySQL and PostgreSQL)
    const newRecord = await db.insert(tableName, validData);

    return {
      success: true,
      message: 'Record created successfully',
      data: newRecord
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error creating record:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create record'
    });
  }
});
