<template>
  <div class="add-license-page">
    <div class="page-header">
      <h1><i class="fas fa-key"></i> Add New License</h1>
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleAddLicense" class="license-form">
        <div class="form-group">
          <label for="productSelect">Select Product *</label>
          <select id="productSelect" v-model="form.product_id" required>
            <option value="">Choose Product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="licenseType">License Type *</label>
          <select id="licenseType" v-model="form.license_type" required @change="onLicenseTypeChange">
            <option value="">Choose License Type</option>
            <option value="product_key">Product Key</option>
            <option value="email_password">Account (Email & Password)</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="licenseEmail">Email{{ isAccountType ? ' *' : '' }}</label>
            <input 
              type="email" 
              id="licenseEmail" 
              v-model="form.email" 
              :required="isAccountType"
              :disabled="!form.product_id || !form.license_type || isProductKeyType"
              :placeholder="!form.product_id || !form.license_type ? 'Please select Product and License Type first' : (isProductKeyType ? 'Not required for Product Key' : 'Enter user email')"
            />
          </div>

          <div class="form-group">
            <label for="licensePassword">Password{{ isAccountType ? ' *' : '' }}</label>
            <input 
              type="password" 
              id="licensePassword" 
              v-model="form.password" 
              :required="isAccountType"
              :disabled="!form.product_id || !form.license_type || isProductKeyType"
              :placeholder="!form.product_id || !form.license_type ? 'Please select Product and License Type first' : (isProductKeyType ? 'Not required for Product Key' : 'Enter password')"
            />
          </div>
        </div>

        
        <div v-if="form.quantity > 1 && isAccountType" v-for="index in (form.quantity - 1)" :key="'account-' + index">
          <div class="form-row">
            <div class="form-group">
              <label :for="'email' + (index + 1)">
                Email #{{ index + 1 }} *
              </label>
              <input 
                :id="'email' + (index + 1)"
                type="email" 
                :value="quantityFields[index - 1] ? quantityFields[index - 1].email : ''"
                required
                :placeholder="'Enter email for account #' + (index + 1)"
                @input="updateQuantityFieldValue(index - 1, 'email', $event.target.value)"
              />
            </div>
            <div class="form-group">
              <label :for="'password' + (index + 1)">
                Password #{{ index + 1 }} *
              </label>
              <input 
                :id="'password' + (index + 1)"
                type="password" 
                :value="quantityFields[index - 1] ? quantityFields[index - 1].password : ''"
                required
                :placeholder="'Enter password for account #' + (index + 1)"
                @input="updateQuantityFieldValue(index - 1, 'password', $event.target.value)"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="licenseKey">
            License Key 
            {{ isProductKeyType ? '*' : '(Not applicable for Account type)' }}
          </label>
          <input 
            type="text" 
            id="licenseKey" 
            v-model="form.license_key" 
            :required="isProductKeyType"
            :disabled="!form.product_id || !form.license_type || isAccountType"
            :placeholder="!form.product_id || !form.license_type ? 'Please select Product and License Type first' : (isAccountType ? 'Not required for Account type' : 'Enter your license key')"
          />
        </div>

        
        <div v-if="form.quantity > 1 && isProductKeyType" v-for="index in (form.quantity - 1)" :key="'key-' + index" class="form-group">
          <label :for="'licenseKey' + (index + 1)">License Key #{{ index + 1 }} *</label>
          <input 
            :id="'licenseKey' + (index + 1)"
            type="text" 
            :value="quantityFields[index - 1] ? quantityFields[index - 1].license_key : ''"
            required
            @input="updateQuantityFieldValue(index - 1, 'license_key', $event.target.value)"
          />
        </div>

        <div class="form-group">
          <label for="quantity">Quantity</label>
          <input 
            type="number" 
            id="quantity" 
            v-model.number="form.quantity" 
            min="1"
            max="100"
            :disabled="!form.product_id || !form.license_type"
            :placeholder="!form.product_id || !form.license_type ? 'Please select Product and License Type first' : 'Number of licenses to create (default: 1)'"
            @input="updateQuantityFields"
          />
          <small class="form-hint">
            <i class="fas fa-info-circle"></i>
            Create {{ form.quantity || 1 }} {{ form.license_type === 'product_key' ? 'license keys' : 'account credentials' }}
          </small>
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
              <i class="fas fa-key"></i>
              Create
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useToast } from '~/composables/useToast'
import { adminFetch } from '~/utils/adminApi'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const router = useRouter()

