import { validateRecordData } from '../utils/admin-validation';

/**
 * POST /api/test-deal-validation
 * Test deal validation without database operations
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Testing deal validation with data:', body);
    
    const results = {
      input: body,
      validation: null,
      errors: []
    };

    // Test different scenarios
    const testCases = [
      {
        name: 'Valid Complete Deal',
        data: {
          title: 'Microsoft Office Special Deal',
          description: 'Get Microsoft Office at the best price',
          product_id: 1,
          old_price: 150000,
          new_price: 120000,
          discount_percentage: 20,
          badge: 'Best Seller',
          background_image_url: '/uploads/admin/deal-bg.jpg',
          is_featured: true,
          status: 'active',
          expires_at: '2025-12-31 23:59:59'
        }
      },
      {
        name: 'Minimal Valid Deal',
        data: {
          title: 'Simple Deal',
          new_price: 50000
        }
      },
      {
        name: 'Deal with External Image',
        data: {
          title: 'External Image Deal',
          new_price: 75000,
          background_image_url: 'https://example.com/deal-bg.jpg'
        }
      },
      {
        name: 'Deal without Product Link',
        data: {
          title: 'Standalone Deal',
          description: 'Deal not linked to specific product',
          old_price: 100000,
          new_price: 80000,
          badge: 'Hot Deal',
          status: 'active'
        }
      },
      {
        name: 'Missing Required Title',
        data: {
          new_price: 50000,
          status: 'active'
        }
      },
      {
        name: 'Missing Required New Price',
        data: {
          title: 'Deal without price',
          description: 'This should fail'
        }
      },
      {
        name: 'Title Too Short',
        data: {
          title: 'A',
          new_price: 50000
        }
      },
      {
        name: 'Title Too Long',
        data: {
          title: 'A'.repeat(256),
          new_price: 50000
        }
      },
      {
        name: 'Negative New Price',
        data: {
          title: 'Invalid Price Deal',
          new_price: -1000
        }
      },
      {
        name: 'Zero New Price',
        data: {
          title: 'Zero Price Deal',
          new_price: 0
        }
      },
      {
        name: 'Invalid Status',
        data: {
          title: 'Status Test Deal',
          new_price: 50000,
          status: 'published'
        }
      },
      {
        name: 'Badge Too Long',
        data: {
          title: 'Badge Test Deal',
          new_price: 50000,
          badge: 'A'.repeat(101)
        }
      },
      {
        name: 'User Input Data',
        data: body || {}
      }
    ];

    const testResults = [];

    for (const testCase of testCases) {
      try {
        const validatedData = validateRecordData('deals', testCase.data, false);
        testResults.push({
          name: testCase.name,
          input: testCase.data,
          success: true,
          output: validatedData
        });
      } catch (error) {
        testResults.push({
          name: testCase.name,
          input: testCase.data,
          success: false,
          error: error.message,
          validationErrors: error.validationErrors || []
        });
      }
    }

    // Test specific field validations
    const fieldTests = {
      title: [
        { value: 'Valid Deal Title', expected: true },
        { value: 'A', expected: false }, // Too short
        { value: '', expected: false }, // Empty
        { value: 'A'.repeat(256), expected: false } // Too long
      ],
      new_price: [
        { value: 1000, expected: true },
        { value: 0, expected: false }, // Should be positive
        { value: -100, expected: false }, // Should be positive
        { value: 99.99, expected: true } // Decimal allowed
      ],
      old_price: [
        { value: 1500, expected: true },
        { value: 0, expected: true }, // Can be 0
        { value: null, expected: true }, // Can be null
        { value: -100, expected: true } // No positive validation for old_price
      ],
      status: [
        { value: 'active', expected: true },
        { value: 'inactive', expected: true },
        { value: 'expired', expected: true },
        { value: 'published', expected: false },
        { value: 'draft', expected: false }
      ],
      badge: [
        { value: 'Hot Deal', expected: true },
        { value: 'A'.repeat(100), expected: true }, // Max length
        { value: 'A'.repeat(101), expected: false }, // Too long
        { value: '', expected: true }, // Empty allowed
        { value: null, expected: true } // Null allowed
      ],
      discount_percentage: [
        { value: 25, expected: true },
        { value: 0, expected: true },
        { value: 100, expected: true },
        { value: -10, expected: true }, // No validation for negative
        { value: 150, expected: true } // No max validation
      ],
      is_featured: [
        { value: true, expected: true },
        { value: false, expected: true },
        { value: 1, expected: true },
        { value: 0, expected: true }
      ]
    };

    const fieldTestResults = {};
    
    for (const [field, tests] of Object.entries(fieldTests)) {
      fieldTestResults[field] = [];
      
      for (const test of tests) {
        try {
          const testData = { title: 'Test Deal', new_price: 1000 }; // Base valid data
          testData[field] = test.value;
          
          validateRecordData('deals', testData, false);
          fieldTestResults[field].push({
            value: test.value,
            expected: test.expected,
            actual: true,
            passed: test.expected === true
          });
        } catch (error) {
          fieldTestResults[field].push({
            value: test.value,
            expected: test.expected,
            actual: false,
            passed: test.expected === false,
            error: error.validationErrors || [error.message]
          });
        }
      }
    }

    return {
      success: true,
      message: 'Deal validation test completed',
      data: {
        testResults,
        fieldTestResults,
        validationRules: {
          required: ['title', 'new_price'],
          minLength: { title: 2 },
          maxLength: { title: 255, badge: 100, background_image_url: 500 },
          numeric: ['old_price', 'new_price', 'discount_percentage'],
          positiveNumber: ['new_price'],
          enum: { status: ['active', 'inactive', 'expired'] }
        },
        summary: {
          totalTests: testResults.length,
          passedTests: testResults.filter(t => t.success).length,
          failedTests: testResults.filter(t => !t.success).length
        }
      }
    };

  } catch (error) {
    console.error('❌ Deal validation test failed:', error);
    
    return {
      success: false,
      message: 'Deal validation test failed',
      error: error.message,
      data: null
    };
  }
});
