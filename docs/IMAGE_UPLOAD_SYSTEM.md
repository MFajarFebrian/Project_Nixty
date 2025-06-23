# Image Upload System Documentation

## Overview

The admin panel now includes a comprehensive image upload system that replaces URL input fields with drag-and-drop file upload functionality. This system includes file validation, size limits, image preview, and automatic cleanup to prevent server bloat.

## Features

### ✅ **File Upload**
- **Drag & Drop**: Drag images directly onto the upload area
- **Click to Select**: Click the upload area to open file browser
- **Progress Tracking**: Real-time upload progress with circular progress indicator
- **Image Preview**: Immediate preview of uploaded images

### ✅ **File Validation**
- **File Types**: JPEG, PNG, GIF, WebP only
- **Size Limit**: Maximum 5MB per file
- **Security**: Server-side validation and sanitization
- **Error Handling**: Clear error messages for invalid files

### ✅ **Image Management**
- **Replace Images**: Upload new images to replace existing ones
- **Delete Images**: Remove images with confirmation dialog
- **Auto Cleanup**: Old images are automatically deleted when replaced
- **Unique Filenames**: Timestamp + hash naming prevents conflicts

## File Structure

```
public/
├── uploads/
│   └── admin/
│       ├── .gitkeep          # Ensures directory is tracked
│       ├── .gitignore        # Prevents uploaded files in git
│       └── [uploaded files]  # Actual uploaded images
```

## API Endpoints

### Upload Image
```
POST /api/admin/upload-image
Content-Type: multipart/form-data

Body: FormData with 'image' field
Headers: x-user-id, x-user-email (admin auth)
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "1703123456-a1b2c3d4.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000,
    "type": "image/jpeg",
    "url": "/uploads/admin/1703123456-a1b2c3d4.jpg"
  }
}
```

### Delete Image
```
DELETE /api/admin/delete-image?url=/uploads/admin/filename.jpg
Headers: x-user-id, x-user-email (admin auth)
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "deletedUrl": "/uploads/admin/filename.jpg",
    "filename": "filename.jpg"
  }
}
```

## Usage in Admin Panel

### Affected Tables
The image upload system automatically replaces URL inputs for these fields:
- **Products**: `image_url`
- **Announcements**: `image_url`
- **Deals**: `background_image_url`
- **Hero Slides**: `background_image_url`

### How to Use
1. **Navigate to Admin Panel**: Go to `/admin`
2. **Select Table**: Choose any table with image fields
3. **Create/Edit Record**: Click "Add New" or edit existing record
4. **Upload Image**: 
   - Drag & drop image onto upload area, OR
   - Click upload area to select file
5. **Preview**: See immediate preview of uploaded image
6. **Save**: Image URL is automatically saved to database

### Image Management
- **Replace**: Upload new image to replace existing one
- **Delete**: Click trash icon on image preview to delete
- **Validation**: System prevents invalid files and oversized images

## Technical Implementation

### Frontend Components

**ImageUpload.vue**
- Drag & drop interface
- File validation
- Upload progress tracking
- Image preview and deletion
- Error handling

**RecordModal.vue** (Updated)
- Automatically detects image fields
- Uses ImageUpload component for image URLs
- Seamless integration with existing forms

### Backend APIs

**upload-image.post.js**
- Multipart form data handling
- File type and size validation
- Unique filename generation
- Secure file storage

**delete-image.delete.js**
- Image deletion with validation
- Security checks for admin-only deletion
- File system cleanup

### Composables

**useImageUpload.js**
- Reusable upload logic
- Error handling
- Progress tracking
- File validation utilities

## Security Features

### ✅ **File Validation**
- Server-side type checking
- Size limit enforcement
- Filename sanitization
- Path traversal prevention

### ✅ **Access Control**
- Admin-only upload/delete
- Authentication required
- Secure file paths

### ✅ **File Management**
- Unique filenames prevent conflicts
- Automatic cleanup of replaced images
- .gitignore prevents accidental commits

## Configuration

### File Size Limit
```javascript
// In composables/useImageUpload.js and server APIs
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

### Allowed File Types
```javascript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];
```

### Upload Directory
```javascript
// Server-side path
const uploadDir = join(process.cwd(), 'public', 'uploads', 'admin');

// Public URL
const publicUrl = `/uploads/admin/${filename}`;
```

## Setup Instructions

### 1. Create Upload Directories
```bash
# Run the setup script
node scripts/setup-uploads.js
```

### 2. Verify Permissions
Ensure the server has write permissions to `public/uploads/admin/`

### 3. Configure Web Server (Production)
```nginx
# Nginx example - limit upload size
client_max_body_size 5M;

# Serve uploaded files
location /uploads/ {
    alias /path/to/your/app/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

**Upload Fails**
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, GIF, WebP only)
- Ensure admin authentication
- Check server write permissions

**Images Not Displaying**
- Verify file exists in `public/uploads/admin/`
- Check file permissions
- Ensure correct URL format

**Directory Errors**
- Run `node scripts/setup-uploads.js`
- Check folder permissions
- Verify path configuration

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "File too large" | File > 5MB | Compress image or use smaller file |
| "Invalid file type" | Unsupported format | Use JPEG, PNG, GIF, or WebP |
| "Admin authentication required" | Not logged in as admin | Login with admin account |
| "Failed to upload image" | Server error | Check permissions and disk space |

## Best Practices

### For Administrators
1. **Optimize Images**: Compress images before upload for better performance
2. **Use Appropriate Formats**: JPEG for photos, PNG for graphics with transparency
3. **Regular Cleanup**: Periodically review and remove unused images
4. **Backup**: Include uploads directory in backup strategy

### For Developers
1. **Monitor Disk Usage**: Implement disk space monitoring
2. **Image Optimization**: Consider adding automatic image compression
3. **CDN Integration**: For high-traffic sites, consider CDN for image delivery
4. **Thumbnail Generation**: Implement automatic thumbnail creation if needed

## Future Enhancements

### Potential Improvements
- **Image Compression**: Automatic compression on upload
- **Thumbnail Generation**: Multiple sizes for different use cases
- **CDN Integration**: Cloud storage for better performance
- **Bulk Upload**: Multiple file upload support
- **Image Editing**: Basic crop/resize functionality
- **Alt Text Management**: Accessibility improvements

### Monitoring
- **Disk Usage**: Track upload directory size
- **Upload Statistics**: Monitor upload frequency and file sizes
- **Error Tracking**: Log upload failures for analysis
- **Performance**: Monitor upload speeds and server load
