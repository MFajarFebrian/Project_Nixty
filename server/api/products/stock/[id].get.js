import pool from '../../../utils/db';

/**
 * GET /api/products/stock/:id
 * Get available stock for a product
 */
export default defineEventHandler(async (event) => {
  try {
    const productId = event.context.params?.id;
    
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      });
    }
    
    // Query to get the available stock for a product from the product_license_base table
    const [result] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_stock,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?
    `, [productId]);
    
    if (!result || result.length === 0) {
      return {
        success: true,
        data: {
          product_id: productId,
          total_stock: 0,
          available_stock: 0
        }
      };
    }
    
    return {
      success: true,
      data: {
        product_id: productId,
        total_stock: result[0].total_stock || 0,
        available_stock: result[0].available_stock || 0
      }
    };
    
  } catch (error) {
    console.error('Error fetching product stock:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch product stock'
    });
  }
});
