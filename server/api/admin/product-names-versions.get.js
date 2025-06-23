import pool from '../../utils/db';

/**
 * GET /api/admin/product-names-versions
 * Get unique product names and versions for dropdowns
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

    const query = getQuery(event);
    const { type } = query;

    if (type === 'names') {
      // Get unique product names
      const [names] = await pool.execute(`
        SELECT DISTINCT name as value, name as label
        FROM products 
        WHERE status = 'active' AND name IS NOT NULL AND name != ''
        ORDER BY name
      `);
      
      return {
        success: true,
        data: names
      };
      
    } else if (type === 'versions') {
      const { product_name } = query;
      
      if (!product_name) {
        return {
          success: true,
          data: []
        };
      }
      
      // Get versions for specific product name
      const [versions] = await pool.execute(`
        SELECT DISTINCT 
          version as value, 
          CASE 
            WHEN version IS NULL OR version = '' THEN 'No Version'
            ELSE version 
          END as label
        FROM products 
        WHERE status = 'active' AND name = ?
        ORDER BY version
      `, [product_name]);
      
      return {
        success: true,
        data: versions
      };
      
    } else {
      // Get all unique name/version combinations
      const [combinations] = await pool.execute(`
        SELECT DISTINCT 
          name as product_name,
          version as product_version,
          CONCAT(
            name, 
            CASE 
              WHEN version IS NOT NULL AND version != '' 
              THEN CONCAT(' (', version, ')') 
              ELSE '' 
            END
          ) as display_name,
          id as product_id
        FROM products 
        WHERE status = 'active'
        ORDER BY name, version
      `);
      
      return {
        success: true,
        data: {
          combinations,
          names: [...new Set(combinations.map(c => c.product_name))].map(name => ({
            value: name,
            label: name
          })),
          versions: [...new Set(combinations.map(c => c.product_version).filter(v => v))].map(version => ({
            value: version,
            label: version
          }))
        }
      };
    }

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error fetching product names/versions:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product names/versions'
    });
  }
});
