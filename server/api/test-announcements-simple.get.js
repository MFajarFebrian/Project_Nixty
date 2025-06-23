import pool from '../utils/db';

/**
 * GET /api/test-announcements-simple
 * Simple test for announcements without authentication
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing announcements table...');
    
    const results = {
      tableExists: false,
      structure: null,
      sampleData: null,
      validationTest: null,
      enumTest: null,
      errors: []
    };

    // Test 1: Check if table exists and get structure
    try {
      const [columns] = await pool.execute('DESCRIBE announcements');
      results.tableExists = true;
      results.structure = columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        default: col.Default,
        extra: col.Extra || ''
      }));
      console.log('✅ Announcements table exists with', columns.length, 'columns');
    } catch (error) {
      results.errors.push(`Table check error: ${error.message}`);
      console.error('❌ Announcements table check failed:', error);
    }

    // Test 2: Get sample data
    try {
      const [rows] = await pool.execute(`
        SELECT *
        FROM announcements
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      results.sampleData = rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content ? row.content.substring(0, 100) + '...' : null,
        imageUrl: row.image_url,
        isNew: Boolean(row.is_new),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      console.log('✅ Retrieved', rows.length, 'sample announcements');
    } catch (error) {
      results.errors.push(`Sample data error: ${error.message}`);
      console.error('❌ Sample data retrieval failed:', error);
    }

    // Test 3: Test validation rules
    const testCases = [
      {
        name: 'Valid Announcement',
        data: {
          title: 'Test Announcement',
          content: 'This is a test announcement content',
          status: 'active',
          is_new: true
        },
        expected: true
      },
      {
        name: 'Minimal Valid Announcement',
        data: {
          title: 'Test'
        },
        expected: true
      },
      {
        name: 'Missing Required Title',
        data: {
          content: 'Content without title'
        },
        expected: false
      },
      {
        name: 'Title Too Short',
        data: {
          title: 'A'
        },
        expected: false
      },
      {
        name: 'Title Too Long',
        data: {
          title: 'A'.repeat(256)
        },
        expected: false
      },
      {
        name: 'Invalid Status',
        data: {
          title: 'Test',
          status: 'invalid_status'
        },
        expected: false
      }
    ];

    results.validationTest = [];
    
    // Import validation function
    const { validateRecordData } = await import('../utils/admin-validation.js');
    
    for (const testCase of testCases) {
      try {
        const validatedData = validateRecordData('announcements', testCase.data, false);
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

    // Test 4: Test enum values for status
    const statusValues = ['active', 'inactive', 'invalid'];
    results.enumTest = [];

    for (const status of statusValues) {
      try {
        validateRecordData('announcements', { title: 'Test', status }, false);
        results.enumTest.push({
          status,
          valid: true,
          expected: ['active', 'inactive'].includes(status)
        });
      } catch (error) {
        results.enumTest.push({
          status,
          valid: false,
          error: error.validationErrors || [error.message],
          expected: ['active', 'inactive'].includes(status)
        });
      }
    }

    // Test 5: Check boolean field handling
    try {
      const booleanTests = [
        { is_new: true },
        { is_new: false },
        { is_new: 1 },
        { is_new: 0 },
        { is_new: 'true' },
        { is_new: 'false' }
      ];

      results.booleanTest = [];
      for (const test of booleanTests) {
        try {
          const validated = validateRecordData('announcements', { title: 'Test', ...test }, false);
          results.booleanTest.push({
            input: test,
            output: validated,
            success: true
          });
        } catch (error) {
          results.booleanTest.push({
            input: test,
            success: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      results.errors.push(`Boolean test error: ${error.message}`);
    }

    // Summary
    const summary = {
      tableExists: results.tableExists,
      totalErrors: results.errors.length,
      sampleDataCount: results.sampleData?.length || 0,
      validationTestsPassed: results.validationTest?.filter(t => t.passed).length || 0,
      validationTestsTotal: results.validationTest?.length || 0,
      enumTestsValid: results.enumTest?.filter(t => t.valid === t.expected).length || 0,
      enumTestsTotal: results.enumTest?.length || 0
    };

    console.log('📊 Announcements test summary:', summary);

    return {
      success: results.errors.length === 0,
      message: `Announcements test completed with ${results.errors.length} errors`,
      summary,
      data: results
    };

  } catch (error) {
    console.error('❌ Announcements test failed:', error);
    
    return {
      success: false,
      message: 'Announcements table test failed',
      error: error.message,
      data: null
    };
  }
});
