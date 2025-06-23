import pool from './db.js';

/**
 * Validates database schema to ensure required tables exist with correct structure
 */
async function validateDatabaseSchema() {
  console.log('Validating database schema...');
  
  try {
    // Check if tables exist
    const [tables] = await pool.execute('SHOW TABLES FROM nixty');
    const tableNames = tables.map(row => Object.values(row)[0]);

    // Print existing tables
    console.log('📋 Existing tables in database:');
    if (tableNames.length === 0) {
      console.log('   ❌ No tables found in database');
    } else {
      tableNames.forEach((tableName, index) => {
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    console.log(''); // Empty line for spacing

    const requiredTables = ['users', 'transactions', 'categories', 'products', 'announcements', 'hero_slides', 'deals'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.error(`Missing required tables: ${missingTables.join(', ')}`);
      return false;
    }
    
    // Validate users table structure
    const [usersColumns] = await pool.execute('DESCRIBE users');
    const userRequiredColumns = [
      'id', 'email', 'password', 'name', 'created_at', 
      'account_type', 'google_id', 'profile_picture',
      'reset_token', 'reset_token_expires'
    ];
    
    const userColumnNames = usersColumns.map(col => col.Field);
    const missingUserColumns = userRequiredColumns.filter(col => !userColumnNames.includes(col));
    
    if (missingUserColumns.length > 0) {
      console.error(`Missing columns in users table: ${missingUserColumns.join(', ')}`);
      return false;
    }
    
    // Validate transactions table structure
    const [transactionsColumns] = await pool.execute('DESCRIBE transactions');
    const transactionRequiredColumns = [
      'id', 'order_id', 'product_name', 'email', 'amount', 
      'status', 'payment_method', 'va_number', 'created_at', 'updated_at'
    ];
    
    const transactionColumnNames = transactionsColumns.map(col => col.Field);
    const missingTransactionColumns = transactionRequiredColumns.filter(
      col => !transactionColumnNames.includes(col)
    );
    
    if (missingTransactionColumns.length > 0) {
      console.error(`Missing columns in transactions table: ${missingTransactionColumns.join(', ')}`);
      return false;
    }

    // Validate categories table structure
    const [categoriesColumns] = await pool.execute('DESCRIBE categories');
    const categoryRequiredColumns = ['id', 'name', 'slug', 'description', 'created_at'];
    const categoryColumnNames = categoriesColumns.map(col => col.Field);
    const missingCategoryColumns = categoryRequiredColumns.filter(col => !categoryColumnNames.includes(col));

    if (missingCategoryColumns.length > 0) {
      console.error(`Missing columns in categories table: ${missingCategoryColumns.join(', ')}`);
      return false;
    }

    // Validate products table structure
    const [productsColumns] = await pool.execute('DESCRIBE products');
    const productRequiredColumns = [
      'id', 'name', 'description', 'short_description', 'price', 'period',
      'category_id', 'image_url', 'rating', 'is_new', 'discount_percentage',
      'time_left', 'is_featured', 'is_trending', 'status', 'created_at', 'updated_at'
    ];
    const productColumnNames = productsColumns.map(col => col.Field);
    const missingProductColumns = productRequiredColumns.filter(col => !productColumnNames.includes(col));

    if (missingProductColumns.length > 0) {
      console.error(`Missing columns in products table: ${missingProductColumns.join(', ')}`);
      return false;
    }

    // Validate announcements table structure
    const [announcementsColumns] = await pool.execute('DESCRIBE announcements');
    const announcementRequiredColumns = ['id', 'title', 'content', 'image_url', 'is_new', 'status', 'created_at', 'updated_at'];
    const announcementColumnNames = announcementsColumns.map(col => col.Field);
    const missingAnnouncementColumns = announcementRequiredColumns.filter(col => !announcementColumnNames.includes(col));

    if (missingAnnouncementColumns.length > 0) {
      console.error(`Missing columns in announcements table: ${missingAnnouncementColumns.join(', ')}`);
      return false;
    }

    // Validate hero_slides table structure
    const [heroSlidesColumns] = await pool.execute('DESCRIBE hero_slides');
    const heroSlideRequiredColumns = [
      'id', 'title', 'description', 'background_image_url', 'product_id',
      'rating', 'is_new', 'status', 'sort_order', 'created_at', 'updated_at'
    ];
    const heroSlideColumnNames = heroSlidesColumns.map(col => col.Field);
    const missingHeroSlideColumns = heroSlideRequiredColumns.filter(col => !heroSlideColumnNames.includes(col));

    if (missingHeroSlideColumns.length > 0) {
      console.error(`Missing columns in hero_slides table: ${missingHeroSlideColumns.join(', ')}`);
      return false;
    }

    // Validate deals table structure
    const [dealsColumns] = await pool.execute('DESCRIBE deals');
    const dealRequiredColumns = [
      'id', 'title', 'description', 'product_id', 'old_price', 'new_price',
      'discount_percentage', 'badge', 'background_image_url', 'is_featured',
      'status', 'expires_at', 'created_at', 'updated_at'
    ];
    const dealColumnNames = dealsColumns.map(col => col.Field);
    const missingDealColumns = dealRequiredColumns.filter(col => !dealColumnNames.includes(col));

    if (missingDealColumns.length > 0) {
      console.error(`Missing columns in deals table: ${missingDealColumns.join(', ')}`);
      return false;
    }

    // Print summary
    console.log('📊 Database Schema Summary:');
    const presentTables = requiredTables.filter(table => tableNames.includes(table));

    console.log(`✅ Present tables (${presentTables.length}/${requiredTables.length}):`);
    presentTables.forEach(table => {
      console.log(`   ✓ ${table}`);
    });

    if (missingTables.length > 0) {
      console.log(`❌ Missing tables (${missingTables.length}):`);
      missingTables.forEach(table => {
        console.log(`   ✗ ${table}`);
      });
    }

    console.log('\n✅ Database schema validation successful!');
    return true;
    
  } catch (error) {
    console.error('Error validating database schema:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDatabaseSchema()
    .then(isValid => {
      if (isValid) {
        console.log('All required tables and columns exist.');
        process.exit(0);
      } else {
        console.error('Database schema validation failed.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during validation:', err);
      process.exit(1);
    });
}

export default validateDatabaseSchema;