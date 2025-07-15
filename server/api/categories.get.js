import db from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const [categories] = await db.execute('SELECT id, name, slug FROM categories ORDER BY name');
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

