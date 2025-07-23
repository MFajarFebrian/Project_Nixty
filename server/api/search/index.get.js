import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      q: searchQuery,
      type = 'all', // 'products', 'deals', 'news', or 'all'
      limit = 3
    } = query;

    console.log('🔍 Search API called with:', { searchQuery, type, limit });

    if (!searchQuery || searchQuery.length < 2) {
      console.log('❌ Search query too short:', searchQuery);
      return {
        success: false,
        message: 'Search query must be at least 2 characters long',
        data: []
      };
    }

    const results = [];
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);

    // Create LIKE conditions for flexible search - more permissive matching
    const createSearchConditions = (fields) => {
      // For each search term, check if ANY field contains it (OR condition)
      // Multiple terms should ALL be found somewhere (AND condition)
      return searchTerms.map(term =>
        `(${fields.map(field => `LOWER(${field}) LIKE ?`).join(' OR ')})`
      ).join(' AND ');
    };

    const createSearchParams = (fieldsCount) => {
      return searchTerms.flatMap(term =>
        Array(fieldsCount).fill(`%${term}%`)
      );
    };

    // Search Products
    if (type === 'all' || type === 'Product') {
      console.log('🔍 Searching products...');
      const productFields = ['p.name', 'p.version', 'p.description', 'p.short_description'];
      const productConditions = createSearchConditions(productFields);
      const productParams = createSearchParams(productFields.length);

      const productSql = `
        SELECT
          p.id,
          p.name,
          p.version,
          p.description,
          p.short_description,
          p.price,
          p.currency,
          c.name as category_name,
          'Product' as result_type
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND ${productConditions}
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT ?
      `;

      console.log('📝 Product SQL:', productSql);
      console.log('📝 Product Params:', [...productParams, parseInt(limit)]);

      const [productRows] = await db.query(productSql, [...productParams, parseInt(limit)]);

      console.log('📊 Product search results:', productRows.length, 'rows found');

      productRows.forEach(row => {
        results.push({
          id: row.id,
          name: row.name + (row.version ? ` ${row.version}` : ''),
          type: 'Product',
          category: row.category_name,
          price: row.price ? `${row.currency}${Math.floor(row.price).toLocaleString('id-ID')}` : null,
          description: row.short_description || row.description
        });
      });
    }

    // Search Deals
    if (type === 'all' || type === 'Deal') {
      const dealFields = ['d.title', 'd.description', 'p.name'];
      const dealConditions = createSearchConditions(dealFields);
      const dealParams = createSearchParams(dealFields.length);

      const dealSql = `
        SELECT 
          d.id,
          d.title,
          d.description,
          d.new_price,
          d.old_price,
          d.discount_percentage,
          p.name as product_name,
          'Deal' as result_type
        FROM deals d
        LEFT JOIN products p ON d.product_id = p.id
        WHERE d.status = 'active' 
          AND (d.expires_at IS NULL OR d.expires_at > NOW())
          AND (${dealConditions})
        ORDER BY d.is_featured DESC, d.created_at DESC
        LIMIT ?
      `;

      const [dealRows] = await db.query(dealSql, [...dealParams, parseInt(limit)]);
      
      dealRows.forEach(row => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: 'Deal',
          price: row.new_price ? `Rp${Math.floor(row.new_price).toLocaleString('id-ID')}` : null,
          oldPrice: row.old_price ? `Rp${Math.floor(row.old_price).toLocaleString('id-ID')}` : null,
          discount: row.discount_percentage ? `${row.discount_percentage}% OFF` : null,
          description: row.description,
          productName: row.product_name
        });
      });
    }

    // Search News (Announcements)
    if (type === 'all' || type === 'News') {
      const newsFields = ['a.title', 'a.content'];
      const newsConditions = createSearchConditions(newsFields);
      const newsParams = createSearchParams(newsFields.length);

      const newsSql = `
        SELECT 
          a.id,
          a.title,
          a.content,
          a.created_at,
          a.is_new,
          'News' as result_type
        FROM announcements a
        WHERE a.status = 'active' AND (${newsConditions})
        ORDER BY a.created_at DESC
        LIMIT ?
      `;

      const [newsRows] = await db.query(newsSql, [...newsParams, parseInt(limit)]);
      
      newsRows.forEach(row => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: 'News',
          content: row.content,
          date: new Date(row.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          isNew: Boolean(row.is_new)
        });
      });
    }

    // Limit total results
    const limitedResults = results.slice(0, parseInt(limit));

    console.log('✅ Search completed:', {
      totalResults: results.length,
      limitedResults: limitedResults.length,
      query: searchQuery,
      type: type
    });

    return {
      success: true,
      data: limitedResults,
      total: limitedResults.length,
      query: searchQuery,
      type: type
    };

  } catch (error) {
    console.error('Error in search API:', error);
    
    return {
      success: false,
      message: 'An error occurred while searching',
      data: [],
      error: error.message
    };
  }
});
