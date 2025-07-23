import { c as defineEventHandler, e as createError, f as db } from '../../../_/nitro.mjs';
import { u as useCache } from '../../../_/cache.mjs';
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

async function fetchProductData(slug) {
  const productFamilyQuery = db.query(`
    SELECT
      p.id, p.name, p.version, p.slug, p.description, p.short_description, 
      p.price, p.discount_price, p.image_url, p.is_featured, p.is_trending,
      p.tags, p.is_multi_license, p.created_at,
      c.slug as category_slug, c.name as category_name
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.status = 'active'
    ORDER BY p.version DESC
  `, [slug]);
  const [[productFamily]] = await Promise.all([productFamilyQuery]);
  if (!productFamily || productFamily.length === 0) {
    return { product: null, relatedProducts: [] };
  }
  const mainProduct = productFamily[0];
  const categorySlug = mainProduct.category_slug;
  const relatedProductsQuery = db.query(`
    SELECT 
      p.id, p.name, p.slug, p.price, p.discount_price, p.image_url,
      c.slug as category_slug
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.category_id = (SELECT id FROM nixty.categories WHERE slug = $1)
      AND p.slug != $2
      AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT 4
  `, [categorySlug, slug]);
  const [[relatedProducts]] = await Promise.all([relatedProductsQuery]);
  const processProduct = (p) => {
    const originalPrice = parseFloat(p.price) || 0;
    const discountPrice = parseFloat(p.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
    }
    return {
      ...p,
      discount_percentage: discountPercentage,
      is_new: p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
    };
  };
  return {
    product: processProduct(mainProduct),
    versions: productFamily.map(processProduct),
    relatedProducts: relatedProducts.map(processProduct)
  };
}
const _slug__get = defineEventHandler(async (event) => {
  const { slug } = event.context.params;
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing product slug" });
  }
  try {
    const data = await useCache(`product_${slug}`, () => fetchProductData(slug));
    if (!data.product) {
      throw createError({ statusCode: 404, statusMessage: "Product not found" });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error(`Error fetching product data for slug ${slug}:`, error);
    throw error;
  }
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
