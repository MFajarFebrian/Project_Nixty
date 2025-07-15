<template>
  <div class="admin-container">
    <div class="header-section">
      <h1 class="page-title">Not Found in Gateway Transactions</h1>
      <div class="action-buttons">
        <button @click="fetchTransactions" class="admin-button refresh-btn" :disabled="isLoading">
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sync-alt"></i>
          Refresh
        </button>
        <button @click="runCleanup(true)" class="admin-button preview-btn" :disabled="isLoading || isRunningCleanup">
          <i v-if="isRunningCleanup && isDryRun" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-search"></i>
          Preview Cleanup
        </button>
        <button @click="runCleanup(false)" class="admin-button danger-btn" :disabled="isLoading || isRunningCleanup">
          <i v-if="isRunningCleanup && !isDryRun" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-trash"></i>
          Run Cleanup
        </button>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <label for="daysOld">Days Old:</label>
        <input 
          type="number" 
          id="daysOld" 
          v-model="daysOld" 
          min="1" 
          max="365" 
          class="admin-input"
          :disabled="isRunningCleanup"
        >
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading transactions...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchTransactions" class="admin-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="transactions.length === 0" class="empty-state">
        <p>No transactions with "not_found_in_gateway" status found.</p>
      </div>

      <div v-else class="results-section">
        <div class="results-header">
          <h2>{{ transactions.length }} Transactions Found</h2>
          <button 
            v-if="selectedTransactions.length > 0" 
            @click="deleteSelected" 
            class="admin-button danger-btn"
            :disabled="isDeleting"
          >
            <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
            Delete Selected ({{ selectedTransactions.length }})
          </button>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  :checked="selectAll" 
                  @change="toggleSelectAll" 
                  class="checkbox"
                >
              </th>
              <th>ID</th>
              <th>Order ID</th>
              <th>Product</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>
                <input 
                  type="checkbox" 
                  :value="transaction.id" 
                  v-model="selectedTransactions"
                  class="checkbox"
                >
              </td>
              <td>{{ transaction.id }}</td>
              <td>{{ transaction.order_id }}</td>
              <td>{{ transaction.product_name }}</td>
              <td>{{ transaction.email }}</td>
              <td>{{ formatCurrency(transaction.amount) }}</td>
              <td>{{ formatDate(transaction.created_at) }}</td>
              <td>{{ formatDate(transaction.updated_at) }}</td>
              <td>
                <button 
                  @click="deleteTransaction(transaction.id)" 
                  class="admin-button small danger-btn"
                  :disabled="isDeleting || deletingTransactions[transaction.id]"
                >
                  <i v-if="deletingTransactions[transaction.id]" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="cleanupResults" class="cleanup-results">
        <h3>Cleanup Results</h3>
        <div class="results-info">
          <p>
            <strong>{{ isDryRun ? 'Preview Mode:' : 'Cleanup Completed:' }}</strong> 
            {{ cleanupResults.count || cleanupResults.deleted }} transactions 
            {{ isDryRun ? 'would be' : 'were' }} deleted
          </p>
          <p><small>Transactions older than {{ daysOld }} days with "not_found_in_gateway" status</small></p>
        </div>
        
        <div v-if="isDryRun && cleanupResults.transactions?.length > 0" class="preview-list">
          <h4>Transactions that would be deleted:</h4>
          <ul>
            <li v-for="tx in cleanupResults.transactions" :key="tx.id">
              ID: {{ tx.id }} - {{ tx.product_name }} - {{ formatCurrency(tx.amount) }} - {{ formatDate(tx.updated_at) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';

const { user } = useAuth();
const { success, error: showError } = useToast();

const transactions = ref([]);
const isLoading = ref(true);
const error = ref(null);
const daysOld = ref(7);
const isRunningCleanup = ref(false);
const isDryRun = ref(true);
const cleanupResults = ref(null);
const selectedTransactions = ref([]);
const isDeleting = ref(false);
const deletingTransactions = ref({});

// Computed property to check if all transactions are selected
const selectAll = computed(() => {
  return transactions.value.length > 0 && selectedTransactions.value.length === transactions.value.length;
});

// Toggle select all transactions
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTransactions.value = [];
  } else {
    selectedTransactions.value = transactions.value.map(t => t.id);
  }
};

