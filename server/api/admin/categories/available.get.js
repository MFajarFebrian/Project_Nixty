import db from '../../../utils/db.js';

/**
 * GET /api/admin/categories/available
 * Get available categories for mass add and other admin operations
 */
export default defineEventHandler(async (event) => {
  try {
    // Simple query to get all categories
    const [rows] = await db.execute('SELECT id, name, slug FROM categories ORDER BY name ASC');
    
    return {
      success: true,
      categories: rows
    };
    
  } catch (error) {
    console.error('Error fetching available categories:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch available categories'
    });
  }
});
