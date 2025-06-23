import pool from '../../utils/db';
import { validateRecordData } from '../../utils/admin-validation';

/**
 * GET /api/admin/test-categories
 * Test categories table CRUD operations
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing categories table operations...');
    
    const results = {
      tableStructure: null,
      validationRules: null,
      createTest: null,
      updateTest: null,
      slugTest: null,
      foreignKeyTest: null,
      errors: []
    };

    // Test 1: Get table structure
    try {
      const [columns] = await pool.execute('DESCRIBE categories');
      results.tableStructure = {
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          default: col.Default,
          extra: col.Extra || ''
        }))
      };
      console.log('✅ Categories table structure retrieved');
    } catch (error) {
      results.errors.push(`Table structure error: ${error.message}`);
      console.error('❌ Failed to get table structure:', error);
    }

    // Test 2: Test validation rules
    try {
      // Test valid data
      const validData = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'This is a test category'
      };
      
      const validatedData = validateRecordData('categories', validData, false);
      results.validationRules = {
        valid: true,
        input: validData,
        output: validatedData
      };
      console.log('✅ Validation rules working correctly');
    } catch (error) {
      results.validationRules = {
        valid: false,
        error: error.message,
        validationErrors: error.validationErrors || []
      };
      results.errors.push(`Validation error: ${error.message}`);
      console.error('❌ Validation failed:', error);
    }

    // Test 3: Test create operation
    try {
      const testData = {
        name: 'Test Category ' + Date.now(),
        slug: 'test-category-' + Date.now(),
        description: 'Test category created by automated test'
      };

      const validatedData = validateRecordData('categories', testData, false);
      
      // Try to insert
      const fields = Object.keys(validatedData);
      const values = Object.values(validatedData);
      const placeholders = fields.map(() => '?').join(', ');
      
      const [insertResult] = await pool.execute(
        `INSERT INTO categories (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      results.createTest = {
        success: true,
        insertId: insertResult.insertId,
        testData,
        validatedData
      };
      console.log('✅ Create operation successful');

      // Clean up - delete the test record
      await pool.execute('DELETE FROM categories WHERE id = ?', [insertResult.insertId]);
      console.log('✅ Test record cleaned up');

    } catch (error) {
      results.createTest = {
        success: false,
        error: error.message
      };
      results.errors.push(`Create test error: ${error.message}`);
      console.error('❌ Create test failed:', error);
    }

    // Test 4: Test slug validation
    try {
      const invalidSlugs = [
        'Invalid Slug With Spaces',
        'invalid_slug_with_underscores',
        'INVALID-SLUG-UPPERCASE',
        'invalid@slug#with$symbols',
        ''
      ];

      const slugResults = [];
      
      for (const slug of invalidSlugs) {
        try {
          validateRecordData('categories', { name: 'Test', slug }, false);
          slugResults.push({ slug, valid: true });
        } catch (error) {
          slugResults.push({ 
            slug, 
            valid: false, 
            error: error.validationErrors || [error.message] 
          });
        }
      }

      // Test valid slug
      try {
        validateRecordData('categories', { name: 'Test', slug: 'valid-slug-123' }, false);
        slugResults.push({ slug: 'valid-slug-123', valid: true });
      } catch (error) {
        slugResults.push({ 
          slug: 'valid-slug-123', 
          valid: false, 
          error: error.validationErrors || [error.message] 
        });
      }

      results.slugTest = {
        results: slugResults
      };
      console.log('✅ Slug validation test completed');

    } catch (error) {
      results.slugTest = {
        error: error.message
      };
      results.errors.push(`Slug test error: ${error.message}`);
      console.error('❌ Slug test failed:', error);
    }

    // Test 5: Check foreign key relationships
    try {
      const [productCount] = await pool.execute(`
        SELECT 
          c.id,
          c.name,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
        LIMIT 5
      `);

      results.foreignKeyTest = {
        categoriesWithProducts: productCount
      };
      console.log('✅ Foreign key relationship test completed');

    } catch (error) {
      results.foreignKeyTest = {
        error: error.message
      };
      results.errors.push(`Foreign key test error: ${error.message}`);
      console.error('❌ Foreign key test failed:', error);
    }

    // Test 6: Check for common issues
    const commonIssues = [];
    
    // Check required fields
    const requiredFields = results.tableStructure?.columns
      ?.filter(col => !col.nullable && !col.extra.includes('auto_increment'))
      ?.map(col => col.name) || [];
    
    // Check if slug uniqueness is enforced
    try {
      const [indexes] = await pool.execute('SHOW INDEX FROM categories WHERE Key_name = "slug"');
      if (indexes.length === 0) {
        commonIssues.push('Slug field should have unique constraint');
      }
    } catch (error) {
      commonIssues.push('Could not check slug uniqueness constraint');
    }

    results.analysis = {
      requiredFields,
      commonIssues,
      recommendations: [
        'Ensure slug uniqueness is enforced at database level',
        'Consider adding client-side slug auto-generation from name',
        'Verify category deletion is handled properly when products exist',
        'Add validation for slug format on frontend'
      ]
    };

    console.log('📊 Categories table test completed');
    console.log(`Total errors: ${results.errors.length}`);

    return {
      success: results.errors.length === 0,
      message: `Categories table test completed with ${results.errors.length} errors`,
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
