import { ref } from 'vue';
import { useAdminAuth } from './useAdminAuth';

/**
 * Image upload composable for admin use
 */
export function useImageUpload() {
  const { getAdminHeaders, checkAdminAccess } = useAdminAuth();
  
  // State
  const uploading = ref(false);
  const error = ref(null);
  const progress = ref(0);

  // Configuration
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/jfif', 'image/png', 'image/gif', 'image/webp'];

  // Methods
  const clearError = () => {
    error.value = null;
  };

  const setError = (message) => {
    error.value = message;
    console.error('Image Upload Error:', message);
  };

  /**
   * Validate file before upload
   */
  const validateFile = (file) => {
    clearError();

    if (!file) {
      setError('No file selected');
      return false;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return false;
    }

    return true;
  };

  /**
   * Upload image file
   */
  const uploadImage = async (file) => {
    try {
      console.log('Starting image upload:', file.name, file.size, file.type);
      checkAdminAccess();

      if (!validateFile(file)) {
        return null;
      }

      uploading.value = true;
      progress.value = 0;
      clearError();

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      console.log('FormData created, uploading to server...');
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      console.log('Admin headers:', getAdminHeaders());

      // Upload using native fetch (better FormData support)
      const headers = getAdminHeaders();
      // Don't set Content-Type header for FormData - let browser set it with boundary
      delete headers['Content-Type'];

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error response:', errorData);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);

      if (result.success) {
        progress.value = 100;
        return result.data;
      } else {
        setError(result.message || 'Failed to upload image');
        return null;
      }

    } catch (err) {
      setError(err.message || 'Failed to upload image');
      return null;
    } finally {
      uploading.value = false;
      setTimeout(() => {
        progress.value = 0;
      }, 1000);
    }
  };

  /**
   * Delete image file
   */
  const deleteImage = async (imageUrl) => {
    try {
      checkAdminAccess();
      clearError();

      if (!imageUrl || !imageUrl.startsWith('/uploads/admin/')) {
        setError('Invalid image URL');
        return false;
      }

      const response = await $fetch('/api/admin/delete-image', {
        method: 'DELETE',
        headers: getAdminHeaders(),
        query: { url: imageUrl }
      });

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete image');
        return false;
      }

    } catch (err) {
      setError(err.message || 'Failed to delete image');
      return false;
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get file extension from filename
   */
  const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  /**
   * Check if URL is an uploaded admin image
   */
  const isUploadedImage = (url) => {
    return url && url.startsWith('/uploads/admin/');
  };

  /**
   * Generate thumbnail URL (if needed in the future)
   */
  const getThumbnailUrl = (imageUrl, size = 'small') => {
    // For now, return the original URL
    // In the future, you could implement thumbnail generation
    return imageUrl;
  };

  return {
    // State
    uploading,
    error,
    progress,
    
    // Configuration
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    
    // Methods
    clearError,
    validateFile,
    uploadImage,
    deleteImage,
    formatFileSize,
    getFileExtension,
    isUploadedImage,
    getThumbnailUrl
  };
}
