import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { 
      category, 
      featured, 
      trending, 
      new: isNew, 
      limit = 50, 
      offset = 0,
      status = 'active'
    } = query;

    let sql = `
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = ?
    `;
    
    const params = [status];

    // Add filters
    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND p.is_featured = 1';
    }

    if (trending === 'true') {
      sql += ' AND p.is_trending = 1';
    }

    if (isNew === 'true') {
      sql += ' AND p.is_new = 1';
    }

    // Add ordering and pagination
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(sql, params);

    // Transform data to match frontend expectations
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      description: row.description,
      shortDescription: row.short_description,
      price: row.price,
      currency: row.currency,
      period: row.period,
      rating: row.rating,
      image_url: row.image_url,
      category: row.category_slug,
      categoryName: row.category_name,
      isNew: Boolean(row.is_new),
      discount: row.discount_percentage || null,
      timeLeft: row.time_left,
      isFeatured: Boolean(row.is_featured),
      isTrending: Boolean(row.is_trending),
      soldCount: row.sold_count,
      viewCount: row.view_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return {
      success: true,
      data: products,
      total: products.length,
      filters: {
        category,
        featured,
        trending,
        isNew,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };

  } catch (error) {
    console.error('Error fetching products:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching products',
      data: []
    };
  }
});
