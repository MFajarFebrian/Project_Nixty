import { c as defineEventHandler, h as getQuery, e as createError, f as db } from '../../../_/nitro.mjs';
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

const details_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log("API received query:", query);
    const productId = query.productId;
    const slug = query.slug;
    console.log("Extracted productId:", productId, "Extracted slug:", slug);
    if (!productId && !slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID or slug is required"
      });
    }
    let productQuery = `
      SELECT 
        p.id, p.name, p.version, p.slug, p.description, p.short_description, p.price,
        p.currency, p.discount_price, p.image_url, p.is_featured, p.is_trending, 
        p.tags, p.is_multi_license, p.is_subscription, p.is_digital_download, p.status,
        p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    let params = [];
    if (productId) {
      productQuery += ` WHERE p.id = ?`;
      params.push(productId);
    } else if (slug) {
      productQuery += ` WHERE p.slug = ?`;
      params.push(slug);
    }
    console.log("Executing product query:", productQuery);
    console.log("With parameters:", params);
    const [products] = await db.execute(productQuery, params);
    if (products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    const product = products[0];
    if (product.discount_price && product.price) {
      const originalPrice = parseFloat(product.price);
      const discountPrice = parseFloat(product.discount_price);
      if (discountPrice > 0 && originalPrice > 0) {
        product.discount_percentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
      } else {
        product.discount_percentage = 0;
      }
    } else {
      product.discount_percentage = 0;
    }
    if (product.created_at) {
      const productDate = new Date(product.created_at);
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      product.is_new = productDate > thirtyDaysAgo;
    } else {
      product.is_new = false;
    }
    let period = null;
    if (product.is_subscription) {
      if (product.name.toLowerCase().includes("monthly") || product.version && product.version.toLowerCase().includes("monthly")) {
        period = "/month";
      } else if (product.name.toLowerCase().includes("annual") || product.name.toLowerCase().includes("yearly") || product.version && (product.version.toLowerCase().includes("annual") || product.version.toLowerCase().includes("yearly"))) {
        period = "/year";
      } else {
        period = "/year";
      }
    }
    product.period = period;
    const [versions] = await db.execute(
      `SELECT id, name, version, price, discount_price, image_url, is_subscription FROM products WHERE name = ? ORDER BY version DESC`,
      [product.name]
    );
    const processedVersions = versions.map((version) => {
      const originalPrice = parseFloat(version.price) || 0;
      const discountPrice = parseFloat(version.discount_price) || 0;
      let discountPercentage = 0;
      if (discountPrice > 0 && originalPrice > 0) {
        discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
      }
      let period2 = null;
      if (version.is_subscription) {
        if (version.name.toLowerCase().includes("monthly") || version.version.toLowerCase().includes("monthly")) {
          period2 = "/month";
        } else if (version.name.toLowerCase().includes("annual") || version.name.toLowerCase().includes("yearly") || version.version.toLowerCase().includes("annual") || version.version.toLowerCase().includes("yearly")) {
          period2 = "/year";
        } else {
          period2 = "/year";
        }
      }
      return {
        ...version,
        discount_percentage: discountPercentage,
        period: period2
      };
    });
    return {
      success: true,
      product,
      versions: processedVersions
    };
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to fetch product details"
    });
  }
});

export { details_get as default };
//# sourceMappingURL=details.get.mjs.map
