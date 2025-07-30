<template>
  <div class="transactions-page-container">
    <div class="header-section">
      <h1 class="page-title galaxy-gradient-text">My Orders</h1>
      <button 
        v-if="!isLoading && transactions.length > 0" 
        @click="syncAllTransactions()"
        class="galaxy-button-secondary sync-btn"
        :disabled="isSyncing"
        title="Sync All Orders"
      >
        <i class="fas fa-sync-alt" :class="{ 'spinning': isSyncing }"></i>
        Sync All
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your orders...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="fetchTransactions" class="galaxy-button-primary">Try Again</button>
    </div>
    
    <!-- No Orders State -->
    <div v-else-if="transactions.length === 0" class="no-transactions">
      <i class="fas fa-shopping-cart"></i>
      <h3>No Orders Yet</h3>
      <p>You don't have any orders yet. Start shopping to see your orders here.</p>
    </div>
    
    <!-- Orders List -->
    <div v-else class="transactions-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card galaxy-card">
        <div class="transaction-header">
          <div class="order-info">
            <h3>Order #{{ transaction.order_id || transaction.id }}</h3>
            <p class="order-date">{{ formatDate(transaction.created_at) }}</p>
          </div>
          <div class="status-badge" :class="getStatusClass(transaction.status)">
            {{ getStatusText(transaction.status) }}
          </div>
        </div>
        
        <div class="transaction-details">
          <div class="product-info">
            <div class="product-details">
              <h4>Product: {{ getProductName(transaction) }}</h4>
              <p>Quantity: {{ transaction.quantity }}</p>
              <p v-if="transaction.status === 'completed' && transaction.license_count > 0" class="license-info">
                <i class="fas fa-key"></i>
                {{ transaction.license_count }} License{{ transaction.license_count > 1 ? 's' : '' }} Available
              </p>
              <p class="price">Total: {{ formatCurrency(transaction.total) }}</p>
              <p v-if="transaction.status === 'failed' && transaction.order_id" class="midtrans-id">
                <i class="fas fa-exclamation-triangle"></i>
                Midtrans ID: {{ transaction.order_id }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="card-actions">
          <button 
            @click="checkMidtransStatus(transaction.id)"
            class="galaxy-button-secondary small"
            :disabled="isCheckingStatus[transaction.id]"
            title="Check Status"
          >
            <i class="fas fa-sync" :class="{ 'fa-spin': isCheckingStatus[transaction.id] }"></i>
          </button>
          
          <NuxtLink 
            :to="`/orders/${transaction.order_id || transaction.id}`"
            class="galaxy-button-primary small"
          >
            <i class="fas fa-eye"></i>
            Detail
          </NuxtLink>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUtils } from '~/composables/useUtils'

const { user, initUser } = useAuth()
const { formatCurrency } = useUtils()

// Reactive data
const transactions = ref([])
const isLoading = ref(true)
const error = ref(null)
const isSyncing = ref(false)
const isCheckingStatus = reactive({})
const isRepaying = reactive({})

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

// Get product name helper
const getProductName = (transaction) => {
  // Try to get product name from different possible sources
  if (transaction.product_name) return transaction.product_name
  if (transaction.product && transaction.product.name) return transaction.product.name
  return `Product #${transaction.product_id}`
}

// Fetch transactions function
const fetchTransactions = async () => {
  if (!user.value) {
    error.value = 'Please log in to view your orders'
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    const response = await $fetch('/api/orders', {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    })
    
    transactions.value = response.transactions || []
  } catch (err) {
    console.error('Error fetching transactions:', err)
    error.value = err.message || 'Failed to load orders'
  } finally {
    isLoading.value = false
  }
}

// Check Midtrans status function
const checkMidtransStatus = async (transactionId) => {
  if (!user.value) return
  
  try {
    isCheckingStatus[transactionId] = true
    
    const response = await $fetch('/api/orders/update-status', {
      method: 'POST',
      body: {
        order_id: transactionId
      },
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    })
    
    if (response.success) {
      // Refresh transactions to get updated status
      await fetchTransactions()
    }
  } catch (err) {
    console.error('Error checking status:', err)
  } finally {
    isCheckingStatus[transactionId] = false
  }
}

// Sync all transactions function
const syncAllTransactions = async (autoSync = false) => {
  if (!user.value) return
  
  try {
    isSyncing.value = true
    
    const response = await $fetch('/api/orders/sync-all', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    })
    
    if (response.success) {
      // Refresh transactions to get updated statuses
      await fetchTransactions()
    }
  } catch (err) {
    console.error('Error syncing transactions:', err)
  } finally {
    isSyncing.value = false
  }
}



