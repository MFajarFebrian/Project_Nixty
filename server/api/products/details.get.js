import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log('API received query:', query);
    const productId = query.productId;
    const slug = query.slug;

    console.log('Extracted productId:', productId, 'Extracted slug:', slug);

    if (!productId && !slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID or slug is required',
      });
    }

    let productQuery = `
      SELECT 
        p.id, p.name, p.version, p.slug, p.description, p.short_description, p.price,
        p.currency, p.period, p.image_url, p.is_new, p.discount_percentage, p.time_left,
        p.is_featured, p.is_trending, p.sold_count, p.view_count, p.status,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    let params = [];

    if (productId) {
      productQuery += ` WHERE p.id = ?`;
      params.push(productId);
    } else if (slug) {
      productQuery += ` WHERE p.slug = ?`;
      params.push(slug);
    }

    console.log('Executing product query:', productQuery);
    console.log('With parameters:', params);

    const [products] = await pool.execute(productQuery, params);

    if (products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      });
    }

    const product = products[0];

    // Fetch all versions of this product family
    const [versions] = await pool.execute(
      `SELECT id, name, version, price, image_url, is_new FROM products WHERE name = ? ORDER BY version DESC`,
      [product.name]
    );

    return {
      success: true,
      product: product,
      versions: versions,
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch product details',
    });
  }
});
