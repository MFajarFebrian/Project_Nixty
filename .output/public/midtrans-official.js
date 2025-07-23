// Official Midtrans Snap.js Integration
// Based on https://docs.midtrans.com/reference

(function() {
  'use strict';

  // Store current order information
  let currentOrder = null;

  // Create a status checker modal
  function createStatusModal() {
    const modal = document.createElement('div');
    modal.id = 'midtrans-status-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        padding: 24px;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
        text-align: center;
      ">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.4rem;">Transaksi Anda</h3>
          <div id="status-content">
            <div id="payment-info" style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 48px; margin-bottom: 16px; color: #4dd0e1;">💳</div>
              <h4 style="margin: 0 0 12px 0; color: #fff; font-size: 1.2rem;">Pembayaran Sedang Diproses</h4>
              <p style="margin: 0 0 20px 0; color: #ccc; line-height: 1.5;">Silakan selesaikan pembayaran Anda atau kembali ke merchant untuk melanjutkan berbelanja.</p>
              <div id="order-info" style="
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 16px;
                text-align: left;
                margin-bottom: 20px;
              ">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <span style="color: #aaa;">Order ID:</span>
                  <span id="display-order-id" style="color: #fff; font-family: monospace; font-size: 12px;"></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #aaa;">Status:</span>
                  <span style="color: #4dd0e1;">Menunggu Pembayaran</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button id="back-to-merchant-btn" style="
              flex: 1;
              background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">Kembali ke Merchant</button>
            
            <button id="close-status-btn" style="
              flex: 1;
              background: transparent;
              color: #ccc;
              border: 1px solid #555;
              padding: 12px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">Close</button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        #midtrans-status-modal button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        #close-status-btn:hover {
          background: #555;
          color: white;
        }
      </style>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const backToMerchantBtn = modal.querySelector('#back-to-merchant-btn');
    const closeBtn = modal.querySelector('#close-status-btn');

    backToMerchantBtn.addEventListener('click', () => backToMerchant());
    closeBtn.addEventListener('click', () => hideStatusModal());

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideStatusModal();
      }
    });

    return modal;
  }

  function showStatusModal(orderData) {
    currentOrder = orderData;
    let modal = document.getElementById('midtrans-status-modal');
    
    if (!modal) {
      modal = createStatusModal();
    }

    // Display order ID if available
    if (orderData && orderData.order_id) {
      const orderIdDisplay = modal.querySelector('#display-order-id');
      if (orderIdDisplay) {
        orderIdDisplay.textContent = orderData.order_id;
      }
    }

    modal.style.display = 'flex';
  }

  function hideStatusModal() {
    const modal = document.getElementById('midtrans-status-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function backToMerchant() {
    // Close modal
    hideStatusModal();
    
    // Redirect to merchant homepage or specific page
    const merchantUrl = window.location.origin;
    
    // You can customize this to redirect to specific pages:
    // - Homepage: '/'
    // - Products page: '/products'
    // - Profile/Orders: '/profile/transactions'
    // - Or any other merchant page
    
    window.location.href = merchantUrl + '/';
  }

  function showStatusResult(data) {
    const modal = document.getElementById('midtrans-status-modal');
    const resultEl = modal.querySelector('#status-result');
    const iconEl = modal.querySelector('#status-icon');
    const titleEl = modal.querySelector('#status-title');
    const messageEl = modal.querySelector('#status-message');
    const detailsEl = modal.querySelector('#status-details');

    resultEl.style.display = 'block';

    const status = data.transaction_status;
    let icon, color, title, message;

    // Status mapping based on Midtrans documentation
    switch (status) {
      case 'settlement':
      case 'capture':
        icon = '✅';
        color = '#4CAF50';
        title = 'Payment Successful';
        message = 'Your payment has been successfully processed.';
        break;
      case 'pending':
        icon = '⏳';
        color = '#FF9800';
        title = 'Payment Pending';
        message = 'Your payment is being processed. Please complete your payment.';
        break;
      case 'deny':
        icon = '❌';
        color = '#f44336';
        title = 'Payment Denied';
        message = 'Your payment was denied by the payment provider.';
        break;
      case 'cancel':
        icon = '🚫';
        color = '#f44336';
        title = 'Payment Cancelled';
        message = 'The payment was cancelled.';
        break;
      case 'expire':
        icon = '⏰';
        color = '#f44336';
        title = 'Payment Expired';
        message = 'The payment session has expired. Please create a new order.';
        break;
      case 'failure':
        icon = '⚠️';
        color = '#f44336';
        title = 'Payment Failed';
        message = 'Payment processing failed. Please try again.';
        break;
      default:
        icon = '❓';
        color = '#9E9E9E';
        title = 'Unknown Status';
        message = 'Status information unavailable.';
    }

    iconEl.textContent = icon;
    iconEl.style.color = color;
    titleEl.textContent = title;
    titleEl.style.color = color;
    messageEl.textContent = message;

    // Build details HTML
    let detailsHTML = '';
    if (data.order_id) {
      detailsHTML += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span style="color: #aaa;">Order ID:</span><span style="color: #fff; font-family: monospace; font-size: 12px;">${data.order_id}</span></div>`;
    }
    if (data.gross_amount) {
      detailsHTML += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span style="color: #aaa;">Amount:</span><span style="color: #fff;">Rp ${Number(data.gross_amount).toLocaleString('id-ID')}</span></div>`;
    }
    if (data.payment_type) {
      detailsHTML += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span style="color: #aaa;">Payment Method:</span><span style="color: #fff;">${data.payment_type}</span></div>`;
    }
    if (data.transaction_time) {
      const date = new Date(data.transaction_time).toLocaleString('id-ID');
      detailsHTML += `<div style="display: flex; justify-content: space-between; padding: 8px 0;"><span style="color: #aaa;">Transaction Time:</span><span style="color: #fff;">${date}</span></div>`;
    }

    detailsEl.innerHTML = detailsHTML;
  }

  function showError(errorMessage) {
    const modal = document.getElementById('midtrans-status-modal');
    const errorEl = modal.querySelector('#status-error');
    const errorMsgEl = modal.querySelector('#error-message');

    errorEl.style.display = 'block';
    errorMsgEl.textContent = errorMessage;
  }

  // Official Snap.js Integration
  function enhanceSnapPayment() {
    if (!window.snap || !window.snap.pay) {
      console.log('Midtrans Snap not loaded yet, retrying...');
      setTimeout(enhanceSnapPayment, 1000);
      return;
    }

    const originalPay = window.snap.pay;

    window.snap.pay = function(token, options = {}) {
      console.log('Enhanced Snap.pay called with token:', token);

      // Enhanced callbacks with status checking functionality
      const enhancedOptions = {
        ...options,
        
        onSuccess: function(result) {
          console.log('Payment Success:', result);
          
          // Store order info for status checking
          if (result.order_id) {
            currentOrder = result;
            localStorage.setItem('lastSuccessfulOrder', JSON.stringify(result));
          }
          
          // Call original success callback if provided
          if (options.onSuccess) {
            return options.onSuccess(result);
          }
        },
        
        onPending: function(result) {
          console.log('Payment Pending:', result);
          
          // Store order info and show status checker
          if (result.order_id) {
            currentOrder = result;
            localStorage.setItem('lastPendingOrder', JSON.stringify(result));
            
            // Show status checker modal after a short delay
            setTimeout(() => {
              if (confirm('Your payment is pending. Would you like to check the status?')) {
                showStatusModal(result);
              }
            }, 2000);
          }
          
          // Call original pending callback if provided
          if (options.onPending) {
            return options.onPending(result);
          }
        },
        
        onError: function(result) {
          console.log('Payment Error:', result);
          
          // Store order info for status checking
          if (result.order_id) {
            currentOrder = result;
            localStorage.setItem('lastErrorOrder', JSON.stringify(result));
          }
          
          // Call original error callback if provided
          if (options.onError) {
            return options.onError(result);
          }
        },
        
        onClose: function() {
          console.log('Payment popup closed');
          
          // Show status checker option
          setTimeout(() => {
            if (currentOrder && currentOrder.order_id) {
              if (confirm('Payment window was closed. Would you like to check your payment status?')) {
                showStatusModal(currentOrder);
              }
            }
          }, 1000);
          
          // Call original close callback if provided
          if (options.onClose) {
            return options.onClose();
          }
        }
      };

      // Call original pay method with enhanced options
      return originalPay.call(this, token, enhancedOptions);
    };

    console.log('Midtrans Snap.pay enhanced with status checking functionality');
  }

  // Global function to manually show status checker
  function showStatusChecker(orderId) {
    if (orderId) {
      showStatusModal({ order_id: orderId });
    } else {
      // Try to get from storage
      try {
        const lastOrder = JSON.parse(localStorage.getItem('lastPendingOrder') || localStorage.getItem('lastSuccessfulOrder') || '{}');
        if (lastOrder.order_id) {
          showStatusModal(lastOrder);
        } else {
          const inputOrderId = prompt('Please enter your Order ID:');
          if (inputOrderId) {
            showStatusModal({ order_id: inputOrderId });
          }
        }
      } catch (e) {
        const inputOrderId = prompt('Please enter your Order ID:');
        if (inputOrderId) {
          showStatusModal({ order_id: inputOrderId });
        }
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceSnapPayment);
  } else {
    enhanceSnapPayment();
  }

  // Also try to enhance after a delay
  setTimeout(enhanceSnapPayment, 2000);

  // Make functions globally available
  window.MidtransStatus = {
    showStatusChecker,
    backToMerchant,
    showStatusModal,
    hideStatusModal
  };

})();
