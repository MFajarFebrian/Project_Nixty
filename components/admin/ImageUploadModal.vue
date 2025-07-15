<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-image"></i>
          Upload Image
        </h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="upload-section">
          <h3 class="section-title">Upload Image</h3>
          <ImageUpload
            v-model="imageUrl"
            :label="'New Image'"
            @update:modelValue="handleUpdate"
          />
        </div>
        <div v-if="imageUrl" class="preview-section">
          <h3 class="section-title">Preview</h3>
          <div class="image-preview-container">
            <img :src="imageUrl" alt="Image Preview" class="image-preview"/>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button @click="saveImage" class="save-btn" :disabled="!imageUrl">
          <i class="fas fa-save"></i>
          Save Image
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ImageUpload from '~/components/admin/ImageUpload.vue';

const props = defineProps({
  show: Boolean,
  record: Object,
  tableName: String,
});

const emit = defineEmits(['close', 'save']);

const imageUrl = ref('');
const imageColumnName = ref('image_url');

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    // Find the image column dynamically
    const imageColumns = ['image_url', 'image', 'avatar', 'photo', 'picture', 'banner', 'logo', 'icon', 'thumbnail'];
    const foundColumn = imageColumns.find(col => newRecord.hasOwnProperty(col));
    
    if (foundColumn) {
      imageColumnName.value = foundColumn;
      imageUrl.value = newRecord[foundColumn] || '';
    } else {
      // Fallback to first column that looks like an image URL
      const possibleImageColumn = Object.keys(newRecord).find(key => {
        const value = newRecord[key];
        if (typeof value === 'string' && value.trim() !== '') {
          return value.includes('/uploads/') || value.includes('/images/') || 
                 value.includes('.jpg') || value.includes('.png') || 
                 value.includes('.gif') || value.includes('.webp') ||
                 value.startsWith('data:image/') || value.startsWith('http');
        }
        return false;
      });
      
      if (possibleImageColumn) {
        imageColumnName.value = possibleImageColumn;
        imageUrl.value = newRecord[possibleImageColumn] || '';
      }
    }
  }
}, { immediate: true });


function handleUpdate(newUrl) {
    imageUrl.value = newUrl;
}

function saveImage() {
  emit('save', {
    id: props.record.id,
    record: { [imageColumnName.value]: imageUrl.value },
  });
}
</script>

<style scoped>
@import '~/assets/css/components/admin-modals.css';

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.preview-section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--galaxy-starlight);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.image-preview-container {
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  object-fit: contain;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--galaxy-cloud-gray);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.cancel-btn:hover {
  color: var(--galaxy-starlight);
  border-color: var(--galaxy-aurora-cyan);
  background: rgba(77, 208, 225, 0.1);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--galaxy-aurora-cyan), var(--galaxy-nova-gold));
  color: var(--galaxy-starlight);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(77, 208, 225, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>

