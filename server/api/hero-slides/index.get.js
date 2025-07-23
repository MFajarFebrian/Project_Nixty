import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        p.name as product_name,
        p.price as product_price,
        p.period as product_period,
        c.name as category_name,
        c.slug as category_slug
      FROM hero_slides h
      LEFT JOIN products p ON h.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE h.status = 'active'
      ORDER BY h.sort_order ASC, h.created_at DESC
    `);

    const heroSlides = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      rating: row.rating,
      categories: row.category_name ? [row.category_name] : [],
      isNew: Boolean(row.is_new),
      backgroundImage: row.background_image_url,
      product: row.product_id ? {
        id: row.product_id,
        name: row.product_name,
        price: row.product_price,
        period: row.product_period,
        category: row.category_slug
      } : null,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    }));

    return {
      success: true,
      data: heroSlides
    };

  } catch (error) {
    console.error('Error fetching hero slides:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching hero slides',
      data: []
    };
  }
});
