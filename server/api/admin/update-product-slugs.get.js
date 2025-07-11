import pool from '../../utils/db.js';
import { requireAdmin } from '../../utils/auth.js';

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event);
    
    console.log('Starting product slug update...');
    
    // Update slugs to match category slugs
    const updates = [
      { categoryId: 1, slug: 'office' },   // Microsoft Office
      { categoryId: 2, slug: 'project' },  // Microsoft Project  
      { categoryId: 3, slug: 'visio' }     // Microsoft Visio
    ];
    
    let totalUpdated = 0;
    
    for (const update of updates) {
      const [result] = await pool.execute(
        'UPDATE products SET slug = ? WHERE category_id = ?',
        [update.slug, update.categoryId]
      );
      
      totalUpdated += result.affectedRows;
      console.log(`Updated ${result.affectedRows} products with category_id ${update.categoryId} to slug '${update.slug}'`);
    }
    
    // Get updated products for verification
    const [updatedProducts] = await pool.execute(`
      SELECT p.id, p.name, p.version, p.slug, p.category_id, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.category_id, p.version
    `);
    
    console.log('Product slug update completed successfully');
    
    return {
      success: true,
      message: `Successfully updated ${totalUpdated} product slugs`,
      totalUpdated,
      updatedProducts
    };
    
  } catch (error) {
    console.error('Error updating product slugs:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw authentication errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product slugs'
    });
  }
});
