import pool from '../../utils/db';
import { validateRecordData } from '../../utils/admin-validation';

/**
 * POST /api/admin/product-licenses
 * Create a new product license with automatic additional_info population
 */
export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    const body = await readBody(event);
    console.log('Product license creation request:', body);

    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      });
    }

    // Validate basic data
    let validData;
    try {
      validData = validateRecordData('product_licenses', body, false);
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

    // Validate that product_name and product_version are provided
    if (!validData.product_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'product_name is required'
      });
    }

    // Verify that the product_name and product_version combination exists
    const whereClause = validData.product_version
      ? 'name = ? AND version = ?'
      : 'name = ? AND (version IS NULL OR version = "")';

    const params = validData.product_version
      ? [validData.product_name, validData.product_version]
      : [validData.product_name];

    const [productRows] = await pool.execute(
      `SELECT id, name, version FROM products WHERE ${whereClause} AND status = 'active' LIMIT 1`,
      params
    );

    if (productRows.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product name/version combination: Product not found or inactive'
      });
    }

    const product = productRows[0];

    // Update product_id to match the selected name/version if different
    validData.product_id = product.id;

    // Set max_usage based on license_type
    const maxUsageByType = {
      'product_key': 5,
      'email_password': 1,
      'access_code': 1,
      'download_link': 999
    };

    validData.max_usage = maxUsageByType[validData.license_type] || 1;
    validData.usage_count = 0; // New licenses start with 0 usage

    // Set default status
    if (!validData.status) {
      validData.status = 'available';
    }

    console.log('Processed license data:', validData);

    // Build INSERT query
    const fields = Object.keys(validData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(validData);

    const query = `INSERT INTO product_licenses (${fields.join(', ')}) VALUES (${placeholders})`;
    console.log('SQL Query:', query);
    console.log('SQL Values:', values);
    
    const [result] = await pool.execute(query, values);

    // Fetch the created record with product information
    const [newRecord] = await pool.execute(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version,
        (pl.max_usage - pl.usage_count) as remaining_uses
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [result.insertId]);

    return {
      success: true,
      message: 'Product license created successfully',
      data: newRecord[0]
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error creating product license:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create product license'
    });
  }
});
