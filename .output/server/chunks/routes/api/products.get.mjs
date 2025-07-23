import { c as defineEventHandler, h as getQuery, f as db } from '../../_/nitro.mjs';
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

const products_get = defineEventHandler(async (event) => {
  var _a;
  try {
    console.log("Fetching all products from nixty schema...");
    const query = getQuery(event);
    const limit = query.limit ? parseInt(query.limit) : 50;
    const page = query.page ? parseInt(query.page) : 1;
    const offset = (page - 1) * limit;
    const productsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.image_url, 
        p.description, 
        p.status,
        p.category_id,
        c.name as category_name, 
        c.slug as category_slug
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
    const [productsResult, countResultArray] = await Promise.all([
      db.query(productsQuery, [limit, offset]),
      db.query(countQuery)
    ]);
    const products = productsResult[0] || [];
    const countResult = countResultArray[0] || [];
    console.log(`Found ${products.length} products`);
    const formattedProducts = products.map((p) => {
      var _a2;
      return {
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        image_url: p.image_url || "/placeholder-product.png",
        description: p.description,
        category_name: p.category_name,
        category_slug: p.category_slug,
        status: p.status,
        // Generate slug from name for compatibility
        slug: ((_a2 = p.name) == null ? void 0 : _a2.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `product-${p.id}`,
        category: {
          id: p.category_id,
          name: p.category_name,
          slug: p.category_slug
        }
      };
    });
    const total = ((_a = countResult[0]) == null ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(total / limit);
    return {
      products: formattedProducts,
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        total_pages: totalPages
      }
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return {
      products: [],
      pagination: {
        total: 0,
        per_page: 50,
        current_page: 1,
        total_pages: 0
      },
      error: error.message
    };
  }
});

export { products_get as default };
//# sourceMappingURL=products.get.mjs.map
