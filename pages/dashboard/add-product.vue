<template>
  <div class="add-product-page">
    <div class="page-header">
      <h1><i class="fas fa-plus-circle"></i> Add New Product</h1>
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleAddProduct" class="product-form">
        <div class="form-group">
          <label for="productName">Product Name *</label>
          <input 
            type="text" 
            id="productName" 
            v-model="form.name" 
            required
            placeholder="Enter product name"
          />
        </div>

        <div class="form-group">
          <label for="productDescription">Description</label>
          <textarea 
            id="productDescription" 
            v-model="form.description"
            rows="4"
            placeholder="Enter product description"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="productPrice">Price *</label>
            <input 
              type="number" 
              id="productPrice" 
              v-model="form.price" 
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="productCategory">Category *</label>
            <div class="category-input-group">
              <select id="productCategory" v-model="form.category_id" required>
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <input 
                type="text" 
                v-model="newCategoryName" 
                placeholder="New category name" 
                @keydown.enter.prevent="createCategory" 
              />
              <button 
                type="button"
                @click="createCategory" 
                class="create-category-btn" 
                :disabled="isCreatingCategory || !newCategoryName.trim()"
              >
                <span v-if="isCreatingCategory">
                  <i class="fas fa-spinner fa-spin"></i> Creating...
                </span>
                <span v-else>Add</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="productImage">Product Image</label>
          <ImageUpload 
            v-model="form.image_url" 
            label="Product Image"
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="cancel-btn">
            Cancel
          </button>
          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i> Creating...
            </span>
            <span v-else>
              <i class="fas fa-plus"></i> Create
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ImageUpload from '~/components/admin/ImageUpload.vue'
import { useToast } from '~/composables/useToast'
import { adminFetch } from '~/utils/adminApi'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const router = useRouter()

// Form data
const form = ref({
  name: '',
  description: '',
  price: 0,
  category_id: '',
  version: '',
  stock: 0,
  image_url: ''
})

const categories = ref([])
const isLoading = ref(false)
const newCategoryName = ref('')
const isCreatingCategory = ref(false)

// Load categories
const loadCategories = async () => {
  try {
    const response = await adminFetch('/api/admin/tables/categories')
    if (response && response.success) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Create new category
const createCategory = async () => {
  if (!newCategoryName.value.trim()) return;
  const toast = useToast()
  isCreatingCategory.value = true
  const slug = newCategoryName.value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  try {
    const response = await adminFetch('/api/admin/tables/categories', {
      method: 'POST',
      body: { name: newCategoryName.value, slug: slug }
    })

    if (response && response.success) {
      categories.value.push(response.data)
      newCategoryName.value = ''
      form.value.category_id = response.data.id
      toast.success('Category created successfully!')
    } else {
      throw new Error(response?.message || 'Failed to create category')
    }
  } catch (error) {
    console.error('Error creating category:', error)
    toast.error('Error creating category: ' + error.message)
  } finally {
    isCreatingCategory.value = false
  }
}

// Handle form submission
const handleAddProduct = async () => {
  isLoading.value = true
  
  try {
    const toast = useToast()
    
    // Basic validation
    if (!form.value.name || !form.value.price || !form.value.category_id) {
      toast.error('Please fill in all required fields')
      isLoading.value = false;
      return
    }
    
    if (parseFloat(form.value.price) <= 0) {
      toast.error('Price must be greater than 0')
      isLoading.value = false;
      return
    }
    
    // Create slug from name
    const slug = form.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Create product with only valid database fields
    const productData = {
      name: form.value.name,
      description: form.value.description,
      price: parseFloat(form.value.price),
      category_id: parseInt(form.value.category_id),
      image_url: form.value.image_url,
      slug: slug,
      status: 'active'
    }

    console.log('Creating product with data:', productData)
    
    const response = await adminFetch('/api/admin/tables/products', {
      method: 'POST',
      body: productData
    })
    
    if (response && response.success) {
      toast.success('Product created successfully!')
      router.push('/dashboard')
    } else {
      throw new Error(response?.message || 'Failed to create product')
    }
  } catch (error) {
    console.error('Error creating product:', error)
    const toast = useToast()
    toast.error('Error creating product: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// Go back to dashboard
const goBack = () => {
  router.push('/dashboard')
}

// Load data on mount
onMounted(async () => {
  await loadCategories()
})

// Set page title
useHead({
  title: 'Add New Product - Admin'
})
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.add-product-page {
  min-height: 100vh;
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-hero-gradient);
  font-family: var(--galaxy-font-primary);
  color: var(--galaxy-starlight);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-2xl);
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.back-btn {
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--galaxy-aurora-cyan);
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-2xl);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-large);
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--galaxy-space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
}

.form-group label {
  font-weight: 600;
  color: var(--galaxy-starlight);
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: var(--galaxy-space-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  background: rgba(30, 41, 59, 0.8);
  color: var(--galaxy-starlight);
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: var(--galaxy-transition-normal);
}

.form-group select {
  background: rgba(30, 41, 59, 0.9);
  color: var(--galaxy-starlight);
  cursor: pointer;
}

.form-group select option {
  background: rgba(30, 41, 59, 0.95);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-sm);
  border: none;
}

.form-group select::-ms-expand {
  display: none;
}

.form-group select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"%3e%3cpath fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.form-group textarea {
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--galaxy-cloud-gray);
}

/* Category input group styling */
.category-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
}

.category-input-group select,
.category-input-group input {
  flex: 1;
}

.create-category-btn {
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  background: var(--galaxy-comet-green);
  border: none;
  border-radius: var(--galaxy-radius-sm);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  align-self: flex-start;
}

.create-category-btn:hover {
  background: var(--galaxy-stellar-blue);
  transform: translateY(-1px);
}

.create-category-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  justify-content: flex-end;
  margin-top: var(--galaxy-space-xl);
}

.cancel-btn {
  padding: var(--galaxy-space-md) var(--galaxy-space-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  background: transparent;
  color: var(--galaxy-starlight);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--galaxy-aurora-cyan);
}

.submit-btn {
  padding: var(--galaxy-space-md) var(--galaxy-space-xl);
  border: none;
  border-radius: var(--galaxy-radius-md);
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  font-weight: 600;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--galaxy-space-md);
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
