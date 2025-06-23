import { promises as fs } from 'fs';
import { join, basename } from 'path';

/**
 * DELETE /api/admin/delete-image
 * Delete uploaded image files
 */
export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    // Get the image URL from query parameters
    const query = getQuery(event);
    const imageUrl = query.url;
    
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image URL is required'
      });
    }

    // Validate that it's an admin uploaded image
    if (!imageUrl.startsWith('/uploads/admin/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Can only delete admin uploaded images'
      });
    }

    // Extract filename from URL
    const filename = basename(imageUrl);
    
    // Validate filename format (timestamp-hash.ext)
    const filenamePattern = /^\d+-[a-f0-9]{8}\.(jpg|jpeg|jfif|png|gif|webp)$/i;
    if (!filenamePattern.test(filename)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid image filename format'
      });
    }

    // Construct file path
    const filePath = join(process.cwd(), 'public', 'uploads', 'admin', filename);

    // Check if file exists and delete it
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      
      return {
        success: true,
        message: 'Image deleted successfully',
        data: {
          deletedUrl: imageUrl,
          filename
        }
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, consider it already deleted
        return {
          success: true,
          message: 'Image was already deleted or does not exist',
          data: {
            deletedUrl: imageUrl,
            filename
          }
        };
      }
      throw error;
    }

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error deleting image:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete image'
    });
  }
});
