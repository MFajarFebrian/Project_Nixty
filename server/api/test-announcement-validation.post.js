import { validateRecordData } from '../utils/admin-validation';

/**
 * POST /api/test-announcement-validation
 * Test announcement validation without database operations
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Testing announcement validation with data:', body);
    
    const results = {
      input: body,
      validation: null,
      errors: []
    };

    // Test different scenarios
    const testCases = [
      {
        name: 'Valid Complete Announcement',
        data: {
          title: 'New Product Launch',
          content: 'We are excited to announce the launch of our new product with amazing features.',
          image_url: '/uploads/admin/announcement.jpg',
          is_new: true,
          status: 'active'
        }
      },
      {
        name: 'Minimal Valid Announcement',
        data: {
          title: 'Simple Announcement'
        }
      },
      {
        name: 'Announcement with Image Upload',
        data: {
          title: 'Image Test',
          content: 'Testing image upload functionality',
          image_url: '/uploads/admin/1750408616749-0fe63228.jpg'
        }
      },
      {
        name: 'Announcement with External Image',
        data: {
          title: 'External Image Test',
          content: 'Testing external image URL',
          image_url: 'https://example.com/image.jpg'
        }
      },
      {
        name: 'Missing Required Title',
        data: {
          content: 'Content without title',
          status: 'active'
        }
      },
      {
        name: 'Title Too Short',
        data: {
          title: 'A'
        }
      },
      {
        name: 'Title Too Long',
        data: {
          title: 'A'.repeat(256)
        }
      },
      {
        name: 'Invalid Status',
        data: {
          title: 'Test Announcement',
          status: 'published'
        }
      },
      {
        name: 'Boolean Field Tests',
        data: {
          title: 'Boolean Test',
          is_new: false
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
        const validatedData = validateRecordData('announcements', testCase.data, false);
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
        { value: 'Valid Title', expected: true },
        { value: 'A', expected: false }, // Too short
        { value: '', expected: false }, // Empty
        { value: 'A'.repeat(256), expected: false } // Too long
      ],
      status: [
        { value: 'active', expected: true },
        { value: 'inactive', expected: true },
        { value: 'published', expected: false },
        { value: 'draft', expected: false }
      ],
      is_new: [
        { value: true, expected: true },
        { value: false, expected: true },
        { value: 1, expected: true },
        { value: 0, expected: true }
      ],
      image_url: [
        { value: '/uploads/admin/test.jpg', expected: true },
        { value: 'https://example.com/image.png', expected: true },
        { value: '', expected: true }, // Empty is allowed
        { value: null, expected: true } // Null is allowed
      ]
    };

    const fieldTestResults = {};
    
    for (const [field, tests] of Object.entries(fieldTests)) {
      fieldTestResults[field] = [];
      
      for (const test of tests) {
        try {
          const testData = { title: 'Test Title' }; // Base valid data
          testData[field] = test.value;
          
          validateRecordData('announcements', testData, false);
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
      message: 'Announcement validation test completed',
      data: {
        testResults,
        fieldTestResults,
        validationRules: {
          required: ['title'],
          minLength: { title: 2 },
          maxLength: { title: 255, image_url: 500 },
          enum: { status: ['active', 'inactive'] }
        },
        summary: {
          totalTests: testResults.length,
          passedTests: testResults.filter(t => t.success).length,
          failedTests: testResults.filter(t => !t.success).length
        }
      }
    };

  } catch (error) {
    console.error('❌ Announcement validation test failed:', error);
    
    return {
      success: false,
      message: 'Announcement validation test failed',
      error: error.message,
      data: null
    };
  }
});
