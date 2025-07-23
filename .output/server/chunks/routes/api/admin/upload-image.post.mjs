import { c as defineEventHandler, g as getHeaders, e as createError, m as readMultipartFormData } from '../../../_/nitro.mjs';
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

function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/jfif": ".jfif",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp"
  };
  return mimeToExt[mimeType.toLowerCase()] || ".jpg";
}
const uploadImage_post = defineEventHandler(async (event) => {
  try {
    console.log("Image upload request received");
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    console.log("Auth headers:", { userId, userEmail });
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const form = await readMultipartFormData(event);
    console.log("Form data received:", (form == null ? void 0 : form.length) || 0, "items");
    if (form && form.length > 0) {
      console.log("Form items:");
      form.forEach((item, index) => {
        var _a;
        console.log(`  Item ${index}:`, {
          name: item.name,
          filename: item.filename,
          type: item.type,
          dataLength: ((_a = item.data) == null ? void 0 : _a.length) || 0
        });
      });
    }
    if (!form || form.length === 0) {
      console.error("No form data received");
      throw createError({
        statusCode: 400,
        statusMessage: "No file uploaded"
      });
    }
    const file = form.find((item) => item.name === "image");
    console.log("Image file found:", !!file, file ? `${file.filename} (${file.data.length} bytes)` : "none");
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: "No image file found"
      });
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/jfif", "image/png", "image/gif", "image/webp"];
    const fileType = file.type || "";
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      });
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: "File too large. Maximum size is 5MB."
      });
    }
    const timestamp = Date.now();
    const hash = createHash("md5").update(file.data).digest("hex").substring(0, 8);
    const extension = extname(file.filename || "") || getExtensionFromMimeType(fileType);
    const filename = `${timestamp}-${hash}${extension}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "admin");
    try {
      await promises.access(uploadDir);
    } catch {
      await promises.mkdir(uploadDir, { recursive: true });
    }
    const filePath = join(uploadDir, filename);
    await promises.writeFile(filePath, file.data);
    const publicUrl = `/uploads/admin/${filename}`;
    return {
      success: true,
      message: "Image uploaded successfully",
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
    console.error("Error uploading image:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload image"
    });
  }
});

export { uploadImage_post as default };
//# sourceMappingURL=upload-image.post.mjs.map
