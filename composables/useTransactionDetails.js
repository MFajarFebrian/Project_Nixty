import { ref } from 'vue';
import { useToast } from './useToast';

export function useTransactionDetails() {
  const { success, error: showError } = useToast();
  const isProcessingPayment = ref(false);
  const isFetchingLicense = ref(false);

  const isPendingOrExpired = (status, gatewayStatus) => {
    const pendingStatuses = ['pending', 'expire', 'cancel', 'failed', 'not_found_in_gateway'];
    return pendingStatuses.includes(status?.toLowerCase()) || 
           pendingStatuses.includes(gatewayStatus?.toLowerCase());
  };

  const isTransactionCompleted = (status, gatewayStatus) => {
    const completedStatuses = ['completed', 'settlement', 'capture'];
    return completedStatuses.includes(status?.toLowerCase()) || 
           completedStatuses.includes(gatewayStatus?.toLowerCase());
  };

  const repayOrder = async (transactionId, user, refreshCallback) => {
    isProcessingPayment.value = true;
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required.');
      }

      // Get a new payment token for the order
      const response = await $fetch(`/api/profile/history_order/repay`, {
        method: 'POST',
        body: { transactionId },
        headers: {
          'x-user-session': JSON.stringify(user)
        }
      });

      if (response.success && response.token) {
        const token = response.token;
        if (typeof window.snap !== 'undefined') {
          window.snap.pay(token, {
            onSuccess: function(result) {
              success('Payment successful!');
              if (refreshCallback) refreshCallback();
            },
            onPending: function(result) {
              showError('Payment pending. Please complete it.');
            },
            onError: function(result) {
              showError('Payment failed. Please try again.');
            },
            onClose: function() {
              showError('Payment window was closed without completing payment.');
            }
          });
        } else {
          throw new Error('Payment gateway not available. Please refresh the page and try again.');
        }
      } else {
        throw new Error(response.message || 'Failed to retrigger payment.');
      }
    } catch (err) {
      console.error('Error with repayment:', err);
      showError(err.message || 'An error occurred while processing payment.');
    } finally {
      isProcessingPayment.value = false;
    }
  };

  const fetchLicenseManually = async (transactionId, user, updateCallback) => {
    isFetchingLicense.value = true;
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required.');
      }

      const response = await $fetch(`/api/profile/history_order/get-license`, {
        method: 'POST',
        body: { transactionId },
        headers: {
          'x-user-session': JSON.stringify(user)
        }
      });

      if (response.success && response.license) {
        success('License data fetched successfully!');
        if (updateCallback) updateCallback(response.license);
      } else {
        throw new Error(response.message || 'Failed to fetch license data.');
      }
    } catch (err) {
      console.error('Error fetching license data:', err);
      showError(err.message || 'An error occurred while fetching license data.');
    } finally {
      isFetchingLicense.value = false;
    }
  };

  return {
    isProcessingPayment,
    isFetchingLicense,
    isPendingOrExpired,
    isTransactionCompleted,
    repayOrder,
    fetchLicenseManually
  };
}
