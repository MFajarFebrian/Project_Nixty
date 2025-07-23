import { c as defineEventHandler, m as readMultipartFormData, e as createError, f as db } from '../../../../_/nitro.mjs';
import { promises } from 'fs';
import { extname, join } from 'path';
import { createHash } from 'crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';

const massAdd_post = defineEventHandler(async (event) => {
  var _a;
  try {
    console.log("Mass add request received");
    const form = await readMultipartFormData(event);
    console.log("Form data received:", (form == null ? void 0 : form.length) || 0, "items");
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No form data received"
      });
    }
    const formData = {};
    const imageFiles = {};
    form.forEach((item) => {
      if (item.name && item.data) {
        if (item.filename) {
          imageFiles[item.name] = {
            filename: item.filename,
            type: item.type,
            data: item.data
          };
        } else {
          formData[item.name] = item.data.toString();
        }
      }
    });
    console.log("Form fields:", Object.keys(formData));
    console.log("Image files:", Object.keys(imageFiles));
    if (formData.tableName !== "products") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid table name"
      });
    }
    const products = JSON.parse(formData.products || "[]");
    console.log("Products to add:", products.length);
    if (products.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No products to add"
      });
    }
    const categoriesResult = await db.execute("SELECT id, name, slug FROM categories");
    const categories = categoriesResult[0] || [];
    const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), { id: category.id, slug: category.slug }]));
    console.log("Available categories:", Array.from(categoryMap.keys()));
    const createProductQueries = [];
    const processingErrors = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}:`, product.name);
      let imageUrl = null;
      if (!product.name || !product.name.trim()) {
        processingErrors.push(`Product ${i + 1}: Name is required`);
        continue;
      }
      if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
        processingErrors.push(`Product ${i + 1}: Valid price is required`);
        continue;
      }
      if (product.category) {
        const categoryData = categoryMap.get(product.category.toLowerCase());
        if (categoryData) {
          product.category_id = categoryData.id;
          product.slug = categoryData.slug;
          console.log(`Found category ID ${categoryData.id} and using slug '${categoryData.slug}' for category: ${product.category}`);
        } else {
          console.warn(`Category not found: ${product.category}. Available categories: ${Array.from(categoryMap.keys()).join(", ")}`);
          processingErrors.push(`Product ${i + 1}: Category '${product.category}' not found`);
          product.category_id = null;
          product.slug = null;
        }
      } else {
        processingErrors.push(`Product ${i + 1}: Category is required`);
        product.category_id = null;
        product.slug = null;
      }
      if (!product.slug) {
        continue;
      }
      const imageKey = `image_${i}`;
      const imageFile = imageFiles[imageKey];
      if (imageFile) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes((_a = imageFile.type) == null ? void 0 : _a.toLowerCase())) {
          throw createError({
            statusCode: 400,
            statusMessage: `Invalid file type for product ${i + 1}. Only JPEG, PNG, GIF, and WebP are allowed.`
          });
        }
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.data.length > maxSize) {
          throw createError({
            statusCode: 400,
            statusMessage: `File too large for product ${i + 1}. Maximum size is 5MB.`
          });
        }
        const timestamp = Date.now();
        const hash = createHash("md5").update(imageFile.data).digest("hex").substring(0, 8);
        const extension = extname(imageFile.filename || "") || ".jpg";
        const filename = `${timestamp}-${hash}${extension}`;
        const uploadDir = join(process.cwd(), "public", "uploads", "products");
        try {
          await promises.access(uploadDir);
        } catch {
          await promises.mkdir(uploadDir, { recursive: true });
        }
        const filePath = join(uploadDir, filename);
        await promises.writeFile(filePath, imageFile.data);
        imageUrl = `/uploads/products/${filename}`;
      }
      const query = db.execute(`
        INSERT INTO products (name, slug, price, category_id, description, image_url, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        product.name,
        product.slug,
        parseFloat(product.price),
        product.category_id,
        product.description || "",
        imageUrl
      ]);
      createProductQueries.push(query);
    }
    if (processingErrors.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Product validation failed: ${processingErrors.join("; ")}`
      });
    }
    if (createProductQueries.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid products to add after validation"
      });
    }
    await Promise.all(createProductQueries);
    const successMessage = `Successfully added ${createProductQueries.length} products`;
    if (processingErrors.length > 0) {
      return {
        success: true,
        message: `${successMessage}. Some products had warnings: ${processingErrors.join("; ")}`
      };
    }
    return {
      success: true,
      message: successMessage
    };
  } catch (error) {
    console.error("Error in mass add:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add products. Error: ${error.message}`
    });
  }
});

export { massAdd_post as default };
//# sourceMappingURL=massAdd.post.mjs.map
