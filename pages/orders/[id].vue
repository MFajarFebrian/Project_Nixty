<template>
  <div class="order-detail-page">
    <div class="container">
      <div class="header-section">
        <NuxtLink to="/orders" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Back to Orders
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchOrderDetails" class="galaxy-button-primary">Try Again</button>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="order-details-container">
        <div class="order-card galaxy-card">
          <div class="order-header">
            <div class="order-info">
              <h2>Order #{{ order.order_id || order.id }}</h2>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
              <p v-if="order.status === 'failed' && order.order_id" class="midtrans-order-id">
                <i class="fas fa-exclamation-triangle"></i>
                Midtrans ID: {{ order.order_id }}
              </p>
            </div>
            <div class="status-badge" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
          </div>

          <div class="order-content">
            <div class="section">
              <h3>Product Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Product:</span>
                  <span class="value">{{ order.product?.name || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Category:</span>
                  <span class="value">{{ order.product?.category?.name || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Quantity:</span>
                  <span class="value">{{ order.quantity }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Unit Price:</span>
                  <span class="value price">{{ formatCurrency(order.product?.price || 0) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Total:</span>
                  <span class="value price total">{{ formatCurrency(order.total) }}</span>
                </div>
              </div>
            </div>

            <!-- License Information -->
            <div class="section" v-if="order.status === 'completed' && order.licenses && order.licenses.length > 0">
              <h3>License Information ({{ order.licenses.length }} License{{ order.licenses.length > 1 ? 's' : '' }})</h3>
              
              <!-- Loop through each license -->
              <div v-for="(license, index) in order.licenses" :key="index" class="license-card" :class="{ 'multiple-license': order.licenses.length > 1 }">
                <div class="license-status">
                  <i class="fas fa-key"></i>
                  <span>License {{ index + 1 }}{{ order.licenses.length > 1 ? ` of ${order.licenses.length}` : '' }}</span>
                </div>
                
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">License Type:</span>
                    <span class="value">{{ formatLicenseType(license.license_type) }}</span>
                  </div>
                  <div class="detail-item" v-if="license.max_usage > 1">
                    <span class="label">Max Usage:</span>
                    <span class="value">{{ license.max_usage }}</span>
                  </div>
                  <div class="detail-item" v-if="license.notes">
                    <span class="label">Notes:</span>
                    <span class="value">{{ license.notes }}</span>
                  </div>
                </div>

                <!-- License Details based on type -->
                <div v-if="license.license_type === 'product_key' && license.product_key" class="license-details">
                  <div class="license-key-section">
                    <h4>Product Key</h4>
                    <div class="key-container">
                      <code class="product-key">{{ showLicenseKey[index] ? license.product_key : '•'.repeat(license.product_key.length) }}</code>
                      <button @click="toggleLicenseKey(index)" class="toggle-key-btn">
                        <i :class="showLicenseKey[index] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <button @click="copyToClipboard(license.product_key)" class="copy-btn">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else-if="license.license_type === 'email_password' && license.account" class="license-details">
                  <div class="account-section">
                    <h4>Account Credentials</h4>
                    <div class="credential-item">
                      <span class="label">Email:</span>
                      <div class="credential-value">
                        <code>{{ license.account.email }}</code>
                        <button @click="copyToClipboard(license.account.email)" class="copy-btn">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                    <div class="credential-item">
                      <span class="label">Password:</span>
                      <div class="credential-value">
                        <code>{{ showPassword[index] ? license.account.password : '•'.repeat(license.account.password.length) }}</code>
                        <button @click="togglePassword(index)" class="toggle-key-btn">
                          <i :class="showPassword[index] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <button @click="copyToClipboard(license.account.password)" class="copy-btn">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No License Information for Completed Orders -->
            <div class="section" v-if="order.status === 'completed' && (!order.licenses || order.licenses.length === 0)">
              <h3>License Information</h3>
              <div class="license-card">
                <div class="license-status">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>No license information available</span>
                </div>
                <p style="color: var(--galaxy-cloud-gray); margin-top: var(--galaxy-space-md);">
                  This order is completed but license information is not available. Please contact support if you need assistance.
                </p>
              </div>
            </div>

            <!-- Payment Gateway Logs -->
            <div class="section" v-if="filteredPaymentLogs.length > 0">
              <h3>Payment Information</h3>
              <div class="payment-logs">
                <div v-for="log in filteredPaymentLogs" :key="log.id" class="log-item">
                  <span class="log-key">{{ formatLogKey(log.key) }}:</span>
                  <span class="log-value">{{ log.value }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUtils } from '~/composables/useUtils'
import { useToast } from '~/composables/useToast'

const { user, initUser } = useAuth()
const { formatCurrency } = useUtils()
const { success, error: showError } = useToast()

const route = useRoute()
const orderId = route.params.id

const order = ref(null)
const paymentLogs = ref([])
const isLoading = ref(true)
const error = ref(null)
const showLicenseKey = ref({}) // Change to object for multiple licenses
const showPassword = ref({}) // Change to object for multiple licenses

// Filter payment logs to exclude unwanted fields
const filteredPaymentLogs = computed(() => {
  const excludedKeys = [
    'midtrans_response', 
    'full_response',
    'payment_gateway_payload',
    'order_id' // Remove duplicate order_id since we show midtrans_order_id as "Order ID"
  ]
  
  return paymentLogs.value.filter(log => !excludedKeys.includes(log.key))
})

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status class helper
const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'status-success'
    case 'pending': return 'status-warning'
    case 'failed': return 'status-error'
    default: return 'status-neutral'
  }
}

// Get status text helper
const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Completed'
    case 'pending': return 'Pending'
    case 'failed': return 'Failed'
    default: return status || 'Unknown'
  }
}

// Format license type
const formatLicenseType = (type) => {
  switch (type) {
    case 'product_key': return 'Product Key'
    case 'email_password': return 'Account Credentials'
    default: return type
  }
}


// Format log key
const formatLogKey = (key) => {
  // Special handling for specific keys
  if (key === 'midtrans_order_id') {
    return 'Order ID'
  }
  
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Toggle license key visibility for specific license
const toggleLicenseKey = (index) => {
  showLicenseKey.value[index] = !showLicenseKey.value[index]
}

// Toggle password visibility for specific license
const togglePassword = (index) => {
  showPassword.value[index] = !showPassword.value[index]
}

// Copy to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    success('Copied to clipboard!')
  } catch (err) {
    showError('Failed to copy to clipboard')
  }
}

// Fetch order details
const fetchOrderDetails = async () => {
  if (!user.value) {
    error.value = 'Please log in to view order details'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const response = await $fetch(`/api/orders/${orderId}`, {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    })

    if (response.success) {
      order.value = response.order
      paymentLogs.value = response.paymentLogs || []
    } else {
      error.value = response.message || 'Failed to load order details'
    }
  } catch (err) {
    console.error('Error fetching order details:', err)
    error.value = err.message || 'Failed to load order details'
  } finally {
    isLoading.value = false
  }
}


// Initialize on mount
onMounted(async () => {
  try {
    isLoading.value = true
    await initUser()
    if (user.value) {
      await fetchOrderDetails()
    } else {
      error.value = 'Please log in to view order details'
      isLoading.value = false
    }
  } catch (err) {
    console.error('Error initializing user:', err)
    error.value = 'Failed to initialize. Please refresh and try again.'
    isLoading.value = false
  }
})

// Set page title
useHead({
  title: `Order #${orderId}`
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  padding: var(--galaxy-space-xl) var(--galaxy-space-md);
  color: var(--galaxy-starlight);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: var(--galaxy-space-2xl);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  color: var(--galaxy-aurora-cyan);
  text-decoration: none;
  transition: all var(--galaxy-transition-fast);
}

.back-btn:hover {
  color: var(--galaxy-starlight);
  transform: translateX(-2px);
}

.page-title {
  font-size: 2.5rem;
  margin: 0;
  background: var(--galaxy-aurora-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
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

.error-container {
  color: var(--galaxy-plasma-orange);
}

.error-container i {
  font-size: 3rem;
  margin-bottom: var(--galaxy-space-md);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Order Details */
.order-card {
  background: var(--galaxy-card-gradient);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-xl);
  box-shadow: var(--galaxy-shadow-medium);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--galaxy-space-xl);
  padding-bottom: var(--galaxy-space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-header h2 {
  font-size: 1.8rem;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.order-date {
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.midtrans-order-id {
  color: var(--galaxy-plasma-orange);
  font-size: 0.9rem;
  font-weight: 500;
  margin: var(--galaxy-space-sm) 0 0 0;
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--galaxy-radius-sm);
  border-left: 3px solid var(--galaxy-plasma-orange);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.midtrans-order-id i {
  color: var(--galaxy-plasma-orange);
  font-size: 0.85rem;
}

.status-badge {
  padding: var(--galaxy-space-xs) var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-success {
  background: rgba(34, 197, 94, 0.2);
  color: var(--galaxy-comet-green);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-warning {
  background: rgba(255, 215, 0, 0.2);
  color: var(--galaxy-nova-gold);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.status-error {
  background: rgba(239, 68, 68, 0.2);
  color: var(--galaxy-plasma-orange);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-neutral {
  background: rgba(156, 163, 175, 0.2);
  color: var(--galaxy-asteroid-gray);
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.section {
  margin-bottom: var(--galaxy-space-xl);
}

.section h3 {
  font-size: 1.3rem;
  color: var(--galaxy-aurora-cyan);
  margin-bottom: var(--galaxy-space-lg);
}

.detail-grid {
  display: grid;
  gap: var(--galaxy-space-md);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-sm) 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.detail-item .label {
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

.detail-item .value {
  color: var(--galaxy-starlight);
  font-weight: 600;
}

.detail-item .price {
  color: var(--galaxy-nova-gold);
  font-size: 1.1rem;
}

.detail-item .total {
  font-size: 1.2rem;
  font-weight: 700;
}

/* License Card */
.license-card {
  background: rgba(77, 208, 225, 0.05);
  border: 1px solid rgba(77, 208, 225, 0.2);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-lg);
  margin-top: var(--galaxy-space-md);
}

.license-card.multiple-license {
  margin-bottom: var(--galaxy-space-lg);
  border-left: 4px solid var(--galaxy-aurora-cyan);
  background: linear-gradient(135deg, rgba(77, 208, 225, 0.05) 0%, rgba(77, 208, 225, 0.02) 100%);
}

.license-card.multiple-license:last-child {
  margin-bottom: 0;
}

.license-status {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  color: var(--galaxy-aurora-cyan);
  font-weight: 600;
  margin-bottom: var(--galaxy-space-lg);
}

.license-details {
  margin-top: var(--galaxy-space-lg);
  padding-top: var(--galaxy-space-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.license-key-section h4,
.account-section h4 {
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-md);
}

.key-container {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  background: rgba(0, 0, 0, 0.3);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.product-key {
  flex: 1;
  background: transparent;
  color: var(--galaxy-starlight);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0;
  border: none;
}

.credential-item {
  margin-bottom: var(--galaxy-space-md);
}

.credential-item .label {
  display: block;
  color: var(--galaxy-cloud-gray);
  margin-bottom: var(--galaxy-space-xs);
  font-weight: 500;
}

.credential-value {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  background: rgba(0, 0, 0, 0.3);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.credential-value code {
  flex: 1;
  background: transparent;
  color: var(--galaxy-starlight);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.toggle-key-btn,
.copy-btn {
  background: rgba(77, 208, 225, 0.2);
  border: 1px solid rgba(77, 208, 225, 0.3);
  color: var(--galaxy-aurora-cyan);
  padding: var(--galaxy-space-xs);
  border-radius: var(--galaxy-radius-sm);
  cursor: pointer;
  transition: all var(--galaxy-transition-fast);
}

.toggle-key-btn:hover,
.copy-btn:hover {
  background: rgba(77, 208, 225, 0.3);
  transform: scale(1.05);
}


/* Payment Logs */
.payment-logs {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-lg);
}

.log-item {
  display: flex;
  justify-content: space-between;
  padding: var(--galaxy-space-xs) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
  border-bottom: none;
}

.log-key {
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

.log-value {
  color: var(--galaxy-starlight);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}


/* Responsive Design */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: var(--galaxy-space-md);
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-xs);
  }
  
  .key-container,
  .credential-value {
    flex-direction: column;
    gap: var(--galaxy-space-sm);
  }
}

@media (max-width: 480px) {
  .order-detail-page {
    padding: var(--galaxy-space-lg) var(--galaxy-space-sm);
  }
  
  .order-card {
    padding: var(--galaxy-space-lg);
  }
}
</style>
