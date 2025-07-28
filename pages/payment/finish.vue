<template>
  <div class="payment-status-container">
    <!-- Loading Overlay -->
    <div v-if="isProcessingLicense" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2 class="loading-title">Processing License...</h2>
        <p class="loading-message">Please wait while we activate your license</p>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="status-card" :class="statusClass" v-show="!isProcessingLicense">
      <div class="icon-wrapper">
        <i :class="statusIcon"></i>
      </div>
      <h1 class="status-title">{{ statusTitle }}</h1>
      <p class="status-message">
        {{ statusMessage }}
      </p>
      
      <!-- Order Details -->
      <div class="order-details" v-if="orderData.order_id">
        <div class="detail-row">
          <span>Order ID:</span>
          <span class="order-id">{{ orderData.order_id }}</span>
        </div>
        <div class="detail-row" v-if="orderData.status_code">
          <span>Status Code:</span>
          <span>{{ orderData.status_code }}</span>
        </div>
        <div class="detail-row" v-if="orderData.transaction_status">
          <span>Transaction Status:</span>
          <span>{{ orderData.transaction_status }}</span>
        </div>
      </div>
      
      <div class="finish-actions">
        <NuxtLink :to="`/orders/${orderData.order_id}`" class="galaxy-button-primary" v-if="isSuccess && orderData.order_id">
          <i class="fas fa-eye"></i> Detail Order
        </NuxtLink>
        <NuxtLink to="/orders" class="galaxy-button-primary" v-else-if="isSuccess">
          <i class="fas fa-receipt"></i> Detail Order
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
const route = useRoute()
const { success: showSuccessToast, info: showInfoToast, error: showErrorToast } = useToast()

// Get URL parameters from Midtrans callback
const orderData = reactive({
  order_id: route.query.order_id || '',
  status_code: route.query.status_code || '',
  transaction_status: route.query.transaction_status || 'unknown'
})

// Loading state for license processing
const isProcessingLicense = ref(false)

// No longer need transactionId since we use orderData.order_id directly

// Determine status based on transaction_status
const statusInfo = computed(() => {
  const status = orderData.transaction_status.toLowerCase()
  
  switch (status) {
    case 'settlement':
    case 'capture':
      return {
        class: 'success',
        icon: 'fas fa-check-circle',
        title: 'Payment Successful!',
        message: 'Your payment has been successfully processed. Thank you for your purchase!',
        isSuccess: true
      }
    
    case 'pending':
      return {
        class: 'pending',
        icon: 'fas fa-clock',
        title: 'Payment Pending',
        message: 'Your payment is being processed. Please wait for confirmation or check your payment method.',
        isSuccess: false
      }
    
    case 'deny':
      return {
        class: 'error',
        icon: 'fas fa-times-circle',
        title: 'Payment Denied',
        message: 'Your payment was denied by the payment provider. Please try again with a different payment method.',
        isSuccess: false
      }
    
    case 'cancel':
      return {
        class: 'error',
        icon: 'fas fa-ban',
        title: 'Payment Cancelled',
        message: 'Your payment was cancelled. If this was not intentional, please try again.',
        isSuccess: false
      }
    
    case 'expire':
      return {
        class: 'error',
        icon: 'fas fa-hourglass-end',
        title: 'Payment Expired',
        message: 'Your payment session has expired. Please create a new order to continue.',
        isSuccess: false
      }
    
    case 'failure':
      return {
        class: 'error',
        icon: 'fas fa-exclamation-triangle',
        title: 'Payment Failed',
        message: 'Payment processing failed. Please try again or contact support if the problem persists.',
        isSuccess: false
      }
    
    default:
      return {
        class: 'unknown',
        icon: 'fas fa-question-circle',
        title: 'Unknown Status',
        message: 'We could not determine the payment status. Please contact support for assistance.',
        isSuccess: false
      }
  }
})

// Computed properties for template
const statusClass = computed(() => statusInfo.value.class)
const statusIcon = computed(() => statusInfo.value.icon)
const statusTitle = computed(() => statusInfo.value.title)
const statusMessage = computed(() => statusInfo.value.message)
const isSuccess = computed(() => statusInfo.value.isSuccess)

// Log the received data for debugging
console.log('Payment finish page - Received data:', orderData)

// Removed getTransactionId function - no longer needed since we use orderData.order_id directly

