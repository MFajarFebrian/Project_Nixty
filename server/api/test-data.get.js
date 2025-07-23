import db from '../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('Testing database queries...');
    
    const result = {
      success: true,
      data: {},
      errors: []
    };

    // Test categories
    try {
      const [categories] = await db.query('SELECT id, name, slug FROM nixty.categories ORDER BY name LIMIT 5');
      result.data.categories = categories;
      console.log('✓ Categories loaded:', categories.length);
    } catch (error) {
      result.errors.push(`Categories error: ${error.message}`);
      console.error('✗ Categories error:', error);
    }

    // Test products
    try {
      const [products] = await db.query('SELECT id, name, slug, price FROM nixty.products WHERE status = $1 ORDER BY name LIMIT 5', ['active']);
      result.data.products = products;
      console.log('✓ Products loaded:', products.length);
    } catch (error) {
      result.errors.push(`Products error: ${error.message}`);
      console.error('✗ Products error:', error);
    }

    // Test announcements
    try {
      const [announcements] = await db.query('SELECT id, title, status FROM nixty.announcements ORDER BY created_at DESC LIMIT 5');
      result.data.announcements = announcements;
      console.log('✓ Announcements loaded:', announcements.length);
    } catch (error) {
      result.errors.push(`Announcements error: ${error.message}`);
      console.error('✗ Announcements error:', error);
    }

    // Test users
    try {
      const [users] = await db.query('SELECT id, email, name, account_type FROM nixty.users ORDER BY created_at DESC LIMIT 5');
      result.data.users = users;
      console.log('✓ Users loaded:', users.length);
    } catch (error) {
      result.errors.push(`Users error: ${error.message}`);
      console.error('✗ Users error:', error);
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
    
  } catch (error) {
    console.error('Test data API error:', error);
    return {
      success: false,
      message: 'Database test failed',
      error: error.message
    };
  }
});
