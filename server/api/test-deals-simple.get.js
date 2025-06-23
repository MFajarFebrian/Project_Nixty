import pool from '../utils/db';

/**
 * GET /api/test-deals-simple
 * Simple test for deals without authentication
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing deals table...');
    
    const results = {
      tableExists: false,
      structure: null,
      sampleData: null,
      validationTest: null,
      foreignKeyTest: null,
      errors: []
    };

    // Test 1: Check if table exists and get structure
    try {
      const [columns] = await pool.execute('DESCRIBE deals');
      results.tableExists = true;
      results.structure = columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        default: col.Default,
        extra: col.Extra || ''
      }));
      console.log('✅ Deals table exists with', columns.length, 'columns');
    } catch (error) {
      results.errors.push(`Table check error: ${error.message}`);
      console.error('❌ Deals table check failed:', error);
    }

    // Test 2: Get sample data with product relationships
    try {
      const [rows] = await pool.execute(`
        SELECT 
          d.*,
          p.name as product_name,
          p.version as product_version
        FROM deals d
        LEFT JOIN products p ON d.product_id = p.id
        ORDER BY d.created_at DESC
        LIMIT 5
      `);
      
      results.sampleData = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description ? row.description.substring(0, 100) + '...' : null,
        productId: row.product_id,
        productName: row.product_name,
        productVersion: row.product_version,
        oldPrice: row.old_price,
        newPrice: row.new_price,
        discountPercentage: row.discount_percentage,
        badge: row.badge,
        backgroundImageUrl: row.background_image_url,
        isFeatured: Boolean(row.is_featured),
        status: row.status,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      console.log('✅ Retrieved', rows.length, 'sample deals');
    } catch (error) {
      results.errors.push(`Sample data error: ${error.message}`);
      console.error('❌ Sample data retrieval failed:', error);
    }

    // Test 3: Test validation rules
    const testCases = [
      {
        name: 'Valid Complete Deal',
        data: {
          title: 'Special Offer',
          description: 'Limited time offer',
          product_id: 1,
          old_price: 100000,
          new_price: 80000,
          discount_percentage: 20,
          badge: 'Hot Deal',
          is_featured: true,
          status: 'active'
        },
        expected: true
      },
      {
        name: 'Minimal Valid Deal',
        data: {
          title: 'Simple Deal',
          new_price: 50000
        },
        expected: true
      },
      {
        name: 'Missing Required Title',
        data: {
          new_price: 50000
        },
        expected: false
      },
      {
        name: 'Missing Required New Price',
        data: {
          title: 'Deal without price'
        },
        expected: false
      },
      {
        name: 'Negative New Price',
        data: {
          title: 'Invalid Price Deal',
          new_price: -1000
        },
        expected: false
      },
      {
        name: 'Invalid Status',
        data: {
          title: 'Status Test',
          new_price: 50000,
          status: 'published'
        },
        expected: false
      },
      {
        name: 'Title Too Short',
        data: {
          title: 'A',
          new_price: 50000
        },
        expected: false
      },
      {
        name: 'Badge Too Long',
        data: {
          title: 'Badge Test',
          new_price: 50000,
          badge: 'A'.repeat(101)
        },
        expected: false
      }
    ];

    results.validationTest = [];
    
    // Import validation function
    const { validateRecordData } = await import('../utils/admin-validation.js');
    
    for (const testCase of testCases) {
      try {
        const validatedData = validateRecordData('deals', testCase.data, false);
        results.validationTest.push({
          name: testCase.name,
          input: testCase.data,
          success: true,
          output: validatedData,
          expected: testCase.expected,
          passed: testCase.expected === true
        });
      } catch (error) {
        results.validationTest.push({
          name: testCase.name,
          input: testCase.data,
          success: false,
          error: error.message,
          validationErrors: error.validationErrors || [],
          expected: testCase.expected,
          passed: testCase.expected === false
        });
      }
    }

    const passedValidationTests = results.validationTest.filter(t => t.passed).length;
    console.log(`✅ Validation tests: ${passedValidationTests}/${testCases.length} passed`);

    // Test 4: Test foreign key relationship with products
    try {
      const [products] = await pool.execute(`
        SELECT id, name, version, status
        FROM products 
        WHERE status = 'active'
        ORDER BY name
        LIMIT 5
      `);

      const [dealsWithProducts] = await pool.execute(`
        SELECT 
          d.id,
          d.title,
          d.product_id,
          p.name as product_name,
          p.status as product_status
        FROM deals d
        INNER JOIN products p ON d.product_id = p.id
        LIMIT 5
      `);

      results.foreignKeyTest = {
        availableProducts: products,
        dealsWithProducts: dealsWithProducts,
        hasValidRelationships: dealsWithProducts.every(deal => deal.product_status === 'active')
      };
      console.log('✅ Foreign key relationship test completed');

    } catch (error) {
      results.foreignKeyTest = {
        error: error.message
      };
      results.errors.push(`Foreign key test error: ${error.message}`);
      console.error('❌ Foreign key test failed:', error);
    }

    // Test 5: Test enum values and numeric fields
    const enumStatusTests = ['active', 'inactive', 'expired', 'invalid'];
    results.enumTest = [];

    for (const status of enumStatusTests) {
      try {
        validateRecordData('deals', { title: 'Test', new_price: 1000, status }, false);
        results.enumTest.push({
          status,
          valid: true,
          expected: ['active', 'inactive', 'expired'].includes(status)
        });
      } catch (error) {
        results.enumTest.push({
          status,
          valid: false,
          error: error.validationErrors || [error.message],
          expected: ['active', 'inactive', 'expired'].includes(status)
        });
      }
    }

    // Summary
    const summary = {
      tableExists: results.tableExists,
      totalErrors: results.errors.length,
      sampleDataCount: results.sampleData?.length || 0,
      validationTestsPassed: results.validationTest?.filter(t => t.passed).length || 0,
      validationTestsTotal: results.validationTest?.length || 0,
      enumTestsValid: results.enumTest?.filter(t => t.valid === t.expected).length || 0,
      enumTestsTotal: results.enumTest?.length || 0,
      hasProductRelationships: results.foreignKeyTest?.dealsWithProducts?.length > 0
    };

    console.log('📊 Deals test summary:', summary);

    return {
      success: results.errors.length === 0,
      message: `Deals test completed with ${results.errors.length} errors`,
      summary,
      data: results
    };

  } catch (error) {
    console.error('❌ Deals test failed:', error);
    
    return {
      success: false,
      message: 'Deals table test failed',
      error: error.message,
      data: null
    };
  }
});
