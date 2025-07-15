<template>
  <div class="transaction-detail-page">
    <div class="container">
      <div class="page-header">
        <h1>Transaction Details</h1>
        <button @click="$router.back()" class="back-button">
          ← Back to Transactions
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading transaction details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <h2>Error</h2>
        <p>{{ error }}</p>
        <button @click="loadTransactionDetails" class="retry-button">Try Again</button>
      </div>

      <!-- Transaction Details -->
      <div v-else-if="transaction" class="transaction-content">
        <!-- Transaction Info Card -->
        <div class="transaction-info galaxy-card">
          <h2>Transaction Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Order ID:</label>
              <span class="order-id">{{ transaction.order_id }}</span>
            </div>
            <div class="info-item">
              <label>Product:</label>
              <span>{{ transaction.product_name }}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span :class="['status-badge', transaction.status]">
                {{ formatStatus(transaction.status) }}
              </span>
            </div>
            <div class="info-item">
              <label>Payment Method:</label>
              <span class="payment-method">{{ transaction.payment_method?.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <label>Date:</label>
              <span>{{ formatDate(transaction.created_at) }}</span>
            </div>
            <div class="info-item">
              <label>Amount:</label>
              <span class="amount">{{ formatCurrency(transaction.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- License Information -->
        <div v-if="transaction.status === 'completed'" class="license-section">
          <div class="license-header">
            <h2>Your License Information</h2>
            <button @click="loadLicenseInfo" class="refresh-button" :disabled="loadingLicense">
              <span v-if="loadingLicense">Loading...</span>
              <span v-else>🔄 Refresh</span>
            </button>
          </div>

          <!-- License Loading -->
          <div v-if="loadingLicense" class="license-loading">
            <div class="loading-spinner"></div>
            <p>Loading license information...</p>
          </div>

          <!-- License Error -->
          <div v-else-if="licenseError" class="license-error">
            <p>{{ licenseError }}</p>
            <button @click="loadLicenseInfo" class="retry-button">Try Again</button>
          </div>

          <!-- License Cards -->
          <div v-else-if="licenses.length > 0" class="license-cards">
            <div 
              v-for="(license, index) in licenses" 
              :key="index" 
              class="license-card galaxy-card"
            >
              <div class="license-header">
                <h3>License {{ index + 1 }}</h3>
                <span class="license-type">{{ formatLicenseType(license.license_type) }}</span>
              </div>
              
              <div class="license-content">
                <!-- Product Key -->
                <div v-if="license.product_key" class="license-field">
                  <label>Product Key:</label>
                  <div class="license-value">
                    <input 
                      :value="license.product_key" 
                      readonly 
                      class="license-input"
                      :id="'key-' + index"
                    />
                    <button @click="copyToClipboard(license.product_key, 'key-' + index)" class="copy-button">
                      📋 Copy
                    </button>
                  </div>
                </div>

                <!-- Email & Password -->
                <div v-if="license.email && license.password" class="license-field">
                  <label>Email:</label>
                  <div class="license-value">
                    <input 
                      :value="license.email" 
                      readonly 
                      class="license-input"
                      :id="'email-' + index"
                    />
                    <button @click="copyToClipboard(license.email, 'email-' + index)" class="copy-button">
                      📋 Copy
                    </button>
                  </div>
                  
                  <label>Password:</label>
                  <div class="license-value">
                    <input 
                      :type="showPassword[index] ? 'text' : 'password'" 
                      :value="license.password" 
                      readonly 
                      class="license-input"
                      :id="'password-' + index"
                    />
                    <button @click="togglePassword(index)" class="toggle-button">
                      {{ showPassword[index] ? '👁️' : '👁️‍🗨️' }}
                    </button>
                    <button @click="copyToClipboard(license.password, 'password-' + index)" class="copy-button">
                      📋 Copy
                    </button>
                  </div>
                </div>

                <!-- Additional Info -->
                <div v-if="license.additional_info" class="license-field">
                  <label>Additional Information:</label>
                  <div class="additional-info">
                    {{ license.additional_info }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No License Available -->
          <div v-else class="no-license">
            <p>No license information available for this transaction.</p>
            <button @click="loadLicenseInfo" class="retry-button">Check Again</button>
          </div>
        </div>

        <!-- Pending Transaction -->
        <div v-else-if="transaction.status === 'pending'" class="pending-message">
          <h3>⏳ Payment Pending</h3>
          <p>Your payment is being processed. License information will be available once payment is confirmed.</p>
        </div>

        <!-- Failed Transaction -->
        <div v-else-if="transaction.status === 'failed'" class="failed-message">
          <h3>❌ Payment Failed</h3>
          <p>This transaction failed. Please try again or contact support.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUtils } from '~/composables/useUtils'

const route = useRoute()
const { user, initUser } = useAuth()
const { formatCurrency } = useUtils()

// Transaction data
const transaction = ref(null)
const loading = ref(true)
const error = ref(null)

// License data
const licenses = ref([])
const loadingLicense = ref(false)
const licenseError = ref(null)
const showPassword = ref({})

// Load transaction details
const loadTransactionDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    const transactionId = route.params.id
    
    const response = await $fetch(`/api/profile/transactions/${transactionId}`, {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    })
    
    if (response.success) {
      transaction.value = response.transaction
      // If completed, load license info
      if (response.transaction.status === 'completed') {
        await loadLicenseInfo()
      }
    } else {
      error.value = response.message || 'Failed to load transaction'
    }
  } catch (err) {
    console.error('Error loading transaction:', err)
    error.value = err.message || 'Failed to load transaction details'
  } finally {
    loading.value = false
  }
}

// Load license information
const loadLicenseInfo = async () => {
  try {
    loadingLicense.value = true
    licenseError.value = null
    
    const response = await $fetch('/api/profile/transactions/get-license', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      },
      body: {
        order_id: transaction.value.order_id
      }
    })
    
    if (response.success) {
      licenses.value = response.licenses
      // Initialize password visibility
      showPassword.value = {}
      response.licenses.forEach((_, index) => {
        showPassword.value[index] = false
      })
    } else {
      licenseError.value = response.message || 'Failed to load license information'
    }
  } catch (err) {
    console.error('Error loading license:', err)
    licenseError.value = err.message || 'Failed to load license information'
  } finally {
    loadingLicense.value = false
  }
}

// Utility functions
const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

const formatLicenseType = (type) => {
  const typeMap = {
    'product_key': 'Product Key',
    'email_password': 'Email & Password'
  }
  return typeMap[type] || type
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const togglePassword = (index) => {
  showPassword.value[index] = !showPassword.value[index]
}

const copyToClipboard = async (text, inputId) => {
  try {
    await navigator.clipboard.writeText(text)
    // Visual feedback
    const button = document.querySelector(`#${inputId} + .copy-button`)
    if (button) {
      const originalText = button.textContent
      button.textContent = '✅ Copied!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    }
  } catch (err) {
    // Fallback for older browsers
    const input = document.getElementById(inputId)
    if (input) {
      input.select()
      document.execCommand('copy')
    }
  }
}

onMounted(() => {
  initUser()
  if (user.value) {
    loadTransactionDetails()
  }
})
</script>

<style scoped>
.transaction-detail-page {
  min-height: 100vh;
  background: var(--galaxy-void);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-lg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-xl);
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--galaxy-aurora-cyan);
}

.back-button {
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  padding: var(--galaxy-space-sm) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
}

.back-button:hover {
  background: var(--galaxy-cosmic-blue);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--galaxy-space-xl);
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(77, 208, 225, 0.3);
  border-radius: 50%;
  border-top-color: var(--galaxy-aurora-cyan);
  animation: spin 1s infinite linear;
  margin-bottom: var(--galaxy-space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 60px;
  height: 60px;
  background: var(--galaxy-plasma-orange);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: var(--galaxy-space-md);
}

.transaction-info {
  margin-bottom: var(--galaxy-space-xl);
  padding: var(--galaxy-space-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--galaxy-space-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xs);
}

.info-item label {
  font-weight: bold;
  color: var(--galaxy-aurora-cyan);
  font-size: 0.9rem;
}

.order-id {
  font-family: monospace;
  background: var(--galaxy-dark-matter);
  padding: var(--galaxy-space-xs);
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.9rem;
}

.status-badge {
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.completed {
  background: var(--galaxy-comet-green);
  color: var(--galaxy-void);
}

.status-badge.pending {
  background: var(--galaxy-solar-yellow);
  color: var(--galaxy-void);
}

.status-badge.failed {
  background: var(--galaxy-plasma-orange);
  color: var(--galaxy-starlight);
}

.payment-method {
  text-transform: uppercase;
  font-weight: bold;
  color: var(--galaxy-nova-gold);
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--galaxy-comet-green);
}

.license-section {
  margin-top: var(--galaxy-space-xl);
}

.license-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-lg);
}

