import pool from '../../utils/db';
import { validateRecordData } from '../../utils/admin-validation';

/**
 * GET /api/admin/test-products
 * Test products table CRUD operations
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing products table operations...');
    
    const results = {
      tableStructure: null,
      validationRules: null,
      createTest: null,
      updateTest: null,
      categoryTest: null,
      errors: []
    };
    
    // Test 1: Get table structure
    try {
      const [columns] = await pool.execute('DESCRIBE products');
      results.tableStructure = {
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default,
          extra: col.Extra
        })),
        editableColumns: columns.filter(col => 
          !['id', 'created_at', 'updated_at'].includes(col.Field)
        ).map(col => col.Field)
      };
      console.log('✅ Table structure retrieved');
    } catch (error) {
      results.errors.push(`Table structure error: ${error.message}`);
    }
    
    // Test 2: Check categories for foreign key
    try {
      const [categories] = await pool.execute('SELECT id, name FROM categories LIMIT 5');
      results.categoryTest = {
        available: categories.length > 0,
        categories: categories,
        note: categories.length > 0 ? 'Categories available for FK' : 'No categories found - create some first'
      };
      console.log(`✅ Found ${categories.length} categories`);
    } catch (error) {
      results.errors.push(`Category test error: ${error.message}`);
    }
    
    // Test 3: Test validation rules
    try {
      // Test valid product data
      const validProductData = {
        name: 'Test Product',
        price: 99.99,
        description: 'This is a test product description',
        short_description: 'Test product',
        version: '1.0',
        currency: 'IDR',
        status: 'active',
        category_id: results.categoryTest?.categories?.[0]?.id || 1
      };
      
      const validatedData = validateRecordData('products', validProductData, false);
      results.validationRules = {
        validData: validatedData,
        status: 'passed'
      };
      console.log('✅ Validation rules working');
      
      // Test invalid data
      try {
        const invalidProductData = {
          name: 'A', // too short
          price: -10, // negative price
          status: 'invalid_status' // invalid enum
        };
        validateRecordData('products', invalidProductData, false);
        results.validationRules.invalidTest = 'Should have failed but passed';
      } catch (validationError) {
        results.validationRules.invalidTest = {
          errors: validationError.validationErrors || [validationError.message],
          status: 'correctly_failed'
        };
        console.log('✅ Validation correctly rejects invalid data');
      }
      
    } catch (error) {
      results.errors.push(`Validation test error: ${error.message}`);
    }
    
    // Test 4: Test create operation (simulation)
    try {
      const createData = {
        name: `Test Product ${Date.now()}`,
        price: 149.99,
        description: 'This is a comprehensive test product with all fields',
        short_description: 'Complete test product',
        version: '2.0',
        currency: 'IDR',
        period: '/month',
        category_id: results.categoryTest?.categories?.[0]?.id || 1,
        image_url: '/uploads/admin/test-image.jpg',
        is_new: true,
        discount_percentage: 10,
        time_left: '5d',
        is_featured: false,
        is_trending: true,
        status: 'active'
      };
      
      // Validate the data first
      const validatedCreateData = validateRecordData('products', createData, false);
      
      results.createTest = {
        originalData: createData,
        validatedData: validatedCreateData,
        status: 'validation_passed',
        note: 'Create validation successful - actual DB insert not performed in test'
      };
      console.log('✅ Create operation validation passed');
      
    } catch (error) {
      results.errors.push(`Create test error: ${error.message}`);
    }
    
    // Test 5: Test update operation (simulation)
    try {
      const updateData = {
        name: 'Updated Test Product',
        price: 199.99,
        discount_percentage: 20,
        is_featured: true,
        status: 'inactive'
        // Note: not all fields included for update
      };
      
      // Validate the data for update
      const validatedUpdateData = validateRecordData('products', updateData, true);
      
      results.updateTest = {
        originalData: updateData,
        validatedData: validatedUpdateData,
        status: 'validation_passed',
        note: 'Update validation successful - actual DB update not performed in test'
      };
      console.log('✅ Update operation validation passed');
      
    } catch (error) {
      results.errors.push(`Update test error: ${error.message}`);
    }
    
    // Test 6: Check for common issues
    const commonIssues = [];
    
    // Check required fields
    const requiredFields = results.tableStructure?.columns
      ?.filter(col => !col.nullable && !col.extra.includes('auto_increment') && !col.default)
      ?.map(col => col.name) || [];
    
    // Check boolean fields
    const booleanFields = results.tableStructure?.columns
      ?.filter(col => col.type.includes('tinyint(1)'))
      ?.map(col => col.name) || [];
    
    // Check enum fields
    const enumFields = results.tableStructure?.columns
      ?.filter(col => col.type.includes('enum'))
      ?.map(col => ({ name: col.name, type: col.type })) || [];
    
    results.analysis = {
      requiredFields,
      booleanFields,
      enumFields,
      commonIssues,
      recommendations: [
        'Ensure category dropdown is populated with existing categories',
        'Verify image upload functionality works for image_url field',
        'Test boolean field toggles (is_new, is_featured, is_trending)',
        'Verify price validation accepts decimal values',
        'Test status enum dropdown with correct options'
      ]
    };
    
    return {
      success: true,
      message: 'Products table test completed',
      results,
      summary: {
        totalTests: 5,
        passed: 5 - results.errors.length,
        failed: results.errors.length,
        status: results.errors.length === 0 ? 'ALL_PASSED' : 'SOME_FAILED'
      }
    };
    
  } catch (error) {
    console.error('Products table test error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Products table test failed: ${error.message}`
    });
  }
});
