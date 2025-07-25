<template>
  <div class="status-checker-overlay" v-if="showChecker">
    <div class="status-checker-modal">
      <div class="status-checker-header">
        <h3>Check Payment Status</h3>
        <button @click="closeChecker" class="close-btn">&times;</button>
      </div>
      
      <div class="status-checker-content">
        <div v-if="isChecking" class="checking-state">
          <div class="spinner"></div>
          <p>Checking payment status...</p>
        </div>
        
        <div v-else-if="statusResult" class="status-result">
          <div :class="['status-icon', getStatusIconClass(statusResult.status)]">
            <i :class="getStatusIcon(statusResult.status)"></i>
          </div>
          <h4>{{ getStatusTitle(statusResult.status) }}</h4>
          <p>{{ statusResult.message || getStatusDescription(statusResult.status) }}</p>
          
          <div class="status-details" v-if="statusResult.data">
            <div class="detail-row">
              <span>Order ID:</span>
              <span>{{ statusResult.data.order_id }}</span>
            </div>
            <div class="detail-row" v-if="statusResult.data.gross_amount">
              <span>Amount:</span>
              <span>{{ formatCurrency(statusResult.data.gross_amount) }}</span>
            </div>
            <div class="detail-row" v-if="statusResult.data.payment_type">
              <span>Payment Method:</span>
              <span>{{ statusResult.data.payment_type }}</span>
            </div>
            <div class="detail-row" v-if="statusResult.data.transaction_time">
              <span>Transaction Time:</span>
              <span>{{ formatDate(statusResult.data.transaction_time) }}</span>
            </div>
          </div>
        </div>
        
        <div v-else-if="error" class="error-state">
          <div class="error-icon">!</div>
          <h4>Error</h4>
          <p>{{ error }}</p>
        </div>
        
        <div v-else class="initial-state">
          <p>Enter your Order ID to check payment status:</p>
          <input 
            v-model="orderIdInput" 
            type="text" 
            placeholder="TRX-1234567890-123"
            class="order-id-input"
            @keyup.enter="checkStatus"
          />
        </div>
      </div>
      
      <div class="status-checker-actions">
        <button 
          v-if="!statusResult && !error && !isChecking" 
          @click="checkStatus" 
          :disabled="!orderIdInput.trim()"
          class="check-btn"
        >
          Check Status
        </button>
        <button 
          v-if="statusResult || error" 
          @click="resetChecker" 
          class="check-again-btn"
        >
          Check Another
        </button>
        <button @click="closeChecker" class="close-action-btn">
          {{ statusResult || error ? 'Close' : 'Cancel' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useMidtransStatus } from '~/composables/useMidtransStatus'
import { useUtils } from '~/composables/useUtils'

const emit = defineEmits(['close', 'status-updated'])

const { checkStatus: checkMidtransStatus, startAutoCheck, stopAutoCheck } = useMidtransStatus()
const { formatCurrency } = useUtils()

// Props
const props = defineProps({
  orderId: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  }
})

// Reactive data
const showChecker = ref(props.show)
const orderIdInput = ref(props.orderId)
const isChecking = ref(false)
const statusResult = ref(null)
const error = ref(null)

// Methods
const checkStatus = async () => {
  if (!orderIdInput.value.trim()) {
    error.value = 'Please enter a valid Order ID'
    return
  }

  isChecking.value = true
  error.value = null
  statusResult.value = null

  try {
    const result = await checkMidtransStatus(
      orderIdInput.value,
      // Success callback
      (message, status, isSuccess) => {
        statusResult.value = {
          status,
          message,
          isSuccess,
          data: null
        }
      },
      // Error callback
      (errorMessage) => {
        error.value = errorMessage
      }
    )

    if (result && result.success && result.data) {
      statusResult.value = {
        status: result.data.transaction_status,
        message: result.message,
        isSuccess: ['settlement', 'capture'].includes(result.data.transaction_status),
        data: result.data
      }
      emit('status-updated', result.data)
    }
  } catch (err) {
    error.value = err.message || 'Failed to check payment status'
  } finally {
    isChecking.value = false
  }
}

const resetChecker = () => {
  statusResult.value = null
  error.value = null
  orderIdInput.value = ''
}

const closeChecker = () => {
  showChecker.value = false
  emit('close')
}

const getStatusIcon = (status) => {
  const iconMap = {
    'settlement': 'fas fa-check-circle',
    'capture': 'fas fa-check-circle',
    'pending': 'fas fa-clock',
    'deny': 'fas fa-times-circle',
    'cancel': 'fas fa-ban',
    'expire': 'fas fa-hourglass-end',
    'failure': 'fas fa-exclamation-triangle'
  }
  return iconMap[status] || 'fas fa-question-circle'
}

