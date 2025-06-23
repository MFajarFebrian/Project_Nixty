import pool from '../utils/db';

/**
 * GET /api/test-categories-simple
 * Simple test for categories without authentication
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing categories table...');
    
    const results = {
      tableExists: false,
      structure: null,
      sampleData: null,
      slugValidation: null,
      errors: []
    };

    // Test 1: Check if table exists and get structure
    try {
      const [columns] = await pool.execute('DESCRIBE categories');
      results.tableExists = true;
      results.structure = columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        default: col.Default,
        extra: col.Extra || ''
      }));
      console.log('✅ Categories table exists with', columns.length, 'columns');
    } catch (error) {
      results.errors.push(`Table check error: ${error.message}`);
      console.error('❌ Categories table check failed:', error);
    }

    // Test 2: Get sample data
    try {
      const [rows] = await pool.execute(`
        SELECT 
          c.*,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name
        LIMIT 5
      `);
      
      results.sampleData = rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        productCount: row.product_count,
        createdAt: row.created_at
      }));
      console.log('✅ Retrieved', rows.length, 'sample categories');
    } catch (error) {
      results.errors.push(`Sample data error: ${error.message}`);
      console.error('❌ Sample data retrieval failed:', error);
    }

    // Test 3: Test slug validation patterns
    const testSlugs = [
      { slug: 'valid-slug', expected: true },
      { slug: 'valid-slug-123', expected: true },
      { slug: 'microsoft-office', expected: true },
      { slug: 'Invalid Slug', expected: false },
      { slug: 'invalid_slug', expected: false },
      { slug: 'INVALID-SLUG', expected: false },
      { slug: 'invalid@slug', expected: false },
      { slug: '', expected: false },
      { slug: '-invalid-start', expected: false },
      { slug: 'invalid-end-', expected: false }
    ];

    results.slugValidation = testSlugs.map(test => {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      const actual = slugRegex.test(test.slug);
      return {
        slug: test.slug,
        expected: test.expected,
        actual: actual,
        passed: actual === test.expected
      };
    });

    const passedTests = results.slugValidation.filter(t => t.passed).length;
    console.log(`✅ Slug validation: ${passedTests}/${testSlugs.length} tests passed`);

    // Test 4: Check indexes
    try {
      const [indexes] = await pool.execute('SHOW INDEX FROM categories');
      const slugIndex = indexes.find(idx => idx.Key_name === 'slug');
      
      results.indexInfo = {
        hasSlugIndex: !!slugIndex,
        slugUnique: slugIndex?.Non_unique === 0,
        allIndexes: indexes.map(idx => ({
          name: idx.Key_name,
          column: idx.Column_name,
          unique: idx.Non_unique === 0
        }))
      };
      console.log('✅ Index information retrieved');
    } catch (error) {
      results.errors.push(`Index check error: ${error.message}`);
      console.error('❌ Index check failed:', error);
    }

    // Summary
    const summary = {
      tableExists: results.tableExists,
      totalErrors: results.errors.length,
      sampleDataCount: results.sampleData?.length || 0,
      slugTestsPassed: results.slugValidation?.filter(t => t.passed).length || 0,
      slugTestsTotal: results.slugValidation?.length || 0,
      hasSlugUniqueIndex: results.indexInfo?.slugUnique || false
    };

    console.log('📊 Categories test summary:', summary);

    return {
      success: results.errors.length === 0,
      message: `Categories test completed with ${results.errors.length} errors`,
      summary,
      data: results
    };

  } catch (error) {
    console.error('❌ Categories test failed:', error);
    
    return {
      success: false,
      message: 'Categories table test failed',
      error: error.message,
      data: null
    };
  }
});
