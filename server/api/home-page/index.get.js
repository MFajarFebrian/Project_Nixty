import db from '../../utils/db.js';

// Simple in-memory cache
let cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

export default defineEventHandler(async (event) => {
  try {
    // Check cache first
    const now = Date.now();
    if (cache.data && cache.timestamp && (now - cache.timestamp) < cache.ttl) {
      console.log('🚀 Serving from cache');
      return cache.data;
    }

    console.log('📡 Fetching fresh data from database');
    
    // Simplified queries for better performance
    const announcementsQuery = db.query(`
      SELECT id, title, image_url, created_at 
      FROM announcements 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    // Simplified categories query
    const categoriesQuery = db.query(`
      SELECT 
        c.id, c.name, c.slug,
        COUNT(p.id) as product_count,
        (SELECT slug FROM products WHERE category_id = c.id AND status = 'active' ORDER BY created_at DESC LIMIT 1) as main_product_slug
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name ASC
      LIMIT 10
    `);

    // Get only featured deals
    const dealsQuery = db.query(`
      SELECT p.id, p.name, p.slug, p.price, p.discount_percentage, p.image_url
      FROM products p
      WHERE p.status = 'active' AND p.discount_percentage > 0
      ORDER BY p.discount_percentage DESC
      LIMIT 3
    `);

    const heroSlidesQuery = db.query(`
      SELECT id, title, description, background_image_url, is_new
      FROM hero_slides 
      WHERE status = 'active' 
      ORDER BY sort_order ASC 
      LIMIT 5
    `);

    // Optimized products query - only get what we need for home page
    const allProductsQuery = db.query(`
      SELECT 
        p.id, p.name, p.version, p.slug, p.short_description, p.price,
        p.image_url, p.is_new, p.is_featured, p.is_trending, p.sold_count,
        p.discount_percentage, p.period,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
      ORDER BY p.is_featured DESC, p.is_trending DESC, p.created_at DESC 
      LIMIT 50
    `);

    // Execute queries in parallel
    const [
      [announcements],
      [categories],
      [deals],
      [heroSlides],
      [allProducts]
    ] = await Promise.all([
      announcementsQuery,
      categoriesQuery,
      dealsQuery,
      heroSlidesQuery,
      allProductsQuery
    ]);

    // Process data efficiently
    const mappedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: parseInt(category.product_count, 10),
      mainProductSlug: category.main_product_slug
    }));

    // Pre-filter products for better performance
    const featuredProducts = allProducts.filter(p => p.is_featured).slice(0, 12);
    const newProducts = allProducts.filter(p => p.is_new).slice(0, 12);
    const trendingProducts = allProducts.filter(p => p.is_trending).slice(0, 12);

    const result = {
      success: true,
      data: {
        announcements,
        categories: mappedCategories,
        deals,
        heroSlides,
        allProducts: allProducts.slice(0, 30), // Limit to 30 for home page
        featuredProducts,
        newProducts,
        trendingProducts,
      },
    };

    // Cache the result
    cache.data = result;
    cache.timestamp = now;
    console.log('💾 Data cached for 5 minutes');

    return result;
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      success: false,
      message: 'An error occurred while fetching home page data.',
      data: {},
    };
  }
});
