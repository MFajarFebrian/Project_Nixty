import db from '../../utils/db.js';
import adminAuth from '../../middleware/admin-auth';
import { generateProductSlug } from '../../utils/admin-validation';

/**
 * GET /api/admin/fix-product-slugs
 * Generates proper slugs for all products based on their names
 */
export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    await adminAuth(event);

    // Get products before changes
    const [beforeProducts] = await db.query(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);

    // Update each product's slug based on its name
    const updatePromises = beforeProducts.map(async (product) => {
      const newSlug = generateProductSlug(product.name);
      await db.query(
        'UPDATE products SET slug = ? WHERE id = ?',
        [newSlug, product.id]
      );
    });

    await Promise.all(updatePromises);

    // Get products after changes
    const [afterProducts] = await db.query(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);

    return {
      success: true,
      message: 'Product slugs have been updated successfully',
      before: beforeProducts,
      after: afterProducts
    };

  } catch (error) {
    console.error('Error fixing product slugs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fix product slugs'
    });
  }
}); 