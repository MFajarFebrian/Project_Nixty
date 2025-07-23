import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Initializing database...');
    
    // Test basic connection
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('✓ Database connection test passed');
    
    // Check if nixty schema exists
    const [schemaResult] = await pool.query(`
      SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'nixty'
    `);
    
    if (schemaResult.length === 0) {
      console.log('Creating nixty schema...');
      await pool.query('CREATE SCHEMA IF NOT EXISTS nixty');
      console.log('✓ Created nixty schema');
    } else {
      console.log('✓ nixty schema already exists');
    }
    
    // Check if users table exists
    const [usersTableResult] = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'nixty' AND table_name = 'users'
    `);
    
    if (usersTableResult.length === 0) {
      console.log('Creating users table...');
      await pool.query(`
        CREATE TABLE nixty.users (
          id SERIAL PRIMARY KEY,
          email VARCHAR NOT NULL UNIQUE,
          password VARCHAR NOT NULL,
          name VARCHAR,
          created_at TIMESTAMPTZ DEFAULT now(),
          account_type TEXT NOT NULL DEFAULT 'user' CHECK (account_type IN ('user', 'admin')),
          google_id VARCHAR,
          profile_picture VARCHAR,
          reset_token VARCHAR,
          reset_token_expires TIMESTAMPTZ
        )
      `);
      console.log('✓ Created users table');
    } else {
      console.log('✓ users table already exists');
      
      // Check if required columns exist
      const [columnsResult] = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'nixty' AND table_name = 'users'
      `);
      
      const existingColumns = columnsResult.map(row => row.column_name);
      console.log('Existing columns in users table:', existingColumns);
      
      // Add missing columns
      const requiredColumns = [
        { name: 'google_id', type: 'VARCHAR' },
        { name: 'profile_picture', type: 'VARCHAR' },
        { name: 'reset_token', type: 'VARCHAR' },
        { name: 'reset_token_expires', type: 'TIMESTAMPTZ' }
      ];
      
      for (const column of requiredColumns) {
        if (!existingColumns.includes(column.name)) {
          console.log(`Adding ${column.name} column...`);
          await pool.query(`
            ALTER TABLE nixty.users ADD COLUMN ${column.name} ${column.type}
          `);
          console.log(`✓ Added ${column.name} column`);
        }
      }
    }
    
    // Check if categories table exists
    const [categoriesTableResult] = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'nixty' AND table_name = 'categories'
    `);
    
    if (categoriesTableResult.length === 0) {
      console.log('Creating categories table...');
      await pool.query(`
        CREATE TABLE nixty.categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          slug VARCHAR NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      console.log('✓ Created categories table');
    } else {
      console.log('✓ categories table already exists');
      
      // Check if required columns exist
      const [categoriesColumnsResult] = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'nixty' AND table_name = 'categories'
      `);
      
      const existingCategoriesColumns = categoriesColumnsResult.map(row => row.column_name);
      console.log('Existing columns in categories table:', existingCategoriesColumns);
      
      // Add missing columns
      const requiredCategoriesColumns = [
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT now()' }
      ];
      
      for (const column of requiredCategoriesColumns) {
        if (!existingCategoriesColumns.includes(column.name)) {
          console.log(`Adding ${column.name} column to categories...`);
          await pool.query(`
            ALTER TABLE nixty.categories ADD COLUMN ${column.name} ${column.type}
          `);
          console.log(`✓ Added ${column.name} column to categories`);
        }
      }
    }
    
    // Check if products table exists
    const [productsTableResult] = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'nixty' AND table_name = 'products'
    `);
    
    if (productsTableResult.length === 0) {
      console.log('Creating products table...');
      await pool.query(`
        CREATE TABLE nixty.products (
          id SERIAL PRIMARY KEY,
          category_id INTEGER REFERENCES nixty.categories(id) ON DELETE SET NULL,
          name VARCHAR NOT NULL,
          slug VARCHAR NOT NULL,
          description TEXT,
          price NUMERIC NOT NULL,
          image_url VARCHAR,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      console.log('✓ Created products table');
    } else {
      console.log('✓ products table already exists');
      
      // Check if required columns exist
      const [productsColumnsResult] = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'nixty' AND table_name = 'products'
      `);
      
      const existingProductsColumns = productsColumnsResult.map(row => row.column_name);
      console.log('Existing columns in products table:', existingProductsColumns);
      
      // Add missing columns
      const requiredProductsColumns = [
        { name: 'slug', type: 'VARCHAR' },
        { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT now()' }
      ];
      
      for (const column of requiredProductsColumns) {
        if (!existingProductsColumns.includes(column.name)) {
          console.log(`Adding ${column.name} column to products...`);
          await pool.query(`
            ALTER TABLE nixty.products ADD COLUMN ${column.name} ${column.type}
          `);
          console.log(`✓ Added ${column.name} column to products`);
        }
      }
    }
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert categories
    await pool.query(`
      INSERT INTO nixty.categories (name, slug, description) VALUES
        ('Office 365', 'office365', 'Microsoft Office 365 products'),
        ('Windows', 'windows', 'Windows operating systems'),
        ('Email', 'email', 'Email services'),
        ('Security', 'security', 'Security software')
      ON CONFLICT (slug) DO NOTHING
    `);
    
    // Insert products (first ensure slug column exists, then insert)
    try {
      await pool.query(`
        INSERT INTO nixty.products (name, slug, description, price, category_id, image_url) VALUES
          ('Office 365 Personal', 'office365-personal', 'Personal productivity suite', 69.99, 1, '/placeholder-office.png'),
          ('Office 365 Business', 'office365-business', 'Business productivity suite', 149.99, 1, '/placeholder-office.png')
        ON CONFLICT (slug) DO NOTHING
      `);
    } catch (error) {
      console.log('Note: Products may already exist or slug column may not be unique yet');
    }
    
    console.log('✅ Database initialization completed successfully!');
    
    // Return a summary of what was created
    const [finalTablesResult] = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'nixty'
      ORDER BY table_name
    `);
    
    const tables = finalTablesResult.map(row => row.table_name);
    
    return {
      success: true,
      message: 'Database initialized successfully',
      tables: tables,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    return {
      success: false,
      message: 'Database initialization failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
