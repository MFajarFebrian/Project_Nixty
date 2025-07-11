import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const { slug } = event.context.params;
    if (!slug) {
      return { versions: [], related: [], error: 'Missing product slug' };
    }

    // Ambil semua versi produk dengan slug yang sama (family)
    const sql = `
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'active'
      ORDER BY p.is_new DESC, p.version DESC
    `;
    const [rows] = await pool.execute(sql, [slug]);

    if (!rows || rows.length === 0) {
      return { versions: [], related: [], error: 'Product not found' };
    }

    // Format versi produk
    const versions = rows.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      description: row.description,
      short_description: row.short_description,
      price: row.price,
      currency: row.currency,
      period: row.period,
      rating: row.rating,
      image_url: row.image_url,
      category: row.category_slug,
      categoryName: row.category_name,
      is_new: Boolean(row.is_new),
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

    // Ambil produk terkait (misal: kategori sama, beda slug)
    const relatedSql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ? AND p.slug != ? AND p.status = 'active'
      ORDER BY p.created_at DESC LIMIT 4
    `;
    const [relatedRows] = await pool.execute(relatedSql, [rows[0].category_slug, slug]);
    const related = relatedRows.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      short_description: row.short_description,
      price: row.price,
      image_url: row.image_url,
      category: row.category_slug,
      is_new: Boolean(row.is_new)
    }));

    return { versions, related };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return { versions: [], related: [], error: 'Internal server error' };
  }
});