import db from '../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    // Check if tables exist
    const checkTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'nixty' 
      AND table_name IN ('products', 'categories')
      ORDER BY table_name
    `;
    
    const tables = await db.query(checkTablesQuery);
    
    // Get products count
    const countQuery = `
      SELECT COUNT(*) as total FROM nixty.products
    `;
    const countResult = await db.query(countQuery);
    
    // Get sample products
    const productsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.status,
        p.category_id,
        c.name as category_name
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      LIMIT 10
    `;
    const products = await db.query(productsQuery);
    
    // Get categories
    const categoriesQuery = `
      SELECT id, name, slug FROM nixty.categories
    `;
    const categories = await db.query(categoriesQuery);
    
    return {
      success: true,
      tables: tables.map(t => t.table_name),
      total_products: countResult[0]?.total || 0,
      sample_products: products,
      categories: categories
    };
    
  } catch (error) {
    console.error('Error testing products:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});
