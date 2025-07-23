<template>
  <div class="payment-status-container">
    <div class="status-card unfinish">
      <div class="icon-wrapper">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h1 class="status-title">Transaction Unfinished</h1>
      <p class="status-message">
        Your transaction could not be completed. This might be due to an incomplete payment process or you closed the payment window.
      </p>
      
      <!-- Show order details if available -->
      <div class="order-details" v-if="route.query.order_id">
        <div class="detail-row">
          <span>Order ID:</span>
          <span class="order-id">{{ route.query.order_id }}</span>
        </div>
        <div class="detail-row" v-if="route.query.transaction_status">
          <span>Status:</span>
          <span>{{ route.query.transaction_status }}</span>
        </div>
      </div>
      <div class="actions">
        <NuxtLink to="/orders" class="galaxy-button-secondary">View My Orders</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

// Log the received data for debugging
console.log('Payment unfinish page - Received query:', route.query)
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

.status-card.unfinish {
  border-color: var(--galaxy-solar-yellow);
}

.icon-wrapper {
  font-size: 4rem;
  margin-bottom: var(--galaxy-space-lg);
}

.status-card.unfinish .icon-wrapper {
  color: var(--galaxy-solar-yellow);
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
.galaxy-button-secondary {
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