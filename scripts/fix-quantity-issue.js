/**
 * Script to fix quantity issue in transactions
 * 
 * This script will:
 * 1. Add quantity column to transactions table
 * 2. Update existing transactions with quantity from JSON payload
 * 3. Verify the changes
 */

async function fixQuantityIssue() {
  try {
    console.log('🔧 Starting quantity issue fix...');
    
    // Make request to add quantity column
    const response = await fetch('http://localhost:3000/api/admin/add-quantity-column', {
      method: 'GET',
      headers: {
        'x-user-id': '6', // Admin user ID
        'x-user-email': 'admin@nixty.com' // Admin email
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
      
      if (result.action === 'column_added') {
        console.log(`📊 Updated ${result.existingTransactionsUpdated} existing transactions`);
      }
      
      // Verify changes by checking a few transactions
      console.log('\n🔍 Verifying changes...');
      
      const testResponse = await fetch('http://localhost:3000/api/admin/tables/transactions?pageSize=5', {
        headers: {
          'x-user-id': '6',
          'x-user-email': 'admin@nixty.com'
        }
      });
      
      const testResult = await testResponse.json();
      
      if (testResult.success && testResult.data.length > 0) {
        console.log('📋 Sample transactions:');
        testResult.data.forEach(transaction => {
          console.log(`  - Order ${transaction.order_id}: quantity = ${transaction.quantity || 'N/A'}`);
        });
      }
      
      console.log('\n🎉 Quantity issue fix completed successfully!');
      console.log('\n📝 What was fixed:');
      console.log('  • Added quantity column to transactions table');
      console.log('  • Updated existing transactions with quantity from JSON payload');
      console.log('  • Modified APIs to use quantity from database');
      console.log('  • Updated frontend to show quantity information');
      
    } else {
      console.error('❌ Failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing quantity issue:', error.message);
  }
}

// Run the fix
fixQuantityIssue();
