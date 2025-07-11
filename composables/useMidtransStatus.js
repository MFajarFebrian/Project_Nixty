import { ref } from 'vue';

export function useMidtransStatus() {
  const isChecking = ref(false);
  const error = ref(null);
  const intervalId = ref(null);
  const lastResult = ref(null);

  const checkStatus = async (orderId, onSuccess = null, onError = null) => {
    if (!orderId) {
      const errorMsg = 'Order ID is required';
      error.value = errorMsg;
      if (onError) onError(errorMsg);
      return false;
    }

    isChecking.value = true;
    error.value = null;
    
    try {
      console.log('Checking Midtrans status for order:', orderId);
      
      const response = await $fetch(`/api/midtrans/status?order_id=${orderId}`);
      
      console.log('Midtrans status response:', response);
      
      if (response.success && response.data) {
        lastResult.value = response.data;
        const status = response.data.transaction_status;
        
        // Handle different statuses
        let message = '';
        let isSuccess = false;
        
        switch (status) {
          case 'pending':
            message = `Payment for order ${orderId} is still pending. Please complete your payment.`;
            isSuccess = false;
            break;
          case 'settlement':
            message = `Payment for order ${orderId} has been confirmed and completed.`;
            isSuccess = true;
            break;
          case 'capture':
            message = `Payment for order ${orderId} has been captured successfully.`;
            isSuccess = true;
            break;
          case 'deny':
            message = `Payment for order ${orderId} has been denied.`;
            isSuccess = false;
            break;
          case 'cancel':
            message = `Payment for order ${orderId} has been cancelled.`;
            isSuccess = false;
            break;
          case 'expire':
            message = `Payment for order ${orderId} has expired.`;
            isSuccess = false;
            break;
          case 'failure':
            message = `Payment for order ${orderId} has failed.`;
            isSuccess = false;
            break;
          default:
            message = `Payment status for order ${orderId}: ${status}`;
            isSuccess = false;
        }
        
        if (onSuccess) {
          onSuccess(message, status, isSuccess);
        }
        
        return { success: true, status, message, isSuccess };
      } else {
        throw new Error(response.message || 'Failed to check payment status');
      }
    } catch (err) {
      console.error('Error checking Midtrans status:', err);
      const errorMsg = err.message || 'Failed to check payment status. Please try again.';
      error.value = errorMsg;
      
      if (onError) {
        onError(errorMsg);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      isChecking.value = false;
    }
  };

  const startAutoCheck = (orderId, interval = 5000) => {
    if (intervalId.value) clearInterval(intervalId.value);  // Clear any existing interval
    intervalId.value = setInterval(() => checkStatus(orderId), interval);
  };

  const stopAutoCheck = () => {
    if (intervalId.value) clearInterval(intervalId.value);
    intervalId.value = null;
  }

const clearError = () => {
    error.value = null;
  }

  return {
    // State
    isChecking,
    error,
    lastResult,
    
    // Methods
    checkStatus,
    clearError,
    startAutoCheck,
    stopAutoCheck
  };
}
