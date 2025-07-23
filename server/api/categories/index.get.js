import db from '../../utils/db.js';
import { useCache } from '../../utils/cache.js';

async function fetchCategoriesData() {
  const query = `
    SELECT
      c.id,
      c.name,
      c.slug,
      COUNT(p.id) AS product_count
    FROM nixty.categories c
    LEFT JOIN nixty.products p ON c.id = p.category_id AND p.status = 'active'
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
  `;
  
  const [rows] = await db.query(query);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    productCount: parseInt(row.product_count, 10)
  }));
}

export default defineEventHandler(async (event) => {
  try {
    const categories = await useCache('all_categories', fetchCategoriesData);
    
    return {
      success: true,
      data: categories
    };

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching categories',
      data: []
    };
  }
});
