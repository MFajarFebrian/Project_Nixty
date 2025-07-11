import { defineEventHandler } from 'h3';
import db from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product group slug is required',
    });
  }

  try {
    // First, find the base name of the product from the given slug.
    // This allows us to find all other products with the same name.
    const [[baseProduct]] = await db.query(
      'SELECT name FROM products WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (!baseProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product group not found',
      });
    }

    // Now, fetch all products (versions) that share the same name.
    const [products] = await db.query(
      `SELECT id, name, version, slug, description, short_description, price, image_url, status
       FROM products 
       WHERE name = ? AND status = 'active'
       ORDER BY version ASC`,
      [baseProduct.name]
    );

    if (!products || products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No active products found for this group.',
      });
    }
    
    // The first product can be treated as the main product for display purposes.
    const mainProduct = products[0];

    return {
      product: mainProduct,
      versions: products, // All available versions
    };

  } catch (err) {
    const error = err;
    console.error(`Error fetching product group with slug ${slug}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'An internal error occurred while fetching the product group.',
    });
  }
}); 