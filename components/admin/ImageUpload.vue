<template>
  <div class="image-upload-container">
    <!-- Current Image Preview -->
    <div v-if="currentImageUrl" class="current-image">
      <div class="image-preview">
        <img :src="currentImageUrl" :alt="label" class="preview-img" />
        <div class="image-overlay">
          <button @click="showDeleteConfirm = true" class="delete-btn" type="button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="upload-area" :class="{ 'dragover': isDragOver, 'uploading': uploading }">
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="file-input"
        :disabled="uploading"
      />

      <div
        class="upload-zone"
        @click="triggerFileSelect"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div v-if="!uploading" class="upload-content">
          <i class="fas fa-cloud-upload-alt upload-icon"></i>
          <span class="upload-text">{{ currentImageUrl ? 'Replace' : 'Upload' }}</span>
        </div>

        <div v-else class="uploading-content">
          <i class="fas fa-spinner fa-spin upload-icon"></i>
          <span>{{ progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ error }}</span>
      <button @click="clearError" class="close-error">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Image</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this image? This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="cancel-btn">Cancel</button>
          <button @click="handleDelete" class="delete-confirm-btn" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, watch } from 'vue';
import { useImageUpload } from '~/composables/useImageUpload';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Image'
  },
  required: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Image upload composable
const {
  uploading,
  error,
  progress,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
  clearError,
  uploadImage,
  deleteImage,
  formatFileSize,
  isUploadedImage
} = useImageUpload();

// Local state
const fileInput = ref(null);
const isDragOver = ref(false);
const showDeleteConfirm = ref(false);
const deleting = ref(false);

// Computed
const currentImageUrl = computed(() => props.modelValue);
const acceptedTypes = computed(() => ALLOWED_TYPES.join(','));

const circumference = computed(() => 2 * Math.PI * 26);
const strokeDashoffset = computed(() => {
  return circumference.value - (progress.value / 100) * circumference.value;
});

// Methods
const triggerFileSelect = () => {
  if (!uploading.value) {
    fileInput.value?.click();
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    await uploadFile(file);
  }
};

const handleDragOver = () => {
  if (!uploading.value) {
    isDragOver.value = true;
  }
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = async (event) => {
  isDragOver.value = false;
  
  if (uploading.value) return;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    await uploadFile(files[0]);
  }
};

const uploadFile = async (file) => {
  const result = await uploadImage(file);
  if (result) {
    // If there was a previous uploaded image, delete it
    if (currentImageUrl.value && isUploadedImage(currentImageUrl.value)) {
      await deleteImage(currentImageUrl.value);
    }
    
    // Update the model value with the new image URL
    emit('update:modelValue', result.url);
  }
  
  // Clear the file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleDelete = async () => {
  if (!currentImageUrl.value) return;
  
  deleting.value = true;
  
  try {
    if (isUploadedImage(currentImageUrl.value)) {
      const success = await deleteImage(currentImageUrl.value);
      if (success) {
        emit('update:modelValue', '');
      }
    } else {
      // For non-uploaded images, just clear the URL
      emit('update:modelValue', '');
    }
  } finally {
    deleting.value = false;
    showDeleteConfirm.value = false;
  }
};

// Watch for external changes to clear errors
watch(() => props.modelValue, () => {
  clearError();
});
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.current-image {
  margin-bottom: var(--galaxy-space-md);
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: var(--galaxy-radius-md);
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  max-width: 100%;
}

.preview-img {
  max-width: 100%;
  height: auto;
  max-height: 200px;
  display: block;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--galaxy-transition-fast);
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.delete-btn {
  background: rgba(255, 107, 53, 0.9);
  color: var(--galaxy-starlight);
  border: none;
  padding: var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-full);
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: var(--galaxy-plasma-orange);
  transform: scale(1.1);
}



.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: var(--galaxy-radius-lg);
  transition: var(--galaxy-transition-fast);
}

.upload-area.dragover {
  border-color: var(--galaxy-aurora-cyan);
  background: rgba(77, 208, 225, 0.1);
}

.upload-area.uploading {
  border-color: var(--galaxy-nova-gold);
  background: rgba(255, 215, 0, 0.05);
}

.file-input {
  display: none;
}

.upload-zone {
  padding: var(--galaxy-space-lg);
  text-align: center;
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  background: rgba(255, 255, 255, 0.05);
}

.upload-content {
  color: var(--galaxy-cloud-gray);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.upload-icon {
  font-size: 1.5rem;
  color: var(--galaxy-aurora-cyan);
}

.upload-text {
  color: var(--galaxy-starlight);
  font-size: 0.95rem;
}

.uploading-content {
  color: var(--galaxy-starlight);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.uploading-content .upload-icon {
  color: var(--galaxy-nova-gold);
}

.error-message {
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
  margin-top: var(--galaxy-space-md);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  color: var(--galaxy-plasma-orange);
}

.close-error {
  background: none;
  border: none;
  color: var(--galaxy-plasma-orange);
  cursor: pointer;
  padding: var(--galaxy-space-xs);
  margin-left: auto;
}

.close-error:hover {
  color: var(--galaxy-starlight);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--galaxy-z-modal);
  animation: fadeIn 0.2s ease-out;
}

.confirm-modal {
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-lg);
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease-out;
  backdrop-filter: blur(20px);
}

.modal-header {
  padding: var(--galaxy-space-lg) var(--galaxy-space-xl);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: var(--galaxy-starlight);
  margin: 0;
  font-size: 1.1rem;
}

.modal-body {
  padding: var(--galaxy-space-lg) var(--galaxy-space-xl);
}

.modal-body p {
  color: var(--galaxy-cloud-gray);
  margin: 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-lg) var(--galaxy-space-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  background: transparent;
  color: var(--galaxy-cloud-gray);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
}

.cancel-btn:hover {
  color: var(--galaxy-starlight);
  border-color: var(--galaxy-aurora-cyan);
}

.delete-confirm-btn {
  background: linear-gradient(135deg, var(--galaxy-plasma-orange), #d32f2f);
  color: var(--galaxy-starlight);
  border: none;
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.delete-confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
