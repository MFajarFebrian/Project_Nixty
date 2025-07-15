import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import db from '../../../utils/db';

/**
 * POST /api/admin/tables/massAdd
 * Mass add products with images
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Mass add request received');

    // Read multipart form data
    const form = await readMultipartFormData(event);
    console.log('Form data received:', form?.length || 0, 'items');

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No form data received'
      });
    }

    // Parse form data
    const formData = {};
    const imageFiles = {};

    form.forEach((item) => {
      if (item.name && item.data) {
        if (item.filename) {
          // This is a file
          imageFiles[item.name] = {
            filename: item.filename,
            type: item.type,
            data: item.data
          };
        } else {
          // This is a text field
          formData[item.name] = item.data.toString();
        }
      }
    });

    console.log('Form fields:', Object.keys(formData));
    console.log('Image files:', Object.keys(imageFiles));

    // Validate table name
    if (formData.tableName !== 'products') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid table name'
      });
    }

    // Parse products data
    const products = JSON.parse(formData.products || '[]');
    console.log('Products to add:', products.length);

    if (products.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No products to add'
      });
    }

    // Fetch categories from database
    const categoriesResult = await db.execute('SELECT id, name, slug FROM categories');
    const categories = categoriesResult[0] || [];
    const categoryMap = new Map(categories.map(category => [category.name.toLowerCase(), { id: category.id, slug: category.slug }]));
    console.log('Available categories:', Array.from(categoryMap.keys()));

    // Note: Product slugs are now taken directly from category slugs
    
    // Process each product
    const createProductQueries = [];
    const processingErrors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}:`, product.name);
      let imageUrl = null;

      // Validate required fields
      if (!product.name || !product.name.trim()) {
        processingErrors.push(`Product ${i + 1}: Name is required`);
        continue;
      }
      
      if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
        processingErrors.push(`Product ${i + 1}: Valid price is required`);
        continue;
      }

      // Auto-set category_id and slug from category name
      if (product.category) {
        const categoryData = categoryMap.get(product.category.toLowerCase());
        if (categoryData) {
          product.category_id = categoryData.id;
          product.slug = categoryData.slug; // Use category slug EXACTLY
          console.log(`Found category ID ${categoryData.id} and using slug '${categoryData.slug}' for category: ${product.category}`);
        } else {
          console.warn(`Category not found: ${product.category}. Available categories: ${Array.from(categoryMap.keys()).join(', ')}`);
          processingErrors.push(`Product ${i + 1}: Category '${product.category}' not found`);
          product.category_id = null;
          product.slug = null;
        }
      } else {
        processingErrors.push(`Product ${i + 1}: Category is required`);
        product.category_id = null;
        product.slug = null;
      }
      
      // Skip if no valid category/slug
      if (!product.slug) {
        continue;
      }

      // Check if there's an image for this product
      const imageKey = `image_${i}`;
      const imageFile = imageFiles[imageKey];

      if (imageFile) {
        // Process image upload
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(imageFile.type?.toLowerCase())) {
          throw createError({
            statusCode: 400,
            statusMessage: `Invalid file type for product ${i + 1}. Only JPEG, PNG, GIF, and WebP are allowed.`
          });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.data.length > maxSize) {
          throw createError({
            statusCode: 400,
            statusMessage: `File too large for product ${i + 1}. Maximum size is 5MB.`
          });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const hash = createHash('md5').update(imageFile.data).digest('hex').substring(0, 8);
        const extension = extname(imageFile.filename || '') || '.jpg';
        const filename = `${timestamp}-${hash}${extension}`;

        // Create upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }

        // Save file
        const filePath = join(uploadDir, filename);
        await fs.writeFile(filePath, imageFile.data);

        imageUrl = `/uploads/products/${filename}`;
      }

      // Create database query
      const query = db.execute(`
        INSERT INTO products (name, slug, price, category_id, description, image_url, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        product.name,
        product.slug,
        parseFloat(product.price),
        product.category_id,
        product.description || '',
        imageUrl
      ]);
      
      createProductQueries.push(query);
    }

    // Check for processing errors
    if (processingErrors.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Product validation failed: ${processingErrors.join('; ')}`
      });
    }

    // Check if any products were processed
    if (createProductQueries.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid products to add after validation'
      });
    }

    // Execute all queries
    await Promise.all(createProductQueries);

    const successMessage = `Successfully added ${createProductQueries.length} products`;
    if (processingErrors.length > 0) {
      return {
        success: true,
        message: `${successMessage}. Some products had warnings: ${processingErrors.join('; ')}`
      };
    }

    return {
      success: true,
      message: successMessage
    };

  } catch (error) {
    console.error('Error in mass add:', error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add products. Error: ${error.message}`
    });
  }
});
