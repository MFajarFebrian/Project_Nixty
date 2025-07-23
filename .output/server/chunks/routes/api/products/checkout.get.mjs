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

const checkout_get = defineEventHandler(async (event) => {
  var _a, _b;
  const query = getQuery(event);
  const productSlug = query.slug;
  const productId = query.productId;
  console.log("API Checkout: Received params:", { slug: productSlug, productId });
  if (!productSlug && !productId) {
    throw createError({
      statusCode: 400,
      message: "Product slug or ID is required"
    });
  }
  try {
    const productsQuery = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug 
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE ${productSlug ? "c.slug = ?" : "p.id = ?"}
      ORDER BY p.created_at DESC
    `;
    const [products] = await db.query(productsQuery, [productSlug || productId]);
    if (!products || products.length === 0) {
      console.warn("API Checkout: Product not found for:", productSlug ? `slug: ${productSlug}` : `ID: ${productId}`);
      throw createError({
        statusCode: 404,
        message: "Product not found"
      });
    }
    if (productId) {
      const targetVersionIndex = products.findIndex((p) => p.id.toString() === productId.toString());
      if (targetVersionIndex > 0) {
        const targetVersion = products.splice(targetVersionIndex, 1)[0];
        products.unshift(targetVersion);
      }
    }
    const mainProduct = products[0];
    console.log("API Checkout: Found main product:", mainProduct.name, "ID:", mainProduct.id);
    const versions = [];
    for (let p of products) {
      const [stockInfo] = await db.query(`
        SELECT 
          COUNT(*) as total_licenses,
          SUM(CASE 
            WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
            THEN (max_usage - COALESCE(send_license, 0))
            ELSE 0 
          END) as available_stock
        FROM nixty.product_license_base 
        WHERE product_id = ?
      `, [p.id]);
      const originalPrice2 = parseFloat(p.price) || 0;
      const discountPrice2 = parseFloat(p.discount_price) || 0;
      let discountPercentage2 = 0;
      if (discountPrice2 > 0 && originalPrice2 > 0) {
        discountPercentage2 = Math.round((originalPrice2 - discountPrice2) / originalPrice2 * 100);
      }
      versions.push({
        id: p.id.toString(),
        name: p.version ? `${p.name} ${p.version}` : p.name,
        version: p.version,
        slug: p.category_slug,
        // Use category slug
        description: p.description,
        // Add description for each version
        price: originalPrice2,
        discount_price: discountPrice2 > 0 ? discountPrice2 : null,
        discount_percentage: discountPercentage2,
        final_price: discountPrice2 > 0 ? discountPrice2 : originalPrice2,
        image_url: p.image_url || "/placeholder-product.png",
        available_stock: parseInt(((_a = stockInfo[0]) == null ? void 0 : _a.available_stock) || 0),
        total_licenses: parseInt(((_b = stockInfo[0]) == null ? void 0 : _b.total_licenses) || 0),
        is_subscription: Boolean(p.is_subscription),
        is_multi_license: Boolean(p.is_multi_license)
      });
    }
    const originalPrice = parseFloat(mainProduct.price) || 0;
    const discountPrice = parseFloat(mainProduct.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
    }
    const product = {
      id: mainProduct.id,
      name: mainProduct.name,
      version: mainProduct.version,
      slug: mainProduct.category_slug,
      // Use category slug instead of product slug
      description: mainProduct.description,
      price: originalPrice,
      discount_price: discountPrice > 0 ? discountPrice : null,
      discount_percentage: discountPercentage,
      final_price: discountPrice > 0 ? discountPrice : originalPrice,
      image_url: mainProduct.image_url || "/placeholder-product.png",
      is_subscription: Boolean(mainProduct.is_subscription),
      is_multi_license: Boolean(mainProduct.is_multi_license),
      category: {
        name: mainProduct.category_name,
        slug: mainProduct.category_slug
      },
      versions
    };
    console.log("API Checkout: Returning product data with", versions.length, "versions");
    return { product };
  } catch (error) {
    console.error("API Checkout: Error fetching product:", error);
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        message: "An internal server error occurred."
      });
    }
    throw error;
  }
});

export { checkout_get as default };
//# sourceMappingURL=checkout.get.mjs.map
