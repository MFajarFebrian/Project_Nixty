<template>
  <div class="test-page">
    <h1>Image Upload Test Page</h1>
    
    <div class="test-section">
      <h2>Test ImageUpload Component</h2>
      <ImageUpload 
        v-model="testImageUrl" 
        label="Test Image"
        :required="false"
      />
      
      <div v-if="testImageUrl" class="result">
        <h3>Current Image URL:</h3>
        <p>{{ testImageUrl }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Test Image Field Detection</h2>
      <div v-for="field in testFields" :key="field.name" class="field-test">
        <strong>{{ field.name }}</strong>: 
        <span :style="{ color: isImageField(field) ? 'green' : 'red' }">
          {{ isImageField(field) ? 'DETECTED as image field' : 'NOT detected as image field' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref } from 'vue';
import ImageUpload from '~/components/admin/ImageUpload.vue';

// Test data
const testImageUrl = ref('');

const testFields = [
  { name: 'image_url', type: 'varchar(500)' },
  { name: 'background_image_url', type: 'varchar(500)' },
  { name: 'title', type: 'varchar(255)' },
  { name: 'description', type: 'text' }
];

// Test the image field detection function
const isImageField = (column) => {
  return column.name.includes('image_url') || column.name.includes('background_image');
};

// Set page title
useHead({
  title: 'Image Upload Test - Admin'
});
</script>

<style scoped>
.test-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: var(--galaxy-deep-space);
  color: var(--galaxy-starlight);
  min-height: 100vh;
}

.test-section {
  margin-bottom: 3rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.field-test {
  margin: 1rem 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.result {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(77, 208, 225, 0.1);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: 4px;
}

h1, h2, h3 {
  color: var(--galaxy-starlight);
}
</style>
