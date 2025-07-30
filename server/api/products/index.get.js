import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('Fetching all products...');
    
    // Query parameters
    const query = getQuery(event);
    const limit = query.limit ? parseInt(query.limit) : 12;
    const page = query.page ? parseInt(query.page) : 1;
    const offset = (page - 1) * limit;
    
    // Use the database to fetch products with pagination
    const productsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM nixty.product_license_base plb WHERE plb.product_id = p.id AND plb.status = 'available') as available_stock
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nixty.products
      WHERE status = 'active'
    `;
    
    const [products, countResult] = await Promise.all([
      db.query(productsQuery, [limit, offset]),
      db.query(countQuery)
    ]);
    
    // Process products to add out of stock status
    const processedProducts = products.map(product => {
      const isOutOfStock = product.available_stock === 0;
      return {
        ...product,
        status: isOutOfStock ? 'out_of_stock' : product.status
      };
    });
    
    console.log(`Found ${processedProducts.length} products`);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      products: processedProducts,
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        total_pages: totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error.message);
    
    return {
      products: [],
      pagination: {
        total: 0,
        per_page: 12,
        current_page: 1,
        total_pages: 0
      }
    };
  }
});