// Form data
const form = ref({
  product_id: '',
  license_type: '',
  email: '',
  password: '',
  license_key: '',
  quantity: 1
})


// Quantity-based fields for individual license entries
const quantityFields = ref([])

const products = ref([])
const isLoading = ref(false)

// Computed properties for conditional logic
const isProductKeyType = computed(() => form.value.license_type === 'product_key')
const isAccountType = computed(() => form.value.license_type === 'email_password')

// Load products
const loadProducts = async () => {
  try {
    const response = await adminFetch('/api/admin/tables/products')
    if (response && response.success) {
      products.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

// Update quantity fields based on quantity and license type
const updateQuantityFields = () => {
  const quantity = form.value.quantity || 1
  const targetLength = quantity - 1 // We need quantity-1 additional fields
  
  console.log('updateQuantityFields called. Quantity:', quantity, 'Target length:', targetLength, 'Current length:', quantityFields.value.length);
  
  // Recreate the entire array to ensure proper reactivity
  const newFields = []
  for (let i = 0; i < targetLength; i++) {
    if (quantityFields.value[i]) {
      // Keep existing data if available
      newFields.push({ ...quantityFields.value[i] })
    } else {
      // Create new field
      newFields.push({
        license_key: '',
        email: '',
        password: ''
      })
    }
  }
  
  quantityFields.value = newFields
  console.log('Updated quantityFields:', quantityFields.value);
}

// Update individual quantity field values
const updateQuantityFieldValue = (index, field, value) => {
  console.log('=== UPDATING FIELD ===');
  console.log('Index:', index, 'Field:', field, 'Value:', value);
  console.log('Current quantityFields before update:', JSON.stringify(quantityFields.value));
  
  // Ensure the array and object exist
  if (!quantityFields.value[index]) {
    quantityFields.value[index] = {
      license_key: '',
      email: '',
      password: ''
    }
  }
  
  // Update the field value
  quantityFields.value[index][field] = value
  
  console.log('Current quantityFields after update:', JSON.stringify(quantityFields.value));
  console.log('=== END UPDATE ===');
}

// Handle selection change
const onLicenseTypeChange = () => {
  console.log('License type changed to:', form.value.license_type);
  // Clear fields on type change
  form.value.email = ''
  form.value.password = ''
  form.value.license_key = ''
  
  // If switching to account type, clear license key
  if (form.value.license_type === 'email_password') {
    form.value.license_key = ''
  }
  
  // Update quantity fields when license type changes
  updateQuantityFields()
}

// Handle form submission
const handleAddLicense = async () => {
  isLoading.value = true
  const toast = useToast()
  
  try {
    
// Validate inputs
  if (!form.value.product_id || !form.value.license_type) {
    toast.error('Please fill in all required fields')
    return
  }

  if (!form.value.quantity || form.value.quantity < 1 || form.value.quantity > 100) {
    toast.error('Quantity must be between 1 and 100')
    return
  }

  // Validation for product key type
  if (form.value.license_type === 'product_key') {
    if (!form.value.license_key || !form.value.license_key.trim()) {
      toast.error('License key is required for Product Key type')
      return
    }
    
    // Validate additional license key fields if quantity > 1
    if (form.value.quantity > 1) {
      console.log('Validating additional license keys. quantityFields:', quantityFields.value);
      for (let i = 0; i < form.value.quantity - 1; i++) {
        const field = quantityFields.value[i];
        const licenseKey = field ? field.license_key : null;
        console.log(`Validating License #${i + 2}: field=`, field, 'licenseKey=', licenseKey);
        
        if (!field || !licenseKey || !licenseKey.trim()) {
          console.error(`Validation failed for License #${i + 2}`);
          toast.error(`License key is required for License #${i + 2}`)
          return
        }
      }
      console.log('All additional license keys validated successfully');
    }
  }
  
  // Additional validation for account type
  if (form.value.license_type === 'email_password') {
    if (!form.value.email || !form.value.password) {
      toast.error('Email and password are required for Account type')
      return
    }
    
    // Validate additional account fields if quantity > 1
    if (form.value.quantity > 1) {
      for (let i = 0; i < form.value.quantity - 1; i++) {
        if (!quantityFields.value[i] || !quantityFields.value[i].email || !quantityFields.value[i].password) {
          toast.error(`Email and password are required for Account #${i + 2}`)
          return
        }
      }
    }
  }

  toast.info('Creating licenses...', 2000)
  let successCount = 0

  for (let i = 0; i < form.value.quantity; i++) {
    const licenseData = {
      product_id: form.value.product_id,
      license_type: form.value.license_type,
      status: 'available'
    }

    if (form.value.license_type === 'product_key') {
      // For first license, use main field, for others use quantityFields
      if (i === 0) {
        licenseData.license_key = form.value.license_key.trim()
      } else {
        const userKey = quantityFields.value[i - 1] ? quantityFields.value[i - 1].license_key : ''
        console.log(`License ${i + 1}: checking quantityFields[${i - 1}]:`, quantityFields.value[i - 1], 'userKey:', userKey);
        licenseData.license_key = userKey.trim()
      }
    } else if (form.value.license_type === 'email_password') {
      // For first license, use main fields, for others use quantityFields
      if (i === 0) {
        licenseData.email = form.value.email
        licenseData.password = form.value.password
      } else {
        licenseData.email = quantityFields.value[i - 1].email
        licenseData.password = quantityFields.value[i - 1].password
      }
    }

    console.log('Sending license data:', licenseData);
    const response = await adminFetch('/api/admin/product-licenses', {
      method: 'POST',
      body: licenseData
    })

    if (response && response.success) {
      successCount++
      toast.info(`License ${i + 1} of ${form.value.quantity} created`, 1000)
    } else {
      throw new Error(`Failed to create license ${i + 1}: ${response?.message || 'Unknown error'}`)
    }
  }

  toast.success(`Successfully created ${successCount} licenses!`)
    
    // Wait 3 seconds before redirecting to allow viewing console logs
    console.log('=== License Creation Complete - Check logs above ===');
    console.log('Redirecting to dashboard in 3 seconds...');
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  } catch (error) {
    console.error('Error creating license:', error)
    toast.error('Error creating license: ' + error.message)
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
  await loadProducts()
  updateQuantityFields() // Initialize quantity fields
})

// Set page title
useHead({
  title: 'Add New License - Admin'
})
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.add-license-page {
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

.header-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  align-items: center;
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

.mass-mode-btn {
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-aurora-cyan);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  backdrop-filter: blur(10px);
}

.mass-mode-btn:hover {
  background: rgba(100, 255, 218, 0.2);
  border-color: var(--galaxy-aurora-cyan);
}

.mass-mode-btn.active {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
  border-color: var(--galaxy-aurora-cyan);
}

.form-hint {
  display: block;
  margin-top: var(--galaxy-space-xs);
  font-size: 0.85rem;
  color: var(--galaxy-cloud-gray);
  font-style: italic;
}

.form-hint i {
  margin-right: var(--galaxy-space-xs);
  color: var(--galaxy-aurora-cyan);
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

.license-form {
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

/* Additional dropdown styling for better compatibility */
.form-group select::-ms-expand {
  display: none;
}

.form-group select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.form-group input::placeholder {
  color: var(--galaxy-cloud-gray);
}

.form-group input:disabled,
.form-group select:disabled {
  background: rgba(30, 41, 59, 0.4);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
}

.form-group input:disabled::placeholder {
  color: rgba(255, 255, 255, 0.3);
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

/* Mass Quantity Styles */
.mass-quantity-section {
  margin-top: var(--galaxy-space-lg);
}

.quantity-fields {
  margin-top: var(--galaxy-space-lg);
}

.quantity-fields h3 {
  color: var(--galaxy-starlight);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 var(--galaxy-space-lg) 0;
  padding-bottom: var(--galaxy-space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.quantity-fields h3 i {
  margin-right: var(--galaxy-space-sm);
  color: var(--galaxy-aurora-cyan);
}

.license-keys-section,
.account-credentials-section {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
}

.quantity-field {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
}

.quantity-field label {
  font-weight: 600;
  color: var(--galaxy-aurora-cyan);
  font-size: 0.9rem;
  margin-bottom: var(--galaxy-space-sm);
  display: block;
}

.account-field {
  padding: var(--galaxy-space-lg);
}

.account-field h4 {
  color: var(--galaxy-aurora-cyan);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--galaxy-space-md) 0;
  padding-bottom: var(--galaxy-space-sm);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
