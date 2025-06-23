import pool from '../../../../utils/db';
import bcrypt from 'bcryptjs';
import { validateTableName, validateRecordId, validateRecordData } from '../../../../utils/admin-validation';

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

    // Special handling for users table
    if (tableName === 'users') {
      // Check email uniqueness (if email is being updated)
      if (validData.email) {
        const [existingUser] = await pool.execute(
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
        statusMessage: 'No valid data provided for update'
      });
    }

    // Build UPDATE query
    const fields = Object.keys(validData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(validData), validRecordId];

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

    console.log('SQL Query:', query);
    console.log('SQL Values:', values);

    await pool.execute(query, values);

    // Fetch the updated record
    const [updatedRecord] = await pool.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );

    return {
      success: true,
      message: 'Record updated successfully',
      data: updatedRecord[0]
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error updating record:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update record'
    });
  }
});
