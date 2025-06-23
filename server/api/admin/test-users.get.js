import pool from '../../utils/db';
import { validateRecordData } from '../../utils/admin-validation';

/**
 * GET /api/admin/test-users
 * Test users table CRUD operations
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Testing users table operations...');
    
    const results = {
      tableStructure: null,
      validationRules: null,
      createTest: null,
      updateTest: null,
      errors: []
    };
    
    // Test 1: Get table structure
    try {
      const [columns] = await pool.execute('DESCRIBE users');
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
          !['id', 'created_at'].includes(col.Field)
        ).map(col => col.Field)
      };
      console.log('✅ Table structure retrieved');
    } catch (error) {
      results.errors.push(`Table structure error: ${error.message}`);
    }
    
    // Test 2: Test validation rules
    try {
      // Test valid user data
      const validUserData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        account_type: 'user'
      };
      
      const validatedData = validateRecordData('users', validUserData, false);
      results.validationRules = {
        validData: validatedData,
        status: 'passed'
      };
      console.log('✅ Validation rules working');
      
      // Test invalid data
      try {
        const invalidUserData = {
          email: 'invalid-email',
          password: '123', // too short
          name: 'A' // too short
        };
        validateRecordData('users', invalidUserData, false);
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
    
    // Test 3: Test create operation (simulation)
    try {
      const createData = {
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Test Create User',
        account_type: 'user'
      };
      
      // Validate the data first
      const validatedCreateData = validateRecordData('users', createData, false);
      
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
    
    // Test 4: Test update operation (simulation)
    try {
      const updateData = {
        name: 'Updated Test User',
        account_type: 'admin'
        // Note: email and password not included for update
      };
      
      // Validate the data for update
      const validatedUpdateData = validateRecordData('users', updateData, true);
      
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
    
    // Test 5: Check for common issues
    const commonIssues = [];
    
    // Check if password hashing is handled
    if (!results.createTest?.validatedData?.password || 
        results.createTest?.validatedData?.password === 'testpassword123') {
      commonIssues.push('Password hashing may not be implemented in validation');
    }
    
    // Check required fields
    const requiredFields = results.tableStructure?.columns
      ?.filter(col => !col.nullable && !col.extra.includes('auto_increment'))
      ?.map(col => col.name) || [];
    
    results.analysis = {
      requiredFields,
      commonIssues,
      recommendations: [
        'Ensure password hashing is implemented in the PUT/POST endpoints',
        'Verify email uniqueness is checked before insert/update',
        'Consider adding client-side validation for better UX'
      ]
    };
    
    return {
      success: true,
      message: 'Users table test completed',
      results,
      summary: {
        totalTests: 4,
        passed: 4 - results.errors.length,
        failed: results.errors.length,
        status: results.errors.length === 0 ? 'ALL_PASSED' : 'SOME_FAILED'
      }
    };
    
  } catch (error) {
    console.error('Users table test error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Users table test failed: ${error.message}`
    });
  }
});
