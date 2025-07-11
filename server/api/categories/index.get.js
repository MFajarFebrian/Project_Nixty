import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await pool.execute(`
      WITH LatestProduct AS (
        SELECT
          p.category_id,
          p.slug,
          p.version,
          ROW_NUMBER() OVER(PARTITION BY p.category_id ORDER BY p.created_at DESC, p.id DESC) as rn
        FROM
          products p
        WHERE
          p.status = 'active'
      )
      SELECT 
        c.*,
        COUNT(p.id) as product_count,
        lp.slug as main_product_slug,
        lp.version as latest_version
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      LEFT JOIN LatestProduct lp ON c.id = lp.category_id AND lp.rn = 1
      GROUP BY c.id, lp.slug, lp.version
      ORDER BY c.name ASC
    `);

    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      productCount: parseInt(row.product_count, 10),
      mainProductSlug: row.main_product_slug,
      latestVersion: row.latest_version,
      createdAt: row.created_at
    }));

    return {
      success: true,
      data: categories
    };

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching categories',
      data: []
    };
  }
});