.license-header h2 {
  color: var(--galaxy-aurora-cyan);
}

.refresh-button {
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
}

.refresh-button:hover:not(:disabled) {
  background: var(--galaxy-cosmic-blue);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.license-cards {
  display: grid;
  gap: var(--galaxy-space-lg);
}

.license-card {
  padding: var(--galaxy-space-lg);
  border: 1px solid var(--galaxy-aurora-cyan);
}

.license-card .license-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-md);
  padding-bottom: var(--galaxy-space-sm);
  border-bottom: 1px solid var(--galaxy-aurora-cyan);
}

.license-card .license-header h3 {
  color: var(--galaxy-starlight);
  margin: 0;
}

.license-type {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-void);
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.8rem;
  font-weight: bold;
}

.license-content {
  display: grid;
  gap: var(--galaxy-space-md);
}

.license-field {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xs);
}

.license-field label {
  font-weight: bold;
  color: var(--galaxy-aurora-cyan);
  font-size: 0.9rem;
}

.license-value {
  display: flex;
  gap: var(--galaxy-space-xs);
}

.license-input {
  flex: 1;
  background: var(--galaxy-dark-matter);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  padding: var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
  font-family: monospace;
  font-size: 0.9rem;
}

.copy-button, .toggle-button {
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  padding: var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--galaxy-transition-normal);
  white-space: nowrap;
}

