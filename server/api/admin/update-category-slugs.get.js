import pool from '../../utils/db';
import adminAuth from '../../middleware/admin-auth';

/**
 * GET /api/admin/update-category-slugs
 * Memperbarui slug kategori menjadi lebih SEO-friendly
 */
export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    await adminAuth(event);

    // Ambil data kategori sebelum diubah
    const [beforeCategories] = await pool.execute(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);

    // Update kategori Office
    await pool.execute(`
      UPDATE categories
      SET slug = 'office'
      WHERE id = 1
    `);

    // Update kategori Project
    await pool.execute(`
      UPDATE categories
      SET slug = 'project'
      WHERE id = 2
    `);

    // Update kategori Visio
    await pool.execute(`
      UPDATE categories
      SET slug = 'visio'
      WHERE id = 3
    `);

    // Ambil data kategori setelah diubah
    const [afterCategories] = await pool.execute(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);

    return {
      success: true,
      message: 'Slug kategori berhasil diperbarui',
      before: beforeCategories,
      after: afterCategories
    };

  } catch (error) {
    console.error('Error updating category slugs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update category slugs'
    });
  }
}); 