// Auto-process license for successful payments
const autoProcessLicense = async () => {
  if (orderData.transaction_status === 'settlement' || orderData.transaction_status === 'capture') {
    console.log('🎯 Auto-processing license for successful payment...')
    
    // Show loading state
    isProcessingLicense.value = true
    
    try {
      const response = await $fetch('/api/payment/auto-process-license', {
        method: 'POST',
        body: {
          order_id: orderData.order_id,
          transaction_status: orderData.transaction_status
        }
      })
      
      if (response.success) {
        console.log('✅ License auto-processing completed:', response)
        if (response.already_processed) {
          console.log(`📝 License already processed (${response.licenses_count} license(s))`)
          showInfoToast(
            `🎉 Payment successful! Your license & guide have been sent to your email.`, 
            6000
          )
        } else {
          console.log(`🎉 Successfully processed ${response.licenses_processed} license(s)`)
          showSuccessToast(
            `🎉 Payment successful! Your ${response.licenses_processed > 1 ? 'licenses & guides have' : 'license & guide has'} been sent to your email.`, 
            8000
          )
        }
      } else {
        console.log('⚠️ License auto-processing skipped:', response.message)
        showInfoToast(`Payment successful! Please check your email or contact support for license delivery.`, 6000)
      }
    } catch (error) {
      console.error('❌ License auto-processing failed:', error)
      showErrorToast(`Payment successful but license delivery failed. Please contact support with Order ID: ${orderData.order_id}`, 8000)
    } finally {
      // Hide loading state
      isProcessingLicense.value = false
    }
  }
}

// Show notification for non-success statuses
const showPaymentStatusNotification = () => {
  const status = orderData.transaction_status.toLowerCase()
  
  switch (status) {
    case 'pending':
      showInfoToast('Payment is pending. Please wait for confirmation.', 5000)
      break
    case 'deny':
      showErrorToast('Payment was denied. Please try again with a different payment method.', 6000)
      break
    case 'cancel':
      showErrorToast('Payment was cancelled.', 4000)
      break
    case 'expire':
      showErrorToast('Payment session expired. Please create a new order.', 6000)
      break
    case 'failure':
      showErrorToast('Payment failed. Please try again or contact support.', 6000)
      break
  }
}

// Run auto-processing on page load
onMounted(async () => {
  if (orderData.order_id && orderData.transaction_status) {
    // Show notification for success/failure
    if (orderData.transaction_status === 'settlement' || orderData.transaction_status === 'capture') {
      // Process license for successful payments
      autoProcessLicense()
    } else {
      // Show notification for failed/pending payments
      showPaymentStatusNotification()
    }
  }
})
</script>

<style scoped>
.payment-status-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-deep-space);
}

.status-card {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-2xl);
  text-align: center;
  box-shadow: var(--galaxy-shadow-large);
  max-width: 500px;
  width: 100%;
  border: 1px solid var(--galaxy-asteroid-gray);
}

.status-card.success {
  border-color: var(--galaxy-comet-green);
}

.status-card.pending {
  border-color: var(--galaxy-solar-yellow);
}

.status-card.error {
  border-color: var(--galaxy-pulsar-pink);
}

.status-card.unknown {
  border-color: var(--galaxy-cloud-gray);
}

.icon-wrapper {
  font-size: 4rem;
  margin-bottom: var(--galaxy-space-lg);
}

.status-card.success .icon-wrapper {
  color: var(--galaxy-comet-green);
}

.status-card.pending .icon-wrapper {
  color: var(--galaxy-solar-yellow);
}

.status-card.error .icon-wrapper {
  color: var(--galaxy-pulsar-pink);
}

.status-card.unknown .icon-wrapper {
  color: var(--galaxy-cloud-gray);
}

.status-title {
  font-size: 2rem;
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-md);
}

.status-message {
  font-size: 1.1rem;
  color: var(--galaxy-cloud-gray);
  margin-bottom: var(--galaxy-space-lg);
  line-height: 1.6;
}

.order-details {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
  margin-bottom: var(--galaxy-space-2xl);
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: var(--galaxy-space-xs) 0;
  color: var(--galaxy-cloud-gray);
  font-size: 0.9rem;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--galaxy-aurora-cyan);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
}

.galaxy-button-primary,
.galaxy-button-secondary,
.galaxy-button-tertiary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--galaxy-transition-normal);
}

.galaxy-button-primary {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  border: none;
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.galaxy-button-secondary {
  background: transparent;
  border: 1px solid var(--galaxy-aurora-cyan);
  color: var(--galaxy-aurora-cyan);
}

.galaxy-button-secondary:hover {
  background: rgba(77, 208, 225, 0.1);
}

.galaxy-button-tertiary {
  background: transparent;
  border: 1px solid var(--galaxy-cloud-gray);
  color: var(--galaxy-cloud-gray);
}

.galaxy-button-tertiary:hover {
  background: rgba(128, 128, 128, 0.1);
  border-color: var(--galaxy-starlight);
  color: var(--galaxy-starlight);
}

@media (max-width: 600px) {
  .status-card {
    padding: var(--galaxy-space-xl);
  }

  .status-title {
    font-size: 1.5rem;
  }

  .status-message {
    font-size: 1rem;
  }
}
</style>