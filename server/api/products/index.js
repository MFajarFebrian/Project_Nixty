import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const categorySlug = query.category;
    console.log('API Products: Query parameters:', query);
    
    let productsQuery;
    let queryParams = [];
    
    if (categorySlug) {
      console.log('API Products: Fetching products by category slug:', categorySlug);
      productsQuery = `
        SELECT 
          p.id, p.name, p.version, p.slug, p.price, p.image_url, p.description, p.short_description,
          c.name as category_name, c.slug as category_slug, p.is_new, p.discount_percentage, p.is_subscription,
          p.is_featured, p.is_trending
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE c.slug = ? AND p.status = 'active'
        ORDER BY p.version DESC
      `;
      queryParams.push(categorySlug);
    } else {
      console.log('API Products: Fetching all products');
      productsQuery = `
        SELECT 
          p.id, p.name, p.version, p.slug, p.price, p.image_url, p.description, p.short_description,
          c.name as category_name, c.slug as category_slug, p.is_new, p.discount_percentage, p.is_subscription,
          p.is_featured, p.is_trending
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.name, p.version DESC
      `;
    }
    
    const [products] = await db.query(productsQuery, queryParams);
    
    if (!products || products.length === 0) {
      console.log('API Products: No products found');
      return [];
    }
    
    // Format the products data
    const formattedProducts = products.map(p => {
      // Add period logic based on subscription status
      let period = null;
      if (p.is_subscription) {
        // For subscription products, determine period based on version or name
        if (p.name.toLowerCase().includes('monthly') || (p.version && p.version.toLowerCase().includes('monthly'))) {
          period = '/month';
        } else if (p.name.toLowerCase().includes('annual') || p.name.toLowerCase().includes('yearly') || (p.version && (p.version.toLowerCase().includes('annual') || p.version.toLowerCase().includes('yearly')))) {
          period = '/year';
        } else {
          period = '/year'; // Default for subscriptions
        }
      }
      
      return {
        id: p.id,
        name: p.name,
        version: p.version,
        slug: p.slug,
        price: parseFloat(p.price),
        image_url: p.image_url || '/placeholder-product.png',
        description: p.description,
        short_description: p.short_description,
        is_new: !!p.is_new,
        discount_percentage: p.discount_percentage,
        period: period,
        is_featured: !!p.is_featured,
        is_trending: !!p.is_trending,
        category: {
          name: p.category_name,
          slug: p.category_slug
        }
      };
    });
    
    console.log('API Products: Returning', formattedProducts.length, 'products');
    return formattedProducts;

  } catch (error) {
    console.error('API Products: Error fetching products:', error);
    throw createError({
      statusCode: 500,
      message: 'An internal server error occurred.'
    });
  }
}); 