<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-file-csv"></i>
          Upload Product Licenses
        </h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- File Upload Area -->
        <div 
          class="upload-area"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            accept=".csv"
            class="hidden"
          >
          <div v-if="!selectedFile">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <p>Drag & drop your CSV file here or click to browse</p>
          </div>
          <div v-else class="file-preview">
            <p><i class="fas fa-file-alt"></i> Selected file: {{ selectedFile.name }}</p>
            <button @click.stop="clearFile" class="clear-btn">Clear</button>
          </div>
        </div>

        <!-- Sample CSV Download -->
        <div class="sample-download">
          <a href="#" @click.prevent="downloadSampleCsv">
            <i class="fas fa-download"></i> Download Sample CSV
          </a>
        </div>

        <!-- Product ID Reference -->
        <div class="product-reference">
          <h3>Available Product IDs</h3>
          <div class="product-grid">
            <div v-for="product in products" :key="product.id" class="product-item">
              <span class="product-id">{{ product.id }}</span>
              <span class="product-name">{{ product.name }} {{ product.version }}</span>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div v-if="previewData.length" class="preview-section">
          <h3>Preview</h3>
          <div class="preview-table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="header in previewHeaders" :key="header">
                    {{ header }}
                    <span v-if="header === 'product_id'" class="header-note">(Product Name)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                  <td v-for="(value, key) in row" :key="key">
                    {{ key === 'product_id' ? `${value} (${getProductName(value)})` : value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="preview-info">
            Showing first 5 rows of {{ previewData.length }} total rows
          </p>
        </div>

        <!-- Validation Messages -->
        <div v-if="validationMessages.length" class="validation-messages">
          <div 
            v-for="(msg, index) in validationMessages" 
            :key="index"
            :class="['message', msg.type]"
          >
            <i :class="msg.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'"></i>
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
        <button 
          @click="uploadFile" 
          :disabled="!selectedFile" 
          class="upload-btn"
        >
          <i class="fas fa-upload"></i> Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Papa from 'papaparse'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'upload-complete'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const previewData = ref([])
const previewHeaders = ref([])
const validationMessages = ref([])
const isUploading = ref(false)
const products = ref([])

// Fetch products on mount
onMounted(async () => {
  try {
    const response = await fetch('/api/admin/product-names-versions')
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()
    products.value = data.products
  } catch (error) {
    validationMessages.value.push({
      type: 'error',
      text: 'Failed to load product list: ' + error.message
    })
  }
})

// Computed
const canUpload = computed(() => {
  return selectedFile.value && 
         previewData.value.length > 0 && 
         !validationMessages.value.some(msg => msg.type === 'error') &&
         !isUploading.value
})

// Methods
const getProductName = (productId) => {
  const product = products.value.find(p => p.id === parseInt(productId))
  if (!product) return 'Unknown Product'
  return `${product.name} ${product.version}`
}

const validateProductIds = (data) => {
  const invalidRows = []
  const validProductIds = products.value.map(p => p.id)
  
  data.forEach((row, index) => {
    if (!validProductIds.includes(parseInt(row.product_id))) {
      invalidRows.push(index + 1)
    }
  })
  
  if (invalidRows.length > 0) {
    validationMessages.value.push({
      type: 'error',
      text: `Invalid product_id in rows: ${invalidRows.join(', ')}. Please use valid product IDs.`
    })
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'text/csv') {
    processFile(file)
  } else {
    validationMessages.value = [{
      type: 'error',
      text: 'Please upload a valid CSV file'
    }]
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  selectedFile.value = file
  validationMessages.value = []
  
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      previewData.value = results.data
      previewHeaders.value = Object.keys(results.data[0] || {})
      
      // Validate required columns
      const requiredColumns = ['product_id', 'license_key', 'status']
      const missingColumns = requiredColumns.filter(col => !previewHeaders.value.includes(col))
      
      if (missingColumns.length > 0) {
        validationMessages.value.push({
          type: 'error',
          text: `Missing required columns: ${missingColumns.join(', ')}`
        })
      } else {
        // Validate product IDs if columns are valid
        validateProductIds(results.data)
      }
      
      // Add info about total rows
      validationMessages.value.push({
        type: 'info',
        text: `Found ${results.data.length} licenses to import`
      })
    },
    error: (error) => {
      validationMessages.value = [{
        type: 'error',
        text: 'Error parsing CSV file: ' + error.message
      }]
    }
  })
}

