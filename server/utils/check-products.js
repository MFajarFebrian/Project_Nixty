import db from './db.js';

(async () => {
  try {
    console.log('Checking products in database...');
    
    // Query with explicit schema
    const [results] = await db.query('SELECT id, name, status FROM nixty.products');
    
    console.log('Total products found:', results.length);
    console.log('Products:', JSON.stringify(results, null, 2));
    
    // Also check for active products only
    const [activeResults] = await db.query("SELECT id, name, status FROM nixty.products WHERE status = 'active'");
    console.log('\nActive products:', activeResults.length);
    console.log('Active products details:', JSON.stringify(activeResults, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
})();
