import db from '../../utils/db.js';
import { useCache } from '../../utils/cache.js';

async function fetchHomePageData() {
  // Simplified queries for better performance
  const announcementsQuery = db.query(`
    SELECT id, title, image_url, created_at, is_new
    FROM nixty.announcements 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 3
  `);
  
  const categoriesQuery = db.query(`
    SELECT 
      c.id, c.name, c.slug,
      COUNT(p.id) as product_count,
      (SELECT image_url FROM nixty.products WHERE category_id = c.id AND status = 'active' ORDER BY created_at DESC LIMIT 1) as image_url
    FROM nixty.categories c
    LEFT JOIN nixty.products p ON c.id = p.category_id AND p.status = 'active'
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
    LIMIT 10
  `);

  const dealsQuery = db.query(`
    SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.image_url
    FROM nixty.products p
    WHERE p.status = 'active' AND p.discount_price IS NOT NULL AND p.discount_price > 0
    ORDER BY (p.price - p.discount_price) DESC
    LIMIT 3
  `);

  const heroSlidesQuery = db.query(`
    SELECT id, title, description, background_image_url, is_new
    FROM nixty.hero_slides 
    WHERE status = 'active' 
    ORDER BY sort_order ASC 
    LIMIT 5
  `);

  const allProductsQuery = db.query(`
    SELECT 
      p.id, p.name, p.version, p.slug, p.short_description, p.price,
      p.image_url, p.is_featured, p.is_trending, p.discount_price,
      (SELECT COUNT(*) FROM nixty.product_license_base plb WHERE plb.product_id = p.id AND plb.status = 'available') as available_stock,
      p.tags, p.is_multi_license,
      c.slug as category_slug, c.name as category_name
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.status = 'active' 
    ORDER BY p.is_featured DESC, p.is_trending DESC, p.created_at DESC 
    LIMIT 50
  `);

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

  const mappedCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: parseInt(category.product_count, 10),
    imageUrl: category.image_url || '/placeholder-product.png'
  }));

    const processedProducts = allProducts.map(product => {
      const isOutOfStock = product.available_stock === 0;
    const originalPrice = parseFloat(product.price) || 0;
    const discountPrice = parseFloat(product.discount_price) || 0;
    let discountPercentage = 0;
    
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    }
    
    return {
      ...product,
      status: isOutOfStock ? 'out_of_stock' : product.status,
      discount_percentage: discountPercentage
    };
  });

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

  return {
    announcements,
    categories: mappedCategories,
    deals: processedDeals,
    heroSlides,
    allProducts: processedProducts.slice(0, 30),
    featuredProducts: processedProducts.filter(p => p.is_featured).slice(0, 12),
    newProducts: processedProducts.filter(p => p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).slice(0, 12),
    trendingProducts: processedProducts.filter(p => p.is_trending).slice(0, 12),
  };
}

export default defineEventHandler(async (event) => {
  try {
    const data = await useCache('home_page_data', fetchHomePageData);
    
    return {
      success: true,
      data,
    };
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
