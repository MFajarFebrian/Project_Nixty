import db from '~/server/utils/db'
import adminAuth from '~/server/middleware/admin-auth'

/**
 * GET /api/admin/product-names-versions
 * Get unique product names and versions for dropdowns
 */
export default defineEventHandler(async (event) => {
  // Check admin authentication
  await adminAuth(event)

  try {
    const query = getQuery(event);
    const type = query.type || 'all'; // 'names', 'versions', or 'all'
    const productName = query.product_name || '';

    console.log(`Fetching product ${type} ${productName ? 'for ' + productName : ''}`);

    let sql = '';
    let params = [];

    if (type === 'names') {
      // Get unique product names
      sql = `SELECT DISTINCT name FROM products ORDER BY name ASC`;
    } else if (type === 'versions' && productName) {
      // Get versions for a specific product name
      sql = `SELECT DISTINCT version FROM products WHERE name = ? ORDER BY version ASC`;
      params = [productName];
    } else {
      // Get all products
      sql = `SELECT id, name, version FROM products ORDER BY id ASC`;
    }

    const [results] = await db.execute(sql, params);

    let data = [];
    
    if (results && results.length > 0) {
      if (type === 'names') {
        data = results.map(r => r.name).filter(Boolean); // Filter out null/undefined/empty names
      } else if (type === 'versions') {
        data = results.map(r => r.version).filter(Boolean); // Filter out null/empty versions
      } else {
        data = results.map(p => ({
          id: p.id,
          name: p.name || '',
          version: p.version || ''
        }));
      }
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: 'Failed to fetch product list',
      message: error.message
    };
  }
})
