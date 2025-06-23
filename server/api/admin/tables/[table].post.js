import pool from '../../../utils/db';
import bcrypt from 'bcryptjs';
import { validateTableName, validateRecordData } from '../../../utils/admin-validation';

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
        const [existingUser] = await pool.execute(
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

    // Convert boolean fields for database
    const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
    const columnInfo = columns.reduce((acc, col) => {
      acc[col.Field] = col;
      return acc;
    }, {});

    // Convert boolean values to tinyint for database
    Object.keys(validData).forEach(key => {
      const column = columnInfo[key];
      if (column && column.Type.includes('tinyint(1)') && typeof validData[key] === 'boolean') {
        validData[key] = validData[key] ? 1 : 0;
      }
    });

    if (Object.keys(validData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid data provided'
      });
    }

    // Build INSERT query
    const fields = Object.keys(validData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(validData);

    const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    const [result] = await pool.execute(query, values);

    // Fetch the created record
    const [newRecord] = await pool.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [result.insertId]
    );

    return {
      success: true,
      message: 'Record created successfully',
      data: newRecord[0]
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
