import db from '../../utils/db.js';

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
        p.currency, p.discount_price, p.image_url, p.is_featured, p.is_trending, 
        p.tags, p.is_multi_license, p.is_subscription, p.is_digital_download, p.status,
        p.created_at, p.updated_at,
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

    const [products] = await db.query(productQuery, params);

    if (products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      });
    }

    const product = products[0];
    
    // Calculate discount percentage if discount_price exists
    if (product.discount_price && product.price) {
      const originalPrice = parseFloat(product.price);
      const discountPrice = parseFloat(product.discount_price);
      if (discountPrice > 0 && originalPrice > 0) {
        product.discount_percentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
      } else {
        product.discount_percentage = 0;
      }
    } else {
      product.discount_percentage = 0;
    }
    
    // Check if product is new (created in the last 30 days)
    if (product.created_at) {
      const productDate = new Date(product.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      product.is_new = productDate > thirtyDaysAgo;
    } else {
      product.is_new = false;
    }
    
    // Add period logic for main product
    let period = null;
    if (product.is_subscription) {
      // For subscription products, determine period based on version or name
      if (product.name.toLowerCase().includes('monthly') || (product.version && product.version.toLowerCase().includes('monthly'))) {
        period = '/month';
      } else if (product.name.toLowerCase().includes('annual') || product.name.toLowerCase().includes('yearly') || (product.version && (product.version.toLowerCase().includes('annual') || product.version.toLowerCase().includes('yearly')))) {
        period = '/year';
      } else {
        period = '/year'; // Default for subscriptions
      }
    }
    product.period = period;

    // Fetch all versions of this product family
    const [versions] = await db.query(
      `SELECT id, name, version, price, discount_price, image_url, is_subscription FROM products WHERE name = ? ORDER BY version DESC`,
      [product.name]
    );
    
    // Calculate discount percentage and add period logic for all versions
    const processedVersions = versions.map(version => {
      const originalPrice = parseFloat(version.price) || 0;
      const discountPrice = parseFloat(version.discount_price) || 0;
      let discountPercentage = 0;
      
      if (discountPrice > 0 && originalPrice > 0) {
        discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
      }
      
      // Add period logic based on subscription status
      let period = null;
      if (version.is_subscription) {
        // For subscription products, determine period based on version or name
        if (version.name.toLowerCase().includes('monthly') || version.version.toLowerCase().includes('monthly')) {
          period = '/month';
        } else if (version.name.toLowerCase().includes('annual') || version.name.toLowerCase().includes('yearly') || version.version.toLowerCase().includes('annual') || version.version.toLowerCase().includes('yearly')) {
          period = '/year';
        } else {
          period = '/year'; // Default for subscriptions
        }
      }
      
      return {
        ...version,
        discount_percentage: discountPercentage,
        period: period
      };
    });

    return {
      success: true,
      product: product,
      versions: processedVersions,
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch product details',
    });
  }
});
