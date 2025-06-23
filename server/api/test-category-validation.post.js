import { validateRecordData } from '../utils/admin-validation';

/**
 * POST /api/test-category-validation
 * Test category validation without database operations
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Testing category validation with data:', body);
    
    const results = {
      input: body,
      validation: null,
      errors: []
    };

    // Test different scenarios
    const testCases = [
      {
        name: 'Valid Category',
        data: {
          name: 'Test Category',
          slug: 'test-category',
          description: 'This is a test category'
        }
      },
      {
        name: 'Minimal Valid Category',
        data: {
          name: 'Test',
          slug: 'test'
        }
      },
      {
        name: 'Missing Required Fields',
        data: {
          description: 'Only description'
        }
      },
      {
        name: 'Invalid Slug Format',
        data: {
          name: 'Test Category',
          slug: 'Invalid Slug With Spaces'
        }
      },
      {
        name: 'Empty Required Fields',
        data: {
          name: '',
          slug: ''
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
        const validatedData = validateRecordData('categories', testCase.data, false);
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

    // Test slug validation specifically
    const slugTests = [
      'valid-slug',
      'valid-slug-123',
      'microsoft-office',
      'Invalid Slug',
      'invalid_slug',
      'INVALID-SLUG',
      'invalid@slug',
      '',
      '-invalid-start',
      'invalid-end-'
    ];

    const slugResults = [];
    for (const slug of slugTests) {
      try {
        validateRecordData('categories', { name: 'Test', slug }, false);
        slugResults.push({ slug, valid: true });
      } catch (error) {
        slugResults.push({ 
          slug, 
          valid: false, 
          errors: error.validationErrors || [error.message] 
        });
      }
    }

    return {
      success: true,
      message: 'Category validation test completed',
      data: {
        testResults,
        slugResults,
        validationRules: {
          required: ['name', 'slug'],
          minLength: { name: 2, slug: 2 },
          maxLength: { name: 255, slug: 255 },
          slug: ['slug']
        }
      }
    };

  } catch (error) {
    console.error('❌ Category validation test failed:', error);
    
    return {
      success: false,
      message: 'Category validation test failed',
      error: error.message,
      data: null
    };
  }
});
