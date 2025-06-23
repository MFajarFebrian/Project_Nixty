import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/jfif': '.jfif',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
  };
  return mimeToExt[mimeType.toLowerCase()] || '.jpg';
}

/**
 * POST /api/admin/upload-image
 * Upload image files for admin use
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('Image upload request received');

    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];

    console.log('Auth headers:', { userId, userEmail });

    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    // Get the uploaded files
    const form = await readMultipartFormData(event);
    console.log('Form data received:', form?.length || 0, 'items');

    if (form && form.length > 0) {
      console.log('Form items:');
      form.forEach((item, index) => {
        console.log(`  Item ${index}:`, {
          name: item.name,
          filename: item.filename,
          type: item.type,
          dataLength: item.data?.length || 0
        });
      });
    }

    if (!form || form.length === 0) {
      console.error('No form data received');
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      });
    }

    const file = form.find(item => item.name === 'image');
    console.log('Image file found:', !!file, file ? `${file.filename} (${file.data.length} bytes)` : 'none');

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No image file found'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/jfif', 'image/png', 'image/gif', 'image/webp'];
    const fileType = file.type || '';
    
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File too large. Maximum size is 5MB.'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const hash = createHash('md5').update(file.data).digest('hex').substring(0, 8);
    const extension = extname(file.filename || '') || getExtensionFromMimeType(fileType);
    const filename = `${timestamp}-${hash}${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'admin');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = join(uploadDir, filename);
    await fs.writeFile(filePath, file.data);

    // Return the public URL
    const publicUrl = `/uploads/admin/${filename}`;

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename,
        originalName: file.filename,
        size: file.data.length,
        type: fileType,
        url: publicUrl
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error uploading image:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image'
    });
  }
});
