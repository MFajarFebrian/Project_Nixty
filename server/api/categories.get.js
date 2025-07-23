import db from '../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const [categories] = await db.query('SELECT id, name, slug FROM nixty.categories ORDER BY name');
    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories'
    });
  }
});

