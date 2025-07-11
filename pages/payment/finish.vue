<template>
  <div class="payment-status-container">
    <div class="status-card" :class="statusClass">
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
      
      <div class="action-buttons">
        <NuxtLink to="/profile/transactions" class="galaxy-button-primary" v-if="isSuccess">
          <i class="fas fa-receipt"></i> View Order Details
        </NuxtLink>
        <NuxtLink to="/products" class="galaxy-button-secondary">
          <i class="fas fa-shopping-cart"></i> Continue Shopping
        </NuxtLink>
        <NuxtLink to="/" class="galaxy-button-tertiary" v-if="!isSuccess">
          <i class="fas fa-home"></i> Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

// Get URL parameters from Midtrans callback
const orderData = reactive({
  order_id: route.query.order_id || '',
  status_code: route.query.status_code || '',
  transaction_status: route.query.transaction_status || 'unknown'
})

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