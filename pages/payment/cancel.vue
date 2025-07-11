<template>
  <div class="payment-status-container">
    <div class="status-card canceled">
      <div class="icon-wrapper">
        <i class="fas fa-times-circle"></i>
      </div>
      <h1 class="status-title">Transaction Canceled</h1>
      <p class="status-message">
        Your transaction has been canceled. If this was unintentional, please try again.
      </p>
      <div class="action-buttons">
        <NuxtLink to="/products" class="galaxy-button-primary">
          <i class="fas fa-shopping-cart"></i> Continue Shopping
        </NuxtLink>
        <NuxtLink to="/profile/transactions" class="galaxy-button-secondary">
          <i class="fas fa-history"></i> View My Transactions
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// You can add any specific logic here if needed, e.g., logging the cancellation.
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

.status-card.canceled {
  border-color: var(--galaxy-pulsar-pink);
}

.icon-wrapper {
  font-size: 4rem;
  margin-bottom: var(--galaxy-space-lg);
}

.status-card.canceled .icon-wrapper {
  color: var(--galaxy-pulsar-pink);
}

.status-title {
  font-size: 2rem;
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-md);
}

.status-message {
  font-size: 1.1rem;
  color: var(--galaxy-cloud-gray);
  margin-bottom: var(--galaxy-space-2xl);
  line-height: 1.6;
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