.copy-button:hover, .toggle-button:hover {
  background: var(--galaxy-cosmic-blue);
}

.download-link {
  display: inline-block;
  background: var(--galaxy-comet-green);
  color: var(--galaxy-void);
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  text-decoration: none;
  font-weight: bold;
  transition: var(--galaxy-transition-normal);
}

.download-link:hover {
  background: var(--galaxy-nova-gold);
}

.additional-info {
  background: var(--galaxy-dark-matter);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-sm);
  border-left: 3px solid var(--galaxy-aurora-cyan);
  font-style: italic;
}

.pending-message, .failed-message, .no-license {
  text-align: center;
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-dark-matter);
  border-radius: var(--galaxy-radius-lg);
  margin-top: var(--galaxy-space-lg);
}

.pending-message h3 {
  color: var(--galaxy-solar-yellow);
  margin-bottom: var(--galaxy-space-md);
}

.failed-message h3 {
  color: var(--galaxy-plasma-orange);
  margin-bottom: var(--galaxy-space-md);
}

.retry-button {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-void);
  border: none;
  padding: var(--galaxy-space-sm) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  font-weight: bold;
  transition: var(--galaxy-transition-normal);
  margin-top: var(--galaxy-space-md);
}

.retry-button:hover {
  background: var(--galaxy-nova-gold);
}

.license-loading, .license-error {
  text-align: center;
  padding: var(--galaxy-space-lg);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--galaxy-space-md);
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .license-header {
    flex-direction: column;
    gap: var(--galaxy-space-md);
  }
  
  .license-value {
    flex-direction: column;
  }
}
</style>
