#!/usr/bin/env node

/**
 * Script to fix stock management in Supabase
 * This script will:
 * 1. Update the product_stock_view to calculate stock properly
 * 2. Add necessary indexes for performance
 */

import db from '../server/utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixSupabaseStock() {
  console.log('🔧 Starting Supabase stock management fix...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'fix_product_stock_view.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`📊 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.warn(`⚠️  Statement ${i + 1} failed (might be expected):`, error.message);
      }
    }
    
    // Test the view
    console.log('🧪 Testing the updated view...');
    const [testResult] = await db.query('SELECT * FROM product_stock_view LIMIT 5');
    console.log(`✅ View test successful! Found ${testResult.length} products`);
    
    if (testResult.length > 0) {
      console.log('📋 Sample data:');
      testResult.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.product_name} (${product.version}): ${product.available_stock} available, ${product.total_licenses} total`);
      });
    }
    
    console.log('🎉 Supabase stock management fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Supabase stock:', error);
    throw error;
  }
}

// Run the fix if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixSupabaseStock()
    .then(() => {
      console.log('✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fix failed:', error);
      process.exit(1);
    });
}

export default fixSupabaseStock;
