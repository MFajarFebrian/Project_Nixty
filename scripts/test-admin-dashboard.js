/**
 * Test script for Admin Dashboard functionality
 * Run with: node scripts/test-admin-dashboard.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_ADMIN_EMAIL = 'admin@nixty.com';
const TEST_ADMIN_PASSWORD = 'admin123'; // This should match the hashed password in your database

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Test helper function
 */
function test(name, testFn) {
  return async () => {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      await testFn();
      testResults.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: name, error: error.message });
      console.log(`❌ FAILED: ${name} - ${error.message}`);
    }
  };
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test admin authentication
const testAdminAuth = test('Admin Authentication', async () => {
  const { response, data } = await makeRequest(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    })
  });
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Login should be successful');
  assert(data.user && data.user.account_type === 'admin', 'User should be admin');
  
  // Store admin headers for subsequent tests
  global.adminHeaders = {
    'x-user-id': data.user.id.toString(),
    'x-user-email': data.user.email
  };
});

// Test fetching tables list
const testFetchTables = test('Fetch Tables List', async () => {
  const { response, data } = await makeRequest(`${BASE_URL}/api/admin/tables`, {
    headers: global.adminHeaders
  });
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully fetch tables');
  assert(Array.isArray(data.tables), 'Tables should be an array');
  assert(data.tables.length > 0, 'Should have at least one table');
});

// Test fetching overview data
const testFetchOverview = test('Fetch Overview Data', async () => {
  const { response, data } = await makeRequest(`${BASE_URL}/api/admin/overview`, {
    headers: global.adminHeaders
  });
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully fetch overview');
  assert(data.data.statistics, 'Should have statistics');
  assert(Array.isArray(data.data.recentActivity), 'Recent activity should be an array');
  assert(data.data.tables, 'Should have tables info');
});

// Test fetching table data
const testFetchTableData = test('Fetch Table Data', async () => {
  const { response, data } = await makeRequest(`${BASE_URL}/api/admin/tables/users`, {
    headers: global.adminHeaders
  });
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully fetch table data');
  assert(Array.isArray(data.data.records), 'Records should be an array');
  assert(Array.isArray(data.data.columns), 'Columns should be an array');
  assert(data.data.pagination, 'Should have pagination info');
});

// Test creating a new record
const testCreateRecord = test('Create New Record', async () => {
  const testCategory = {
    name: 'Test Category',
    slug: 'test-category',
    description: 'A test category for admin dashboard testing'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/api/admin/tables/categories`, {
    method: 'POST',
    headers: global.adminHeaders,
    body: JSON.stringify(testCategory)
  });
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully create record');
  assert(data.data.id, 'Created record should have an ID');
  assert(data.data.name === testCategory.name, 'Name should match');
  
  // Store created record ID for update/delete tests
  global.testCategoryId = data.data.id;
});

// Test updating a record
const testUpdateRecord = test('Update Record', async () => {
  assert(global.testCategoryId, 'Test category should exist');
  
  const updateData = {
    description: 'Updated test category description'
  };
  
  const { response, data } = await makeRequest(
    `${BASE_URL}/api/admin/tables/categories/${global.testCategoryId}`,
    {
      method: 'PUT',
      headers: global.adminHeaders,
      body: JSON.stringify(updateData)
    }
  );
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully update record');
  assert(data.data.description === updateData.description, 'Description should be updated');
});

// Test validation errors
const testValidationErrors = test('Validation Errors', async () => {
  const invalidData = {
    name: '', // Empty name should fail validation
    slug: 'invalid slug with spaces' // Invalid slug format
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/api/admin/tables/categories`, {
    method: 'POST',
    headers: global.adminHeaders,
    body: JSON.stringify(invalidData)
  });
  
  assert(response.status === 400, `Expected status 400, got ${response.status}`);
  assert(data.success === false, 'Should fail validation');
  assert(data.data && data.data.errors, 'Should have validation errors');
});

// Test unauthorized access
const testUnauthorizedAccess = test('Unauthorized Access', async () => {
  const { response } = await makeRequest(`${BASE_URL}/api/admin/tables`);
  
  assert(response.status === 401, `Expected status 401, got ${response.status}`);
});

// Test invalid table name
const testInvalidTableName = test('Invalid Table Name', async () => {
  const { response } = await makeRequest(`${BASE_URL}/api/admin/tables/invalid_table`, {
    headers: global.adminHeaders
  });
  
  assert(response.status === 400, `Expected status 400, got ${response.status}`);
});

// Test deleting a record
const testDeleteRecord = test('Delete Record', async () => {
  assert(global.testCategoryId, 'Test category should exist');
  
  const { response, data } = await makeRequest(
    `${BASE_URL}/api/admin/tables/categories/${global.testCategoryId}`,
    {
      method: 'DELETE',
      headers: global.adminHeaders
    }
  );
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully delete record');
  assert(data.data.deletedRecord, 'Should return deleted record info');
});

// Test pagination
const testPagination = test('Pagination', async () => {
  const { response, data } = await makeRequest(
    `${BASE_URL}/api/admin/tables/users?page=1&limit=5`,
    {
      headers: global.adminHeaders
    }
  );
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully fetch paginated data');
  assert(data.data.pagination.page === 1, 'Should be on page 1');
  assert(data.data.pagination.limit === 5, 'Should have limit of 5');
});

// Test search functionality
const testSearch = test('Search Functionality', async () => {
  const { response, data } = await makeRequest(
    `${BASE_URL}/api/admin/tables/users?search=admin`,
    {
      headers: global.adminHeaders
    }
  );
  
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(data.success === true, 'Should successfully search records');
});

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Admin Dashboard Tests...\n');
  
  const tests = [
    testAdminAuth,
    testFetchTables,
    testFetchOverview,
    testFetchTableData,
    testCreateRecord,
    testUpdateRecord,
    testValidationErrors,
    testUnauthorizedAccess,
    testInvalidTableName,
    testDeleteRecord,
    testPagination,
    testSearch
  ];
  
  for (const testFn of tests) {
    await testFn();
  }
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🐛 Errors:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }
  
  console.log('\n✨ Admin Dashboard testing completed!');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
