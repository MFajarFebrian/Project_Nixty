import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const productSlug = query.slug;
  const productId = query.productId;
  console.log('API Checkout: Received params:', { slug: productSlug, productId });

  if (!productSlug && !productId) {
    throw createError({
      statusCode: 400,
      message: 'Product slug or ID is required'
    });
  }

  try {
    console.log('API Checkout: Building query with params:', { productSlug, productId });
    
    // Find all products with the same category slug or specific ID
    let productsQuery, queryParams;
    
    if (productSlug) {
      productsQuery = `
        SELECT 
          p.*, 
          c.name as category_name, 
          c.slug as category_slug 
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE c.slug = $1 AND p.status = 'active'
        ORDER BY p.created_at DESC
      `;
      queryParams = [productSlug];
    } else {
      productsQuery = `
        SELECT 
          p.*, 
          c.name as category_name, 
          c.slug as category_slug 
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE p.id = $1 AND p.status = 'active'
        ORDER BY p.created_at DESC
      `;
      queryParams = [productId];
    }
    
    console.log('API Checkout: Executing query:', productsQuery);
    console.log('API Checkout: Query params:', queryParams);
    
    const [products] = await db.query(productsQuery, queryParams);
    
    if (!products || products.length === 0) {
      console.warn('API Checkout: Product not found for:', productSlug ? `slug: ${productSlug}` : `ID: ${productId}`);
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      });
    }

    // If productId is provided, make sure that version is first in the list
    if (productId) {
      const targetVersionIndex = products.findIndex(p => p.id.toString() === productId.toString());
      if (targetVersionIndex > 0) {
        const targetVersion = products.splice(targetVersionIndex, 1)[0];
        products.unshift(targetVersion);
      }
    }

    // Use the first product as the main product
    const mainProduct = products[0];
    console.log('API Checkout: Found main product:', mainProduct.name, 'ID:', mainProduct.id);

    // Create versions array from all products with the same slug
    const versions = [];
    for (let p of products) {
      // Get stock information for each product
      // Calculate available stock based on max_usage and send_license (multi-use support)
      console.log('API Checkout: Fetching stock for product ID:', p.id);
      
      const [stockInfo] = await db.query(`
        SELECT 
          COUNT(*) as total_licenses,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available_stock
        FROM nixty.product_license_base 
        WHERE product_id = $1
      `, [p.id]);
      
      // Calculate discount percentage if discount_price exists
      const originalPrice = parseFloat(p.price) || 0;
      const discountPrice = parseFloat(p.discount_price) || 0;
      let discountPercentage = 0;
      
      if (discountPrice > 0 && originalPrice > 0) {
        discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
      }
      
      versions.push({
        id: p.id.toString(),
        name: p.version ? `${p.name} ${p.version}` : p.name,
        version: p.version,
        slug: p.category_slug, // Use category slug
        description: p.description, // Add description for each version
        price: originalPrice,
        discount_price: discountPrice > 0 ? discountPrice : null,
        discount_percentage: discountPercentage,
        final_price: discountPrice > 0 ? discountPrice : originalPrice,
        image_url: p.image_url || '/placeholder-product.png',
        available_stock: parseInt(stockInfo[0]?.available_stock || 0),
        total_licenses: parseInt(stockInfo[0]?.total_licenses || 0),
        is_subscription: Boolean(p.is_subscription),
        is_multi_license: Boolean(p.is_multi_license)
      });
    }

    // Calculate discount percentage for main product
    const originalPrice = parseFloat(mainProduct.price) || 0;
    const discountPrice = parseFloat(mainProduct.discount_price) || 0;
    let discountPercentage = 0;
    
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    }

    // Format the product data in the expected format
    const product = {
      id: mainProduct.id,
      name: mainProduct.name,
      version: mainProduct.version,
      slug: mainProduct.category_slug, // Use category slug instead of product slug
      description: mainProduct.description,
      price: originalPrice,
      discount_price: discountPrice > 0 ? discountPrice : null,
      discount_percentage: discountPercentage,
      final_price: discountPrice > 0 ? discountPrice : originalPrice,
      image_url: mainProduct.image_url || '/placeholder-product.png',
      is_subscription: Boolean(mainProduct.is_subscription),
      is_multi_license: Boolean(mainProduct.is_multi_license),
      category: {
        name: mainProduct.category_name,
        slug: mainProduct.category_slug
      },
      versions: versions
    };
    
    console.log('API Checkout: Returning product data with', versions.length, 'versions');
    return { product };

  } catch (error) {
    console.error('API Checkout: Error fetching product:', error);
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        message: 'An internal server error occurred.'
      });
    }
    throw error;
  }
});