const getStatusIconClass = (status) => {
  const classMap = {
    'settlement': 'success',
    'capture': 'success',
    'pending': 'pending',
    'deny': 'failed',
    'cancel': 'failed',
    'expire': 'failed',
    'failure': 'failed'
  }
  return classMap[status] || 'default'
}

const getStatusTitle = (status) => {
  const titleMap = {
    'settlement': 'Payment Successful',
    'capture': 'Payment Captured',
    'pending': 'Payment Pending',
    'deny': 'Payment Denied',
    'cancel': 'Payment Cancelled',
    'expire': 'Payment Expired',
    'failure': 'Payment Failed'
  }
  return titleMap[status] || 'Unknown Status'
}

const getStatusDescription = (status) => {
  const descMap = {
    'settlement': 'Your payment has been successfully processed.',
    'capture': 'Your payment has been captured and confirmed.',
    'pending': 'Your payment is being processed. Please wait.',
    'deny': 'Your payment was denied by the payment provider.',
    'cancel': 'The payment was cancelled.',
    'expire': 'The payment session has expired.',
    'failure': 'Payment processing failed. Please try again.'
  }
  return descMap[status] || 'Status information unavailable.'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
// Start auto-polling when checker is shown
watch(() =e showChecker.value, (newValue) = 3e {
  if (newValue) {
    startAutoCheck(orderIdInput.value);
  } else {
    stopAutoCheck();
  }
});
// Watch for prop changes
watch(() => props.show, (newValue) => {
  showChecker.value = newValue
})

watch(() => props.orderId, (newValue) => {
  if (newValue) {
    orderIdInput.value = newValue
  }
})
</script>

<style scoped>
.status-checker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.status-checker-modal {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--galaxy-shadow-large);
  border: 1px solid var(--galaxy-asteroid-gray);
}

.status-checker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-lg);
  border-bottom: 1px solid var(--galaxy-asteroid-gray);
  background: var(--galaxy-nebula-purple);
}

.status-checker-header h3 {
  margin: 0;
  color: var(--galaxy-starlight);
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--galaxy-cloud-gray);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--galaxy-starlight);
}

.status-checker-content {
  padding: var(--galaxy-space-lg);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.checking-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--galaxy-space-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--galaxy-asteroid-gray);
  border-top: 3px solid var(--galaxy-aurora-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--galaxy-space-md);
  width: 100%;
}

.status-icon {
  font-size: 3rem;
  margin-bottom: var(--galaxy-space-sm);
}

.status-icon.success {
  color: var(--galaxy-comet-green);
}

.status-icon.pending {
  color: var(--galaxy-solar-yellow);
}

.status-icon.failed {
  color: var(--galaxy-pulsar-pink);
}

.status-icon.default {
  color: var(--galaxy-cloud-gray);
}

.status-result h4 {
  margin: 0;
  color: var(--galaxy-starlight);
  font-size: 1.3rem;
}

.status-result p {
  margin: 0;
  color: var(--galaxy-cloud-gray);
  line-height: 1.5;
}

.status-details {
  width: 100%;
  margin-top: var(--galaxy-space-md);
  padding: var(--galaxy-space-md);
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--galaxy-radius-md);
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

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--galaxy-space-md);
}

.error-icon {
  width: 50px;
  height: 50px;
  background: var(--galaxy-pulsar-pink);
  color: var(--galaxy-starlight);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.error-state h4 {
  margin: 0;
  color: var(--galaxy-pulsar-pink);
}

.error-state p {
  margin: 0;
  color: var(--galaxy-cloud-gray);
}

.initial-state {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
  width: 100%;
}

.initial-state p {
  margin: 0;
  color: var(--galaxy-cloud-gray);
}

.order-id-input {
  width: 100%;
  padding: var(--galaxy-space-md);
  background: var(--galaxy-dark-matter);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  font-size: 1rem;
}

.order-id-input:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 2px rgba(77, 208, 225, 0.2);
}

.status-checker-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-lg);
  border-top: 1px solid var(--galaxy-asteroid-gray);
  background: rgba(0, 0, 0, 0.1);
}

.check-btn,
.check-again-btn,
.close-action-btn {
  flex: 1;
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.check-btn {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  border: none;
}

.check-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.check-again-btn {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-dark-matter);
  border: none;
}

.check-again-btn:hover {
  background: var(--galaxy-cosmic-blue);
  color: var(--galaxy-starlight);
}

.close-action-btn {
  background: transparent;
  color: var(--galaxy-cloud-gray);
  border-color: var(--galaxy-asteroid-gray);
}

.close-action-btn:hover {
  background: var(--galaxy-asteroid-gray);
  color: var(--galaxy-starlight);
}

@media (max-width: 600px) {
  .status-checker-modal {
    width: 95%;
    margin: var(--galaxy-space-md);
  }
  
  .status-checker-actions {
    flex-direction: column;
  }
  
  .detail-row {
    flex-direction: column;
    text-align: left;
    gap: var(--galaxy-space-xs);
  }
}
</style>
