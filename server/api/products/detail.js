import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const productId = query.id;
  console.log('API Detail: Received product ID:', productId);

  if (!productId) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required'
    });
  }

  try {
    // Find the product by ID
    const productQuery = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [products] = await db.query(productQuery, [productId]);
    
    if (!products || products.length === 0) {
      console.warn('API Detail: Product not found for ID:', productId);
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      });
    }

    // Get the product
    const mainProduct = products[0];
    console.log('API Detail: Found product:', mainProduct.name, 'ID:', mainProduct.id);

    // Find all versions of this product (same name and category)
    const versionsQuery = `
      SELECT 
        p.id, p.name, p.version, p.slug, p.price, p.image_url
      FROM products p
      WHERE p.name = ? AND p.category_id = ?
      ORDER BY p.version DESC
    `;
    const [versions] = await db.query(versionsQuery, [mainProduct.name, mainProduct.category_id]);
    
    console.log('API Detail: Found', versions.length, 'versions for product');

    // Format the product data
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
      }
    };
    
    // Format the versions data
    const formattedVersions = versions.map(v => ({
      id: v.id.toString(),
      name: v.name,
      version: v.version,
      slug: v.slug,
      price: parseFloat(v.price),
      image_url: v.image_url || '/placeholder-product.png'
    }));
    
    console.log('API Detail: Returning product data with', formattedVersions.length, 'versions');
    return { 
      product,
      versions: formattedVersions
    };

  } catch (error) {
    console.error('API Detail: Error fetching product by ID:', error);
    if (!error.statusCode) {
        throw createError({
            statusCode: 500,
            message: 'An internal server error occurred.'
        });
    }
    throw error;
  }
}); 