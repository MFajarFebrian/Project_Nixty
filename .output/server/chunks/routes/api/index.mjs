import { c as defineEventHandler, h as getQuery, f as db, e as createError } from '../../_/nitro.mjs';
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

const index = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const categorySlug = query.category;
    console.log("API Products: Query parameters:", query);
    let productsQuery;
    let queryParams = [];
    if (categorySlug) {
      console.log("API Products: Fetching products by category slug:", categorySlug);
      productsQuery = `
        SELECT 
          p.id, p.name, p.price, p.image_url, p.description, p.status,
          c.name as category_name, c.slug as category_slug
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE c.slug = ? AND p.status = 'active'
        ORDER BY p.id DESC
      `;
      queryParams.push(categorySlug);
    } else {
      console.log("API Products: Fetching all products");
      productsQuery = `
        SELECT 
          p.id, p.name, p.price, p.image_url, p.description, p.status,
          c.name as category_name, c.slug as category_slug
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.name, p.id DESC
      `;
    }
    const [products] = await db.query(productsQuery, queryParams);
    if (!products || products.length === 0) {
      console.log("API Products: No products found");
      return {
        success: true,
        data: [],
        total: 0
      };
    }
    const formattedProducts = products.map((p) => {
      var _a;
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
        slug: ((_a = p.name) == null ? void 0 : _a.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `product-${p.id}`,
        category: {
          name: p.category_name,
          slug: p.category_slug
        }
      };
    });
    console.log("API Products: Returning", formattedProducts.length, "products");
    return {
      success: true,
      data: formattedProducts,
      total: formattedProducts.length
    };
  } catch (error) {
    console.error("API Products: Error fetching products:", error);
    throw createError({
      statusCode: 500,
      message: "An internal server error occurred."
    });
  }
});

export { index as default };
//# sourceMappingURL=index.mjs.map
