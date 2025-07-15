/**
 * This script updates product fields that might be missing in the database
 * It adds discount_price for products that don't have it
 * It sets is_featured and is_trending flags for some products
 */

const db = require('../server/utils/db.js');

async function updateProductFields() {
  try {
    console.log('🔄 Starting product fields update...');

    // 1. Check if products table has discount_price column
    const [columns] = await db.query('SHOW COLUMNS FROM products');
    const hasDiscountPrice = columns.some(col => col.Field === 'discount_price');
    
    if (!hasDiscountPrice) {
      console.log('⚠️ discount_price column not found. Adding it...');
      await db.query('ALTER TABLE products ADD COLUMN discount_price DECIMAL(12,2) DEFAULT NULL AFTER price');
      console.log('✅ Added discount_price column');
    } else {
      console.log('✅ discount_price column already exists');
    }

    // 2. Update discount_price for products that don't have it
    const [products] = await db.query('SELECT id, price FROM products WHERE discount_price IS NULL');
    console.log(`Found ${products.length} products without discount_price`);
    
    for (const product of products) {
      // Apply a 10-20% discount to some products
      if (Math.random() > 0.5) {
        const discountPercent = Math.floor(Math.random() * 11) + 10; // 10-20%
        const discountPrice = product.price * (1 - discountPercent / 100);
        await db.query('UPDATE products SET discount_price = ? WHERE id = ?', [discountPrice, product.id]);
        console.log(`Updated product ${product.id} with ${discountPercent}% discount: ${discountPrice}`);
      }
    }

    // 3. Set featured and trending flags
    await db.query('UPDATE products SET is_featured = 1 WHERE id IN (3, 10)');
    await db.query('UPDATE products SET is_trending = 1 WHERE id IN (2, 7)');
    console.log('✅ Updated featured and trending products');

    // 4. Update image URLs to use placeholder if they're API endpoints
    await db.query(`
      UPDATE products 
      SET image_url = '/placeholder-product.png' 
      WHERE image_url LIKE '/api/%'
    `);
    console.log('✅ Updated product image URLs');

    // 5. Update hero slides image URLs
    await db.query(`
      UPDATE hero_slides 
      SET background_image_url = '/office365-hero.svg' 
      WHERE background_image_url LIKE '/api/%'
    `);
    console.log('✅ Updated hero slides image URLs');

    // 6. Update announcement image URLs
    await db.query(`
      UPDATE announcements 
      SET image_url = '/office-personal.svg' 
      WHERE image_url LIKE '/api/%'
    `);
    console.log('✅ Updated announcement image URLs');

    console.log('✅ All product fields updated successfully!');

  } catch (error) {
    console.error('❌ Error updating product fields:', error);
  } finally {
    process.exit();
  }
}

updateProductFields(); 