const uploadFile = async () => {
  try {
    isUploading.value = true
    
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const response = await fetch('/api/admin/product-licenses/import', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const result = await response.json()
    validationMessages.value = [{
      type: 'info',
      text: `Successfully imported ${result.imported} licenses`
    }]
    
    emit('upload-complete')
    setTimeout(() => emit('close'), 1500)
    
  } catch (error) {
    validationMessages.value = [{
      type: 'error',
      text: 'Failed to upload file: ' + error.message
    }]
  } finally {
    isUploading.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewData.value = []
  previewHeaders.value = []
  validationMessages.value = []
  isDragging.value = false
  isUploading.value = false
  emit('close')
}

const downloadSampleCsv = () => {
  // Create sample data with real product IDs
  const sampleData = [
    {
      product_id: '3', // Office 2021
      license_key: 'XXXX-YYYY-ZZZZ-WWWW',
      status: 'available',
      notes: 'Office 2021 Pro Plus License'
    },
    {
      product_id: '4', // Office 365
      license_key: 'AAAA-BBBB-CCCC-DDDD',
      status: 'available',
      notes: 'Office 365 Annual Subscription'
    },
    {
      product_id: '7', // Project 2021
      license_key: 'EEEE-FFFF-GGGG-HHHH',
      status: 'available',
      notes: 'Project Pro 2021 License'
    }
  ]

  // Convert to CSV
  const csv = Papa.unparse(sampleData)
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('download', 'sample_product_licenses.csv')
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* Import admin modal styles */
@import '~/assets/css/components/admin-modals.css';

/* Override or add specific styles for CSV Upload Modal */
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1.5rem;
  border-radius: var(--galaxy-radius-lg);
  background: rgba(0,0,0,0.2);
  transition: var(--galaxy-transition-normal);
}

.upload-area:hover {
  border-color: var(--galaxy-aurora-cyan);
  background: rgba(77, 208, 225, 0.1);
}

.hidden {
  display: none;
}

.upload-icon {
  font-size: 3rem;
  color: var(--galaxy-aurora-cyan);
  margin-bottom: 1rem;
}

.upload-area p {
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--galaxy-starlight);
}

.file-preview i {
  color: var(--galaxy-comet-green);
}

.clear-btn {
  padding: 0.4rem 0.8rem;
  background: var(--galaxy-plasma-orange);
  color: white;
  border: none;
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--galaxy-transition-fast);
}

.clear-btn:hover {
  filter: brightness(1.1);
}

.sample-download {
  text-align: center;
  margin-bottom: 2rem;
}

.sample-download a {
  color: var(--galaxy-aurora-cyan);
  text-decoration: none;
  transition: var(--galaxy-transition-fast);
}

.sample-download a:hover {
  text-decoration: underline;
  color: var(--galaxy-comet-green);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 24, 39, 0.95);
}

.cancel-btn, .upload-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--galaxy-transition-fast);
}

.cancel-btn {
  background-color: var(--galaxy-meteor-gray);
  color: var(--galaxy-starlight);
}

.cancel-btn:hover {
  background-color: var(--galaxy-asteroid-gray);
}

.upload-btn {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.upload-btn:hover {
  filter: brightness(1.1);
}

.upload-btn:disabled {
  background: var(--galaxy-asteroid-gray);
  color: var(--galaxy-cloud-gray);
  cursor: not-allowed;
  filter: none;
}

.product-reference {
  margin-top: 1rem;
}

.product-reference h3 {
  color: var(--galaxy-starlight);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.product-item {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--galaxy-radius-md);
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  transition: var(--galaxy-transition-fast);
}

.product-item:hover {
  border-color: var(--galaxy-aurora-cyan);
  transform: translateY(-2px);
}

.product-id {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
  padding: 0.3rem 0.6rem;
  border-radius: var(--galaxy-radius-sm);
  margin-right: 1rem;
  font-weight: bold;
}

.product-name {
  font-size: 0.9rem;
  color: var(--galaxy-light-gray);
}

.header-note {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: normal;
  margin-left: 0.25rem;
}

.preview-section {
  margin-top: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.preview-table-wrapper {
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-table th,
.preview-table td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.preview-table th {
  background-color: #f9fafb;
  font-weight: 600;
}

.validation-messages {
  margin-top: 1rem;
}

.message {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.message.info {
  background-color: #e0f2fe;
  color: #075985;
}

.preview-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style> 