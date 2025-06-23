import pool from './db.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Comprehensive script to ensure website gets data from database tables
 * This script will:
 * 1. Create missing product-related tables
 * 2. Populate them with sample data
 * 3. Create API endpoints for data fetching
 * 4. Validate all required tables exist
 */

// Extended table definitions for e-commerce functionality
const tableDefinitions = {
  // Existing tables from validate-schema.js
  users: {
    required: true,
    columns: [
      'id', 'email', 'password', 'name', 'created_at', 
      'account_type', 'google_id', 'profile_picture',
      'reset_token', 'reset_token_expires'
    ]
  },
  transactions: {
    required: true,
    columns: [
      'id', 'order_id', 'product_name', 'email', 'amount', 
      'status', 'payment_method', 'va_number', 'created_at', 'updated_at'
    ]
  },
  
  // New product-related tables
  categories: {
    required: true,
    columns: ['id', 'name', 'slug', 'description', 'created_at'],
    createSQL: `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  
  products: {
    required: true,
    columns: [
      'id', 'name', 'description', 'short_description', 'price', 'period',
      'category_id', 'image_url', 'rating', 'is_new', 'discount_percentage',
      'time_left', 'is_featured', 'is_trending', 'status', 'created_at', 'updated_at'
    ],
    createSQL: `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price DECIMAL(10,2) NOT NULL,
        period VARCHAR(50), -- '/year', '/month', null for one-time
        category_id INT,
        image_url VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        is_new BOOLEAN DEFAULT FALSE,
        discount_percentage INT DEFAULT 0,
        time_left VARCHAR(50), -- '2d', '5h', etc.
        is_featured BOOLEAN DEFAULT FALSE,
        is_trending BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `
  },
  
  announcements: {
    required: true,
    columns: ['id', 'title', 'content', 'image_url', 'is_new', 'status', 'created_at', 'updated_at'],
    createSQL: `
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image_url VARCHAR(500),
        is_new BOOLEAN DEFAULT TRUE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  
  hero_slides: {
    required: true,
    columns: [
      'id', 'title', 'description', 'background_image_url', 'product_id',
      'rating', 'is_new', 'status', 'sort_order', 'created_at', 'updated_at'
    ],
    createSQL: `
      CREATE TABLE IF NOT EXISTS hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        background_image_url VARCHAR(500),
        product_id INT,
        rating DECIMAL(2,1) DEFAULT 0,
        is_new BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `
  },
  
  deals: {
    required: true,
    columns: [
      'id', 'title', 'description', 'product_id', 'old_price', 'new_price',
      'discount_percentage', 'badge', 'background_image_url', 'is_featured',
      'status', 'expires_at', 'created_at', 'updated_at'
    ],
    createSQL: `
      CREATE TABLE IF NOT EXISTS deals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        product_id INT,
        old_price DECIMAL(10,2),
        new_price DECIMAL(10,2) NOT NULL,
        discount_percentage INT,
        badge VARCHAR(100), -- 'Limited Time', 'Hot Deal', etc.
        background_image_url VARCHAR(500),
        is_featured BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `
  }
};

/**
 * Check if all required tables exist with correct structure
 */
async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  try {
    // Check if tables exist
    const [tables] = await pool.execute('SHOW TABLES FROM nixty');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    const requiredTables = Object.keys(tableDefinitions);
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      return { valid: false, missingTables };
    }
    
    // Validate table structures
    const missingColumns = {};
    
    for (const [tableName, definition] of Object.entries(tableDefinitions)) {
      if (definition.columns) {
        const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
        const columnNames = columns.map(col => col.Field);
        const missing = definition.columns.filter(col => !columnNames.includes(col));
        
        if (missing.length > 0) {
          missingColumns[tableName] = missing;
        }
      }
    }
    
    if (Object.keys(missingColumns).length > 0) {
      console.log('⚠️  Missing columns:', missingColumns);
      return { valid: false, missingColumns };
    }
    
    console.log('✅ Database schema validation successful!');
    return { valid: true };
    
  } catch (error) {
    console.error('❌ Error validating database schema:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Create missing tables
 */
async function createMissingTables(missingTables) {
  console.log('🔨 Creating missing tables...');
  
  try {
    for (const tableName of missingTables) {
      const definition = tableDefinitions[tableName];
      if (definition.createSQL) {
        console.log(`Creating table: ${tableName}`);
        await pool.execute(definition.createSQL);
        console.log(`✅ Created table: ${tableName}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  }
}

/**
 * Populate tables with sample data
 */
async function populateSampleData() {
  console.log('📝 Populating sample data...');
  
  try {
    // Insert categories
    const categories = [
      ['Office 365', 'office365', 'Microsoft Office 365 products and services'],
      ['Windows', 'windows', 'Windows operating systems and related products'],
      ['Email Services', 'email', 'Business email solutions and services'],
      ['Security', 'security', 'Security software and antivirus solutions']
    ];
    
    for (const [name, slug, description] of categories) {
      await pool.execute(
        'INSERT IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [name, slug, description]
      );
    }
    
    // Insert products (sample data from home.vue)
    const products = [
      ['Office 365 Personal', 'Premium Office apps for 1 person', 'Complete productivity suite', 69.99, '/ year', 1, '/api/products/1/image', 4.8, 0, 0, '2d', 0, 0],
      ['Office 365 Business', 'Complete business productivity suite', 'Advanced business tools', 149.99, '/ year', 1, '/api/products/2/image', 4.7, 1, 25, null, 0, 0],
      ['Windows 11 Pro', 'Professional operating system', 'Enhanced security and productivity', 199.99, null, 2, '/api/products/3/image', 4.6, 0, 0, null, 0, 0],
      ['Business Email Standard', '50GB storage with advanced security', 'Professional email solution', 7.99, '/ month', 3, '/api/products/4/image', 4.5, 0, 15, '5d', 0, 0],
      ['Windows 11 Home', 'Perfect for home users and students', 'User-friendly operating system', 139.99, null, 2, '/api/products/5/image', 4.4, 0, 20, null, 0, 0],
      ['Business Email Premium', '100GB storage with advanced analytics', 'Enterprise email solution', 12.99, '/ month', 3, '/api/products/6/image', 4.7, 1, 0, null, 0, 0],
      ['Windows Defender Pro', 'Advanced security for Windows systems', 'Professional security suite', 49.99, '/ year', 4, '/api/products/7/image', 4.6, 1, 0, '3d', 0, 0],
      ['Microsoft Antivirus Suite', 'Complete protection for all devices', 'Comprehensive security solution', 79.99, '/ year', 4, '/api/products/8/image', 4.8, 0, 30, null, 0, 0]
    ];
    
    for (const productData of products) {
      await pool.execute(
        `INSERT IGNORE INTO products 
         (name, description, short_description, price, period, category_id, image_url, rating, is_new, discount_percentage, time_left, is_featured, is_trending) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        productData
      );
    }
    
    console.log('✅ Sample data populated successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupDatabaseIntegration() {
  console.log('🚀 Starting database integration setup...\n');
  
  try {
    // Step 1: Validate current schema
    const validation = await validateDatabaseSchema();
    
    if (!validation.valid) {
      if (validation.missingTables) {
        // Step 2: Create missing tables
        const created = await createMissingTables(validation.missingTables);
        if (!created) {
          throw new Error('Failed to create missing tables');
        }
      }
      
      if (validation.missingColumns) {
        console.log('⚠️  Some columns are missing. Please update table structures manually.');
        console.log('Missing columns:', validation.missingColumns);
      }
    }
    
    // Step 3: Populate with sample data
    await populateSampleData();
    
    // Step 4: Final validation
    const finalValidation = await validateDatabaseSchema();
    if (finalValidation.valid) {
      console.log('\n🎉 Database integration setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Run API endpoint creation script');
      console.log('2. Update Vue components to use API data');
      console.log('3. Test data fetching functionality');
      return true;
    } else {
      throw new Error('Final validation failed');
    }
    
  } catch (error) {
    console.error('\n❌ Database integration setup failed:', error);
    return false;
  }
}

// Export functions for use in other scripts
export { 
  validateDatabaseSchema, 
  createMissingTables, 
  populateSampleData, 
  setupDatabaseIntegration,
  tableDefinitions 
};

// Run setup if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupDatabaseIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}
