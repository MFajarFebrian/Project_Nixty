import { c as defineEventHandler, f as db } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';

const homePageSimple_get = defineEventHandler(async (event) => {
  try {
    console.log("Fetching home page data...");
    const [announcements] = await db.query(`
      SELECT id, title, image_url, created_at, is_new
      FROM nixty.announcements 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    const [categories] = await db.query(`
      SELECT id, name, slug
      FROM nixty.categories
      ORDER BY name ASC
      LIMIT 10
    `);
    const [heroSlides] = await db.query(`
      SELECT id, title, description, background_image_url, is_new
      FROM nixty.hero_slides 
      WHERE status = 'active' 
      ORDER BY sort_order ASC 
      LIMIT 5
    `);
    const [products] = await db.query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.image_url, p.is_featured, p.is_trending,
        c.name as category_name
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
      ORDER BY p.is_featured DESC, p.created_at DESC 
      LIMIT 20
    `);
    console.log("Data loaded:", {
      announcements: announcements.length,
      categories: categories.length,
      heroSlides: heroSlides.length,
      products: products.length
    });
    return {
      success: true,
      data: {
        announcements,
        categories,
        heroSlides,
        products,
        featuredProducts: products.filter((p) => p.is_featured),
        trendingProducts: products.filter((p) => p.is_trending)
      }
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      success: false,
      message: "An error occurred while fetching home page data",
      error: error.message
    };
  }
});

export { homePageSimple_get as default };
//# sourceMappingURL=home-page-simple.get.mjs.map