// Initialize on mount
onMounted(async () => {
  await initUser()
  if (user.value) {
    await fetchTransactions()
  } else {
    error.value = 'Please log in to view your orders'
    isLoading.value = false
  }
})

// Set page title
useHead({
  title: 'My Orders'
})
</script>

<style scoped>
.transactions-page-container {
  min-height: 100vh;
  padding: var(--galaxy-space-xl) var(--galaxy-space-md);
  color: var(--galaxy-starlight);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-2xl);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.page-title {
  font-size: 2.5rem;
  margin: 0;
  background: var(--galaxy-aurora-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Loading State */
.loading-container {
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

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--galaxy-plasma-orange);
}

.error-container i {
  font-size: 3rem;
  margin-bottom: var(--galaxy-space-md);
}

/* No Orders State */
.no-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--galaxy-cloud-gray);
}

.no-transactions i {
  font-size: 4rem;
  margin-bottom: var(--galaxy-space-lg);
  color: var(--galaxy-aurora-cyan);
}

.no-transactions h3 {
  font-size: 1.8rem;
  margin-bottom: var(--galaxy-space-md);
  color: var(--galaxy-starlight);
}

.no-transactions p {
  font-size: 1.1rem;
  margin-bottom: var(--galaxy-space-xl);
  max-width: 400px;
  line-height: 1.6;
}

/* Transactions List */
.transactions-list {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: var(--galaxy-space-lg);
}

.transaction-card {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-lg);
  border: 1px solid var(--galaxy-asteroid-gray);
  box-shadow: var(--galaxy-shadow-medium);
  transition: var(--galaxy-transition-normal);
}

.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-shadow-large);
  border-color: var(--galaxy-aurora-cyan);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--galaxy-space-lg);
}

.order-info h3 {
  margin: 0 0 var(--galaxy-space-xs) 0;
  color: var(--galaxy-starlight);
  font-size: 1.3rem;
}

.order-date {
  margin: 0;
  color: var(--galaxy-cloud-gray);
  font-size: 0.9rem;
}

/* Status Badges */
.status-badge {
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
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

/* Transaction Details */
.transaction-details {
  margin-bottom: var(--galaxy-space-lg);
}

.product-details h4 {
  margin: 0 0 var(--galaxy-space-sm) 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 1.1rem;
}

.product-details p {
  margin: var(--galaxy-space-xs) 0;
  color: var(--galaxy-cloud-gray);
}

.product-details .price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--galaxy-nova-gold);
}

.license-info {
  font-size: 0.9rem;
  color: var(--galaxy-aurora-cyan);
  font-weight: 500;
  margin: var(--galaxy-space-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.license-info i {
  color: var(--galaxy-aurora-cyan);
  font-size: 0.8rem;
}

.midtrans-id {
  font-size: 0.9rem;
  color: var(--galaxy-plasma-orange);
  font-weight: 500;
  margin-top: var(--galaxy-space-sm) !important;
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--galaxy-radius-sm);
  border-left: 3px solid var(--galaxy-plasma-orange);
}

.midtrans-id i {
  margin-right: var(--galaxy-space-xs);
  color: var(--galaxy-plasma-orange);
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: var(--galaxy-space-sm);
  flex-wrap: wrap;
}

.small {
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  font-size: 0.85rem;
}

/* Button Styles */
.galaxy-button-primary,
.galaxy-button-secondary,
.galaxy-button-danger {
  display: inline-flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  padding: var(--galaxy-space-sm) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all var(--galaxy-transition-normal);
  font-size: 0.95rem;
}

.galaxy-button-primary {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.galaxy-button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.galaxy-button-secondary {
  background: transparent;
  border: 1px solid var(--galaxy-aurora-cyan);
  color: var(--galaxy-aurora-cyan);
}

.galaxy-button-secondary:hover:not(:disabled) {
  background: rgba(77, 208, 225, 0.1);
  transform: translateY(-1px);
}

.galaxy-button-danger {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: var(--galaxy-plasma-orange);
}

.galaxy-button-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.galaxy-button-primary:disabled,
.galaxy-button-secondary:disabled,
.galaxy-button-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: var(--galaxy-space-md);
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .transaction-header {
    flex-direction: column;
    gap: var(--galaxy-space-sm);
    align-items: flex-start;
  }
  
  .card-actions {
    justify-content: flex-start;
  }
  
  .no-transactions i {
    font-size: 3rem;
  }
  
  .no-transactions h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .transactions-page-container {
    padding: var(--galaxy-space-lg) var(--galaxy-space-sm);
  }
  
  .transaction-card {
    padding: var(--galaxy-space-md);
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .card-actions .small {
    width: 100%;
    justify-content: center;
  }
}
</style>
