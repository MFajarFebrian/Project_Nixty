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
    // Find all products with the same slug or specific ID
    const productsQuery = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${productSlug ? 'p.slug = ?' : 'p.id = ?'}
      ORDER BY p.version DESC
    `;
    const [products] = await db.query(productsQuery, [productSlug || productId]);
    
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
      const [stockInfo] = await db.query(`
        SELECT 
          COUNT(*) as total_licenses,
          SUM(CASE 
            WHEN status = 'available' AND (send_license < max_usage OR send_license IS NULL)
            THEN (max_usage - COALESCE(send_license, 0))
            ELSE 0 
          END) as available_stock
        FROM product_licenses 
        WHERE product_id = ?
      `, [p.id]);
      
      versions.push({
        id: p.id.toString(),
        name: p.version ? `${p.name} ${p.version}` : p.name,
        version: p.version,
        slug: p.slug,
        price: parseFloat(p.price),
        image_url: p.image_url || '/placeholder-product.png',
        available_stock: parseInt(stockInfo[0]?.available_stock || 0),
        total_licenses: parseInt(stockInfo[0]?.total_licenses || 0)
      });
    }

    // Format the product data in the expected format
    const product = {
      id: mainProduct.id,
      name: mainProduct.name,
      version: mainProduct.version,
      slug: mainProduct.slug,
      description: mainProduct.description,
      price: parseFloat(mainProduct.price),
      image_url: mainProduct.image_url || '/placeholder-product.png',
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