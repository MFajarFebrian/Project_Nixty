<template>
  <div class="transactions-page-container">
    <div class="header-section">
      <h1 class="page-title galaxy-gradient-text">Order History</h1>
      <button 
        @click="syncAllTransactions" 
        :disabled="isSyncing"
        class="galaxy-button-primary sync-all-btn"
        title="Synchronize all pending transactions with Midtrans"
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
      <p class="no-data-text">You haven't placed any orders yet.</p>
      <NuxtLink to="/products" class="galaxy-button-primary">
        <i class="fas fa-shopping-cart"></i> Start Shopping
      </NuxtLink>
    </div>

    <div v-else class="transactions-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card galaxy-card">
        <div class="card-header">
          <div class="order-info">
            <span class="order-label">Order ID</span>
            <h2 class="order-id">{{ transaction.order_id }}</h2>
          </div>
          <span :class="['status-badge', getStatusClass(transaction.status)]">
            {{ formatStatus(transaction.status) }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="product-details">
            <p class="product-name">{{ transaction.product_name }}</p>
            <p class="amount">{{ formatCurrency(transaction.amount) }}</p>
          </div>
          <div class="payment-details">
            <div class="detail-item">
              <span class="detail-label">Order Date</span>
              <span class="detail-value">{{ formatDate(transaction.created_at) }}</span>
            </div>
            <div class="detail-item" v-if="transaction.payment_method">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value payment-method-badge">{{ formatPaymentMethod(transaction.payment_method) }}</span>
            </div>
            <div class="detail-item" v-if="transaction.va_number">
              <span class="detail-label">Payment Code</span>
              <span class="detail-value">{{ transaction.va_number }}</span>
            </div>
             <div class="detail-item" v-if="transaction.payment_gateway_status">
              <span class="detail-label">Gateway Status</span>
              <span :class="['gateway-status-badge', getStatusClass(transaction.payment_gateway_status)]">
                {{ formatStatus(transaction.payment_gateway_status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button 
            @click="checkMidtransStatus(transaction.order_id)" 
            :disabled="checkingStatus[transaction.order_id]"
            class="galaxy-button-secondary small icon-only"
            :title="checkingStatus[transaction.order_id] ? 'Checking...' : 'Check Status'"
          >
            <i v-if="checkingStatus[transaction.order_id]" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sync-alt"></i>
          </button>
          <NuxtLink 
            v-if="isTransactionCompleted(transaction.status, transaction.payment_gateway_status)"
            :to="`/profile/history_order/${transaction.id}`" 
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
          <button 
            v-if="transaction.payment_gateway_status === 'not_found_in_gateway'"
            @click="deleteTransaction(transaction.id)"
            :disabled="isDeleting[transaction.id]"
            class="galaxy-button-danger small"
          >
            <i v-if="isDeleting[transaction.id]" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            {{ isDeleting[transaction.id] ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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
const isDeleting = ref({}); // Track delete status for each transaction
const autoRefreshInterval = ref(null);
const autoSyncTimeout = ref(null);
const hasAutoSynced = ref(false);

const fetchTransactions = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    if (!user.value || !user.value.id) {
      throw new Error('User not authenticated.');
    }
    
    // Send user session in headers for security
    const response = await $fetch('/api/profile/history_order', {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      transactions.value = response.data;
      
      // Setup auto-sync after first load if not done yet
      if (!hasAutoSynced.value) {
        setupAutoSync();
      }
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
    const response = await $fetch('/api/profile/history_order/update-status', {
      method: 'POST',
      body: {
        order_id: orderId
      },
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      // Check if transaction was marked as not found in gateway
      if (response.data.not_found_in_gateway) {
        showError('Transaction not found in payment gateway. It will be automatically cleaned up.');
        // Auto-cleanup after marking as not found
        setTimeout(() => {
          performAutoCleanup();
        }, 2000);
      } else {
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
      showError('Transaction not found in payment gateway. It will be marked for cleanup.');
      // Auto-cleanup after marking as not found
      setTimeout(() => {
        performAutoCleanup();
      }, 2000);
    } else {
      showError('An unexpected error occurred while checking payment status.');
    }
  } finally {
    // Remove loading state
    checkingStatus.value[orderId] = false;
  }
};

const syncAllTransactions = async (autoSync = false) => {
  if (!autoSync) {
    isSyncing.value = true;
  }
  
  try {
    const response = await $fetch('/api/profile/history_order/sync-all', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      },
      body: {
        auto_sync: autoSync
      }
    });
    
    if (response.success) {
      if (!autoSync) {
        success(response.message);
      }
      
      if (response.data.updated > 0) {
        // Refresh transactions to show updated statuses
        setTimeout(() => {
          fetchTransactions();
        }, 1000);
      }
    } else {
      if (!autoSync) {
        showError(response.message || 'Gagal menyinkronkan transaksi.');
      }
    }
  } catch (err) {
    console.error('Error syncing all transactions:', err);
    if (!autoSync) {
      showError('Terjadi kesalahan saat menyinkronkan transaksi.');
    }
  } finally {
    if (!autoSync) {
      isSyncing.value = false;
    }
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
    'pending': 'Pending',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'settlement': 'Completed',
    'capture': 'Completed',
    'deny': 'Denied',
    'cancel': 'Cancelled',
    'expire': 'Expired',
    'failure': 'Failed',
    'not_found_in_gateway': 'Not Found in Gateway'
  };
  return statusMap[status.toLowerCase()] || status;
};

const getStatusClass = (status) => {
  if (!status) return 'status-default';
  const classMap = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'failed': 'status-failed',
    'cancelled': 'status-failed',
    'settlement': 'status-completed',
    'capture': 'status-completed',
    'deny': 'status-failed',
    'cancel': 'status-failed',
    'expire': 'status-failed',
    'failure': 'status-failed',
    'not_found_in_gateway': 'status-warning'
  };
  return classMap[status.toLowerCase()] || 'status-default';
};

const formatPaymentMethod = (method) => {
  if (!method) return '';
  const methodMap = {
    'bank_transfer': 'Transfer Bank',
    'echannel': 'eChannel',
    'cstore': 'Convenience Store',
    'gopay': 'Gopay',
    'qris': 'QRIS',
    'shopeepay': 'ShopeePay',
    'akulaku': 'Akulaku',
    'dana': 'Dana',
    'linkaja': 'LinkAja',
    'ovo': 'OVO',
    'bca_va': 'BCA VA',
    'bni_va': 'BNI VA',
    'bri_va': 'BRI VA',
    'mandiri_va': 'Mandiri VA',
    'permata_va': 'Permata VA',
    'other': 'Lainnya'
  };
  return methodMap[method.toLowerCase()] || method;
};

const isTransactionCompleted = (status, gatewayStatus) => {
  // Check if transaction is completed based on internal status or gateway status
  const completedStatuses = ['completed', 'settlement', 'capture'];
  return completedStatuses.includes(status?.toLowerCase()) || 
         completedStatuses.includes(gatewayStatus?.toLowerCase());
};

const isRepayable = (status) => {
  // Check if transaction can be repaid (pending, failed, cancelled, or expired)
  const repayableStatuses = ['pending', 'failed', 'cancelled', 'cancel', 'expire', 'deny', 'failure', 'not_found_in_gateway'];
  return repayableStatuses.includes(status?.toLowerCase());
};

const repay = async (orderId) => {
  isRepaying.value[orderId] = true;
  try {
    const response = await $fetch('/api/profile/history_order/repay', {
      method: 'POST',
      body: {
        transactionId: orderId
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
      window.snap.pay(response.token, {
        onSuccess: function(result) {
          console.log('Payment success:', result);
          success('Payment successful! Redirecting to order details...');
          
          // Refresh transactions and redirect to order details
          setTimeout(() => {
            fetchTransactions();
            // If a new transaction is created, you might want to redirect
            if (response.order_id) {
              // Option 1: Refresh the list
              // fetchTransactions();

              // Option 2: Navigate to the new transaction detail page
              navigateTo(`/profile/history_order/${orderId}`);
            }
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
      showError(response.message || 'Gagal memulai pembayaran ulang.');
    }
  } catch (err) {
    console.error('Error initiating repayment:', err);
    showError('Failed to initiate repayment. Please try again.');
  } finally {
    // Remove loading state
    isRepaying.value[orderId] = false;
  }
};

const deleteTransaction = async (transactionId) => {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  
  isDeleting.value[transactionId] = true;
  
  try {
    const response = await $fetch('/api/profile/history_order/delete-not-found', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      },
      body: {
        transactionId
      }
    });
    
    if (response.success) {
      success('Transaksi berhasil dihapus');
      // Refresh the transactions list
      fetchTransactions();
    } else {
      throw new Error(response.message || 'Gagal menghapus transaksi');
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
    showError(err.message || 'Terjadi kesalahan saat menghapus transaksi');
  } finally {
    isDeleting.value[transactionId] = false;
  }
};

// Setup auto-sync with 3-second delay
const setupAutoSync = () => {
  if (hasAutoSynced.value) return;
  
  // Initial sync after 3 seconds
  autoSyncTimeout.value = setTimeout(async () => {
    await syncAllTransactions(true);
    hasAutoSynced.value = true;
    
    // Start periodic refresh after initial sync
    startAutoRefresh();
  }, 3000); // 3 seconds delay
};

// Auto refresh function to periodically check for updates
const startAutoRefresh = () => {
  // Check every 10 seconds for pending transactions
  autoRefreshInterval.value = setInterval(async () => {
    // Only auto-sync if there are pending transactions
    const hasPendingTransactions = transactions.value.some(
      t => t.status === 'pending' || t.payment_gateway_status === 'pending'
    );
    
    if (hasPendingTransactions) {
      await fetchTransactions();
    }
  }, 10000); // 10 seconds
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
    autoRefreshInterval.value = null;
  }
};

const performAutoCleanup = async () => {
  try {
    console.log('🧹 Performing auto-cleanup...');
    const response = await $fetch('/api/profile/history_order/auto-cleanup', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success && response.data.deleted_count > 0) {
      success(`Auto-cleanup completed. Removed ${response.data.deleted_count} invalid transactions.`);
      // Refresh the transactions list
      fetchTransactions();
    }
  } catch (err) {
    console.error('Error in auto-cleanup:', err);
    // Don't show error to user for background cleanup
  }
};

onMounted(async () => {
  await fetchTransactions();
  // Auto-sync with Midtrans when page loads
  if (transactions.value.length > 0) {
    await syncAllTransactions(true);
  }
  
  // Start auto-refresh
  startAutoRefresh();
});

onUnmounted(() => {
  // Clean up interval on component unmount
  stopAutoRefresh();
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

.order-info {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.order-label {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
  font-weight: 500;
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
  outline: 2px solid #000;
  outline-offset: -1px;
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

.status-warning {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space);
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

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--galaxy-space-md);
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

.payment-details {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xs);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--galaxy-space-md);
}

.detail-label {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
  font-weight: 400;
}

.payment-method-badge {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space);
  padding: 0.2rem 0.6rem;
  border-radius: var(--galaxy-radius-sm);
  font-weight: bold;
  text-transform: uppercase;
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
.galaxy-button-accent.small,
.galaxy-button-danger.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Button styles */
.galaxy-button-primary,
.galaxy-button-secondary,
.galaxy-button-accent,
.galaxy-button-danger {
  border: none;
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-xs);
}

.galaxy-button-primary {
  background: var(--galaxy-button-gradient);
  color: var(--galaxy-starlight);
  box-shadow: var(--galaxy-shadow-small);
}

.galaxy-button-secondary {
  background: var(--galaxy-deep-space);
  color: var(--galaxy-aurora-cyan);
  border: 1px solid var(--galaxy-aurora-cyan);
  box-shadow: var(--galaxy-shadow-small);
}

.galaxy-button-accent {
  background: linear-gradient(135deg, var(--galaxy-aurora-cyan), var(--galaxy-nebula-blue));
  color: var(--galaxy-starlight);
  box-shadow: var(--galaxy-shadow-small);
}

.galaxy-button-danger {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #ff3547);
  color: var(--galaxy-starlight);
  box-shadow: 0 4px 12px rgba(255, 53, 71, 0.3);
}

.galaxy-button-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 53, 71, 0.5);
}

.galaxy-button-primary:hover:not(:disabled),
.galaxy-button-secondary:hover:not(:disabled),
.galaxy-button-accent:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-shadow-medium);
}

.galaxy-button-primary:disabled,
.galaxy-button-secondary:disabled,
.galaxy-button-accent:disabled,
.galaxy-button-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Icon-only button styling */
.galaxy-button-secondary.icon-only {
  padding: 0.5rem;
  min-width: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.galaxy-button-secondary.icon-only i {
  margin: 0;
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

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-xs);
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

  .product-details {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-xs);
  }

  .payment-details {
    width: 100%;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-xs);
  }

  .detail-label {
    width: 100%;
    text-align: left;
  }

  .detail-value {
    width: 100%;
    text-align: left;
  }

  .payment-method-badge {
    width: 100%;
    text-align: left;
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