// Fetch transactions with not_found_in_gateway status
const fetchTransactions = async () => {
  isLoading.value = true;
  error.value = null;
  cleanupResults.value = null;
  
  try {
    if (!user.value || !user.value.id) {
      throw new Error('User not authenticated.');
    }
    
    const response = await $fetch('/api/admin/tables/transactions', {
      headers: {
        'x-user-id': user.value.id,
        'x-user-email': user.value.email
      },
      params: {
        filter: 'payment_gateway_status=not_found_in_gateway',
        sort: 'updated_at:desc'
      }
    });
    
    if (response.success) {
      transactions.value = response.data.records || [];
      selectedTransactions.value = [];
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

// Run cleanup process (preview or actual)
const runCleanup = async (dryRun = true) => {
  isRunningCleanup.value = true;
  isDryRun.value = dryRun;
  cleanupResults.value = null;
  
  try {
    if (!user.value || !user.value.id) {
      throw new Error('User not authenticated.');
    }
    
    const response = await $fetch('/api/admin/cleanup-not-found-transactions', {
      headers: {
        'x-user-id': user.value.id,
        'x-user-email': user.value.email
      },
      params: {
        days: daysOld.value,
        dry_run: dryRun
      }
    });
    
    if (response.success) {
      cleanupResults.value = response.data;
      
      if (!dryRun && response.data.deleted > 0) {
        success(`Successfully deleted ${response.data.deleted} transactions`);
        // Refresh the transaction list
        fetchTransactions();
      }
    } else {
      throw new Error(response.message || 'Failed to run cleanup.');
    }
  } catch (err) {
    console.error('Error running cleanup:', err);
    showError(err.message || 'An unexpected error occurred.');
  } finally {
    isRunningCleanup.value = false;
  }
};

// Delete a single transaction
const deleteTransaction = async (transactionId) => {
  if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
    return;
  }
  
  deletingTransactions.value[transactionId] = true;
  
  try {
    const response = await $fetch(`/api/admin/tables/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.value.id,
        'x-user-email': user.value.email
      }
    });
    
    if (response.success) {
      success('Transaction deleted successfully');
      // Remove from selected transactions if it was selected
      selectedTransactions.value = selectedTransactions.value.filter(id => id !== transactionId);
      // Refresh the transaction list
      fetchTransactions();
    } else {
      throw new Error(response.message || 'Failed to delete transaction');
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
    showError(err.message || 'An error occurred while deleting the transaction');
  } finally {
    deletingTransactions.value[transactionId] = false;
  }
};

// Delete selected transactions
const deleteSelected = async () => {
  if (selectedTransactions.value.length === 0) return;
  
  if (!confirm(`Are you sure you want to delete ${selectedTransactions.value.length} transactions? This action cannot be undone.`)) {
    return;
  }
  
  isDeleting.value = true;
  
  try {
    // Delete transactions one by one
    for (const id of selectedTransactions.value) {
      try {
        await $fetch(`/api/admin/tables/transactions/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.value.id,
            'x-user-email': user.value.email
          }
        });
      } catch (err) {
        console.error(`Error deleting transaction ${id}:`, err);
      }
    }
    
    success(`${selectedTransactions.value.length} transactions deleted successfully`);
    // Refresh the transaction list
    fetchTransactions();
  } catch (err) {
    console.error('Error deleting selected transactions:', err);
    showError('An error occurred while deleting the selected transactions');
  } finally {
    isDeleting.value = false;
  }
};

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  await fetchTransactions();
});
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.admin-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn {
  background-color: #3498db;
  color: white;
}

.preview-btn {
  background-color: #f39c12;
  color: white;
}

.danger-btn {
  background-color: #e74c3c;
  color: white;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 80px;
}

.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.results-section {
  margin-bottom: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-header h2 {
  font-size: 1.2rem;
  margin: 0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.admin-table th, .admin-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.admin-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.admin-table tr:hover {
  background-color: #f1f1f1;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.cleanup-results {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
}

.cleanup-results h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.results-info {
  margin-bottom: 1rem;
}

.preview-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
}

.preview-list h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.preview-list ul {
  padding-left: 1.5rem;
}

.preview-list li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .header-section, .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .admin-table {
    display: block;
    overflow-x: auto;
  }
}
</style> 