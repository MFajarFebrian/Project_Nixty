<template>
  <div class="transactions-page-container">
    <div class="header-section">
      <h1 class="page-title galaxy-gradient-text">My Orders</h1>
      <button 
        @click="syncAllTransactions" 
        :disabled="isSyncing"
        class="galaxy-button-primary sync-all-btn"
        title="Sync all pending transactions with Midtrans"
      >
        <i v-if="isSyncing" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-sync-alt"></i>
        {{ isSyncing ? 'Syncing...' : 'Sync All' }}
      </button>
    </div>

    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <p class="error-text">&#10060; {{ error }}</p>
      <button @click="fetchTransactions" class="galaxy-button-secondary">Try Again</button>
    </div>

    <div v-else-if="transactions.length === 0" class="state-container">
      <p class="no-data-text">You haven't made any orders yet.</p>
      <NuxtLink to="/products" class="galaxy-button-primary">
        <i class="fas fa-shopping-cart"></i> Start Shopping
      </NuxtLink>
    </div>

    <div v-else class="transactions-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card galaxy-card">
        <div class="card-header">
          <h2 class="order-id">Order ID: {{ transaction.order_id }}</h2>
          <span :class="['status-badge', getStatusClass(transaction.status)]">
            {{ formatStatus(transaction.status) }}
          </span>
        </div>
        <div class="card-body">
          <p class="product-name">{{ transaction.product_name }}</p>
          <p class="amount">{{ formatCurrency(transaction.amount) }}</p>
          <p class="date">{{ formatDate(transaction.created_at) }}</p>
          <p v-if="transaction.payment_method" class="payment-method">
            Payment Method: {{ transaction.payment_method }}
          </p>
          <p v-if="transaction.va_number" class="va-number">
            VA Number: {{ transaction.va_number }}
          </p>
          <p v-if="transaction.payment_gateway_status" class="gateway-status">
            Gateway Status: 
            <span :class="['gateway-status-badge', getStatusClass(transaction.payment_gateway_status)]">
              {{ formatStatus(transaction.payment_gateway_status) }}
            </span>
          </p>
        </div>
        <div class="card-actions">
          <button 
            @click="checkMidtransStatus(transaction.order_id)" 
            :disabled="checkingStatus[transaction.order_id]"
            class="galaxy-button-secondary small"
          >
            <i v-if="checkingStatus[transaction.order_id]" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sync-alt"></i>
            {{ checkingStatus[transaction.order_id] ? 'Checking...' : 'Check Payment Status' }}
          </button>
          <NuxtLink 
            v-if="isTransactionCompleted(transaction.status, transaction.payment_gateway_status)"
            :to="`/profile/transactions/${transaction.id}`" 
            class="galaxy-button-primary small"
          >
            <i class="fas fa-file-invoice"></i>
            View Order
          </NuxtLink>
          <button 
            v-if="isRepayable(transaction.status)"
            @click="repay(transaction.order_id)"
            :disabled="isRepaying[transaction.order_id]"
            class="galaxy-button-accent small"
          >
            <i v-if="isRepaying[transaction.order_id]" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-redo"></i>
            {{ isRepaying[transaction.order_id] ? 'Processing...' : 'Pay Again' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';
import { useMidtransStatus } from '~/composables/useMidtransStatus';

const { user } = useAuth();
const { success, error: showError } = useToast();
const { checkStatus, isChecking: isMidtransChecking } = useMidtransStatus();

const transactions = ref([]);
const isLoading = ref(true);
const error = ref(null);
const checkingStatus = ref({}); // Track which transaction is being checked
const isSyncing = ref(false); // Track bulk sync status
const isRepaying = ref({}); // Track repay status for each transaction

const fetchTransactions = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    if (!user.value || !user.value.id) {
      throw new Error('User not authenticated.');
    }
    
    // Send user session in headers for security
    const response = await $fetch('/api/profile/transactions', {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      transactions.value = response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch transactions.');
    }
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const checkMidtransStatus = async (orderId) => {
  // Set loading state for this specific transaction
  checkingStatus.value[orderId] = true;
  
  try {
    const response = await $fetch('/api/profile/transactions/update-status', {
      method: 'POST',
      body: {
        order_id: orderId
      },
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      const midtransData = response.data.midtrans_response;
      const updatedTransaction = response.data.transaction;
      
      // Show appropriate message based on status
      const statusMessages = {
        'settlement': 'Payment completed successfully!',
        'capture': 'Payment captured successfully!',
        'pending': 'Payment is still pending. Please complete your payment.',
        'deny': 'Payment was denied by the payment provider.',
        'cancel': 'Payment was cancelled.',
        'expire': 'Payment session has expired.',
        'failure': 'Payment processing failed.'
      };
      
      const message = statusMessages[midtransData.transaction_status] || 'Payment status updated.';
      
      if (['settlement', 'capture'].includes(midtransData.transaction_status)) {
        success(message);
      } else if (midtransData.transaction_status === 'pending') {
        success(message);
      } else {
        showError(message);
      }
      
      // Refresh transactions to show updated status
      setTimeout(() => {
        fetchTransactions();
      }, 1000);
    } else {
      showError(response.message || 'Failed to update payment status.');
    }
  } catch (err) {
    console.error('Error in checkMidtransStatus:', err);
    if (err.statusCode === 404) {
      showError('Transaction not found in payment gateway.');
    } else {
      showError('An unexpected error occurred while checking payment status.');
    }
  } finally {
    // Remove loading state
    checkingStatus.value[orderId] = false;
  }
};

const syncAllTransactions = async () => {
  isSyncing.value = true;
  
  try {
    const response = await $fetch('/api/profile/transactions/sync-all', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      success(response.message);
      
      if (response.data.updated > 0) {
        // Refresh transactions to show updated statuses
        setTimeout(() => {
          fetchTransactions();
        }, 1000);
      }
    } else {
      showError(response.message || 'Failed to sync transactions.');
    }
  } catch (err) {
    console.error('Error syncing all transactions:', err);
    showError('An unexpected error occurred while syncing transactions.');
  } finally {
    isSyncing.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatus = (status) => {
  if (!status) return '';
  const statusMap = {
    // Internal statuses
    'pending': 'Pending',
    'completed': 'Completed', 
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    // Midtrans specific statuses
    'settlement': 'Completed',
    'capture': 'Completed',
    'deny': 'Denied',
    'cancel': 'Cancelled',
    'expire': 'Expired',
    'failure': 'Failed'
  };
  return statusMap[status.toLowerCase()] || status;
};

const getStatusClass = (status) => {
  if (!status) return 'default';
  const classMap = {
    // Internal statuses
    'pending': 'status-pending',
    'completed': 'status-completed',
    'failed': 'status-failed', 
    'cancelled': 'status-failed',
    // Midtrans specific statuses
    'settlement': 'status-completed',
    'capture': 'status-completed',
    'deny': 'status-failed',
    'cancel': 'status-failed',
    'expire': 'status-failed',
    'failure': 'status-failed'
  };
  return classMap[status.toLowerCase()] || 'status-default';
};

const isTransactionCompleted = (status, gatewayStatus) => {
  // Check if transaction is completed based on internal status or gateway status
  const completedStatuses = ['completed', 'settlement', 'capture'];
  return completedStatuses.includes(status?.toLowerCase()) || 
         completedStatuses.includes(gatewayStatus?.toLowerCase());
};

const isRepayable = (status) => {
  // Check if transaction can be repaid (pending, failed, cancelled, or expired)
  const repayableStatuses = ['pending', 'failed', 'cancelled', 'expire', 'deny', 'failure'];
  return repayableStatuses.includes(status?.toLowerCase());
};

const repay = async (orderId) => {
  // Set loading state for this specific transaction
  isRepaying.value[orderId] = true;
  
  try {
    // Call the repay API endpoint
    const response = await $fetch('/api/profile/transactions/repay', {
      method: 'POST',
      body: {
        order_id: orderId
      },
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      // Load Midtrans Snap script if not already loaded
      if (typeof window.snap === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', response.data.client_key);
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      // Open Midtrans Snap payment popup
      window.snap.pay(response.data.snap_token, {
        onSuccess: function(result) {
          console.log('Payment success:', result);
          success('Payment successful! Redirecting to order details...');
          
          // Refresh transactions and redirect to order details
          setTimeout(() => {
            fetchTransactions();
            navigateTo(`/profile/transactions/${response.data.transaction_id}`);
          }, 2000);
        },
        onPending: function(result) {
          console.log('Payment pending:', result);
          success('Payment is pending. Please complete your payment.');
          
          // Refresh transactions to show updated status
          setTimeout(() => {
            fetchTransactions();
          }, 1000);
        },
        onError: function(result) {
          console.log('Payment error:', result);
          showError('Payment failed. Please try again.');
        },
        onClose: function() {
          console.log('Payment popup closed');
          // User closed the popup without completing payment
          // Check payment status in case payment was completed
          checkMidtransStatus(orderId);
        }
      });
    } else {
      showError(response.message || 'Failed to initiate repayment.');
    }
  } catch (err) {
    console.error('Error initiating repayment:', err);
    showError('Failed to initiate repayment. Please try again.');
  } finally {
    // Remove loading state
    isRepaying.value[orderId] = false;
  }
};

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.transactions-page-container {
  max-width: 900px;
  margin: var(--galaxy-space-2xl) auto;
  padding: var(--galaxy-space-md);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-xl);
  flex-wrap: wrap;
  gap: var(--galaxy-space-md);
}

.page-title {
  font-size: 2.5rem;
  margin: 0;
  flex: 1;
}

.sync-all-btn {
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  font-size: 0.9rem;
  min-width: 120px;
  white-space: nowrap;
}

.sync-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.sync-all-btn i {
  margin-right: var(--galaxy-space-xs);
}

.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  gap: var(--galaxy-space-md);
  color: var(--galaxy-starlight);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--galaxy-asteroid-gray);
  border-left-color: var(--galaxy-aurora-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  color: var(--galaxy-pulsar-pink);
  font-size: 1.2rem;
}

.no-data-text {
  font-size: 1.2rem;
  margin-bottom: var(--galaxy-space-lg);
  color: var(--galaxy-starlight);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-lg);
}

.transaction-card {
  background: var(--galaxy-card-gradient);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-lg);
  box-shadow: var(--galaxy-shadow-medium);
  transition: all var(--galaxy-transition-normal);
}

.transaction-card:hover {
  transform: translateY(-3px);
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: var(--galaxy-glow-cyan);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-id {
  font-size: 1.2rem;
  color: var(--galaxy-starlight);
  margin: 0;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: var(--galaxy-radius-full);
  font-size: 0.8rem;
  font-weight: bold;
}

.status-pending {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space); /* Dark text for yellow background */
}

.status-completed {
  background-color: var(--galaxy-comet-green);
  color: var(--galaxy-starlight); /* White text for green background */
}

.status-failed {
  background-color: var(--galaxy-pulsar-pink);
  color: var(--galaxy-starlight); /* White text for pink background */
}

.status-default {
  background-color: var(--galaxy-asteroid-gray);
  color: var(--galaxy-starlight); /* White text for gray background */
}

.gateway-status {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.gateway-status-badge {
  padding: 0.2rem 0.5rem;
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

/* Gateway status badge colors */
.gateway-status-badge.status-pending {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space);
}

.gateway-status-badge.status-completed {
  background-color: var(--galaxy-comet-green);
  color: var(--galaxy-starlight);
}

.gateway-status-badge.status-failed {
  background-color: var(--galaxy-pulsar-pink);
  color: var(--galaxy-starlight);
}

.gateway-status-badge.status-default {
  background-color: var(--galaxy-asteroid-gray);
  color: var(--galaxy-starlight);
}

.card-body p {
  margin-bottom: var(--galaxy-space-xs);
  color: var(--galaxy-starlight);
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
}

.amount {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--galaxy-aurora-cyan);
}

.date {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
}

.payment-method, .va-number {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
}

.card-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  margin-top: var(--galaxy-space-md);
  flex-wrap: wrap;
}

.card-actions button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.card-actions button i,
.card-actions a i {
  margin-right: var(--galaxy-space-xs);
}

.galaxy-button-primary.small,
.galaxy-button-secondary.small,
.galaxy-button-accent.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: var(--galaxy-space-md);
  }
  
  .sync-all-btn {
    align-self: center;
    min-width: 140px;
  }

  .order-id {
    font-size: 1rem;
  }

  .status-badge {
    font-size: 0.7rem;
  }

  .amount {
    font-size: 1.1rem;
  }

  .card-actions {
    flex-direction: column;
  }
  
  .gateway-status {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-xs);
  }
}
</style>
