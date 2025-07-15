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
      ORDER BY p.version DESC
    `;
    const [rows] = await pool.execute(sql, [slug]);

    if (!rows || rows.length === 0) {
      return { versions: [], related: [], error: 'Product not found' };
    }

    // Format versi produk
    const versions = rows.map(row => {
      // Calculate discount percentage if discount_price exists
      let discountPercentage = 0;
      if (row.discount_price && row.price) {
        const originalPrice = parseFloat(row.price);
        const discountPrice = parseFloat(row.discount_price);
        if (discountPrice > 0 && originalPrice > 0) {
          discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
        }
      }
      
      // Check if product is new (created in the last 30 days)
      let isNew = false;
      if (row.created_at) {
        const productDate = new Date(row.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        isNew = productDate > thirtyDaysAgo;
      }
      
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        description: row.description,
        short_description: row.short_description,
        price: row.price,
        discount_price: row.discount_price,
        discount_percentage: discountPercentage,
        currency: row.currency,
        image_url: row.image_url,
        category: row.category_slug,
        categoryName: row.category_name,
        is_new: isNew,
        is_featured: Boolean(row.is_featured),
        is_trending: Boolean(row.is_trending),
        is_multi_license: Boolean(row.is_multi_license),
        is_subscription: Boolean(row.is_subscription),
        is_digital_download: Boolean(row.is_digital_download),
        tags: row.tags,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });

    // Ambil produk terkait (misal: kategori sama, beda slug)
    const relatedSql = `
      SELECT 
        p.id, p.name, p.version, p.short_description, p.price, p.discount_price,
        p.image_url, p.is_featured, p.is_trending, p.created_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ? AND p.slug != ? AND p.status = 'active'
      ORDER BY p.created_at DESC LIMIT 4
    `;
    const [relatedRows] = await pool.execute(relatedSql, [rows[0].category_slug, slug]);
    
    const related = relatedRows.map(row => {
      // Calculate discount percentage if discount_price exists
      let discountPercentage = 0;
      if (row.discount_price && row.price) {
        const originalPrice = parseFloat(row.price);
        const discountPrice = parseFloat(row.discount_price);
        if (discountPrice > 0 && originalPrice > 0) {
          discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
        }
      }
      
      // Check if product is new (created in the last 30 days)
      let isNew = false;
      if (row.created_at) {
        const productDate = new Date(row.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        isNew = productDate > thirtyDaysAgo;
      }
      
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        short_description: row.short_description,
        price: row.price,
        discount_price: row.discount_price,
        discount_percentage: discountPercentage,
        image_url: row.image_url,
        category: row.category_slug,
        category_name: row.category_name,
        is_new: isNew,
        is_featured: Boolean(row.is_featured),
        is_trending: Boolean(row.is_trending)
      };
    });

    return { versions, related };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return { versions: [], related: [], error: 'Internal server error' };
  }
});