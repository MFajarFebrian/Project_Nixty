import { c as defineEventHandler, g as getHeaders, e as createError, h as getQuery } from '../../../_/nitro.mjs';
import { promises } from 'fs';
import { basename, join } from 'path';
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

const deleteImage_delete = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const query = getQuery(event);
    const imageUrl = query.url;
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: "Image URL is required"
      });
    }
    if (!imageUrl.startsWith("/uploads/admin/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Can only delete admin uploaded images"
      });
    }
    const filename = basename(imageUrl);
    const filenamePattern = /^\d+-[a-f0-9]{8}\.(jpg|jpeg|jfif|png|gif|webp)$/i;
    if (!filenamePattern.test(filename)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid image filename format"
      });
    }
    const filePath = join(process.cwd(), "public", "uploads", "admin", filename);
    try {
      await promises.access(filePath);
      await promises.unlink(filePath);
      return {
        success: true,
        message: "Image deleted successfully",
        data: {
          deletedUrl: imageUrl,
          filename
        }
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return {
          success: true,
          message: "Image was already deleted or does not exist",
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
    console.error("Error deleting image:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete image"
    });
  }
});

export { deleteImage_delete as default };
//# sourceMappingURL=delete-image.delete.mjs.map
