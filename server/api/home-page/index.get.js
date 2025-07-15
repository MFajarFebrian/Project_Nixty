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
      SELECT id, title, image_url, created_at, is_new
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
        (SELECT image_url FROM products WHERE category_id = c.id AND status = 'active' ORDER BY created_at DESC LIMIT 1) as image_url,
        (SELECT slug FROM products WHERE category_id = c.id AND status = 'active' ORDER BY created_at DESC LIMIT 1) as main_product_slug
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name ASC
      LIMIT 10
    `);

    // Get featured deals (using discount_price instead of discount_percentage)
    const dealsQuery = db.query(`
      SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.image_url
      FROM products p
      WHERE p.status = 'active' AND p.discount_price IS NOT NULL AND p.discount_price > 0
      ORDER BY (p.price - p.discount_price) DESC
      LIMIT 3
    `);

    const heroSlidesQuery = db.query(`
      SELECT id, title, description, background_image_url, is_new
      FROM hero_slides 
      WHERE status = 'active' 
      ORDER BY sort_order ASC 
      LIMIT 5
    `);

    // Updated products query to match the actual schema
    const allProductsQuery = db.query(`
      SELECT 
        p.id, p.name, p.version, p.slug, p.short_description, p.price,
        p.image_url, p.is_featured, p.is_trending, p.discount_price,
        p.tags, p.is_multi_license,
        c.slug as category_slug, c.name as category_name
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

    // Log announcement data for verification
    console.log('Announcements loaded:', announcements.length, 'announcements');
    console.log('Categories loaded:', categories.length, 'categories');
    console.log('Products loaded:', allProducts.length, 'products');

    // Process data efficiently
    const mappedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: parseInt(category.product_count, 10),
      mainProductSlug: category.main_product_slug,
      imageUrl: category.image_url || '/placeholder-product.png'
    }));

    // Calculate discount percentage for products
    const processedProducts = allProducts.map(product => {
      const originalPrice = parseFloat(product.price) || 0;
      const discountPrice = parseFloat(product.discount_price) || 0;
      let discountPercentage = 0;
      
      if (discountPrice > 0 && originalPrice > 0) {
        discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
      }
      
      return {
        ...product,
        discount_percentage: discountPercentage
      };
    });

    // Pre-filter products for better performance
    const featuredProducts = processedProducts.filter(p => p.is_featured).slice(0, 12);
    const newProducts = processedProducts.filter(p => p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).slice(0, 12);
    const trendingProducts = processedProducts.filter(p => p.is_trending).slice(0, 12);

    // Process deals data
    const processedDeals = deals.map(deal => {
      const price = parseFloat(deal.price) || 0;
      const discountPrice = parseFloat(deal.discount_price) || 0;
      let discountPercentage = 0;
      
      if (discountPrice > 0 && price > 0) {
        discountPercentage = Math.round(((price - discountPrice) / price) * 100);
      }
      
      return {
        ...deal,
        discount_percentage: discountPercentage
      };
    });

    const result = {
      success: true,
      data: {
        announcements,
        categories: mappedCategories,
        deals: processedDeals,
        heroSlides,
        allProducts: processedProducts.slice(0, 30), // Limit to 30 for home page
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
      data: {
        allProducts: [],
        featuredProducts: [],
        newProducts: [],
        trendingProducts: [],
        categories: [],
        announcements: [],
        deals: [],
        heroSlides: []
      },
    };
  }
});
