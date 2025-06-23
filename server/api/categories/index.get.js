import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      productCount: row.product_count,
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
