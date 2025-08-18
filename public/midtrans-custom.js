// Custom Midtrans integration with check status functionality
(function() {
  'use strict';

  let statusCheckerModal = null;
  let currentOrderId = null;

  // Function to create status checker modal
  function createStatusCheckerModal() {
    if (statusCheckerModal) {
      return statusCheckerModal;
    }

    const modal = document.createElement('div');
    modal.id = 'midtrans-status-checker';
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
        padding: 0;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
        overflow: hidden;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #333;
          background: #0f3460;
        ">
          <h3 style="
            margin: 0;
            color: #ffffff;
            font-size: 1.3rem;
            font-weight: 600;
          ">Check Payment Status</h3>
          <button id="close-status-checker" style="
            background: none;
            border: none;
            font-size: 24px;
            color: #aaa;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
          ">&times;</button>
        </div>
        
        <div id="status-content" style="
          padding: 30px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        ">
          <div id="initial-state">
            <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px;">
              Checking status for Order ID:
            </p>
            <div style="
              padding: 12px 16px;
              background: #0f3460;
              border: 1px solid #4dd0e1;
              border-radius: 8px;
              color: #4dd0e1;
              font-family: monospace;
              font-size: 14px;
              margin-bottom: 20px;
              word-break: break-all;
            " id="order-id-display"></div>
            <button id="check-status-btn" style="
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              min-width: 150px;
            ">Check Status</button>
          </div>
          
          <div id="loading-state" style="display: none;">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #333;
              border-top: 3px solid #4dd0e1;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 15px;
            "></div>
            <p style="margin: 0; color: #ccc;">Checking payment status...</p>
          </div>
          
          <div id="result-state" style="display: none; width: 100%;">
            <div id="status-icon" style="font-size: 48px; margin-bottom: 15px;"></div>
            <h4 id="status-title" style="margin: 0 0 10px 0; color: #fff; font-size: 20px;"></h4>
            <p id="status-message" style="margin: 0 0 20px 0; color: #ccc; line-height: 1.5;"></p>
            <div id="status-details" style="
              width: 100%;
              padding: 15px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 8px;
              text-align: left;
            "></div>
          </div>
          
          <div id="error-state" style="display: none;">
            <div style="
              width: 50px;
              height: 50px;
              background: #e91e63;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 15px;
            ">!</div>
            <h4 style="margin: 0 0 10px 0; color: #e91e63;">Error</h4>
            <p id="error-message" style="margin: 0; color: #ccc;"></p>
          </div>
        </div>
        
        <div style="
          display: flex;
          gap: 15px;
          padding: 20px;
          border-top: 1px solid #333;
          background: rgba(0, 0, 0, 0.2);
        ">
          <button id="check-another-btn" style="
            flex: 1;
            background: #4dd0e1;
            color: #0f3460;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: none;
          ">Check Another</button>
          <button id="close-final-btn" style="
            flex: 1;
            background: transparent;
            color: #ccc;
            border: 1px solid #555;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">Close</button>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        #midtrans-status-checker button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        #close-status-checker:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white !important;
        }
        
        #close-final-btn:hover {
          background: #555;
          color: white;
        }
        
        #check-another-btn:hover {
          background: #45b7cb;
        }
      </style>
    `;

    document.body.appendChild(modal);
    statusCheckerModal = modal;

    // Add event listeners
    setupEventListeners();

    return modal;
  }

  function setupEventListeners() {
    const modal = statusCheckerModal;
    const closeBtn = modal.querySelector('#close-status-checker');
    const closeFinalBtn = modal.querySelector('#close-final-btn');
    const checkStatusBtn = modal.querySelector('#check-status-btn');
    const checkAnotherBtn = modal.querySelector('#check-another-btn');

    closeBtn.addEventListener('click', hideStatusChecker);
    closeFinalBtn.addEventListener('click', hideStatusChecker);
    checkStatusBtn.addEventListener('click', performStatusCheck);
    checkAnotherBtn.addEventListener('click', resetStatusChecker);

    // Close on outside click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideStatusChecker();
      }
    });
  }

  function showStatusChecker(orderId) {
    currentOrderId = orderId;
    const modal = createStatusCheckerModal();
    
    // Reset states
    resetStatusChecker();
    
    // Set order ID
    const orderIdDisplay = modal.querySelector('#order-id-display');
    orderIdDisplay.textContent = orderId;
    
    modal.style.display = 'flex';
  }

  function hideStatusChecker() {
    if (statusCheckerModal) {
      statusCheckerModal.style.display = 'none';
    }
  }

  function resetStatusChecker() {
    const modal = statusCheckerModal;
    if (!modal) return;

    // Show initial state, hide others
    modal.querySelector('#initial-state').style.display = 'block';
    modal.querySelector('#loading-state').style.display = 'none';
    modal.querySelector('#result-state').style.display = 'none';
    modal.querySelector('#error-state').style.display = 'none';
    modal.querySelector('#check-another-btn').style.display = 'none';
  }

  async function performStatusCheck() {
    if (!currentOrderId) return;

    const modal = statusCheckerModal;
    
    // Show loading state
    modal.querySelector('#initial-state').style.display = 'none';
    modal.querySelector('#loading-state').style.display = 'block';
    modal.querySelector('#result-state').style.display = 'none';
    modal.querySelector('#error-state').style.display = 'none';

    try {
      const response = await fetch(`/api/midtrans/status?order_id=${encodeURIComponent(currentOrderId)}`);
      const result = await response.json();

      // Hide loading
      modal.querySelector('#loading-state').style.display = 'none';

      if (result.success && result.data) {
        showStatusResult(result.data);
      } else {
        showStatusError(result.message || 'Failed to check payment status');
      }
    } catch (error) {
      // Hide loading
      modal.querySelector('#loading-state').style.display = 'none';
      showStatusError('Network error. Please try again.');
    }
  }

  function showStatusResult(data) {
    const modal = statusCheckerModal;
    const resultState = modal.querySelector('#result-state');
    const statusIcon = modal.querySelector('#status-icon');
    const statusTitle = modal.querySelector('#status-title');
    const statusMessage = modal.querySelector('#status-message');
    const statusDetails = modal.querySelector('#status-details');
    const checkAnotherBtn = modal.querySelector('#check-another-btn');

    // Show result state
    resultState.style.display = 'block';
    checkAnotherBtn.style.display = 'block';

    // Set status icon and color
    const status = data.transaction_status;
    let icon, color, title, message;

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
        message = 'Your payment is being processed. Please wait.';
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
        message = 'The payment session has expired.';
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

    statusIcon.textContent = icon;
    statusIcon.style.color = color;
    statusTitle.textContent = title;
    statusTitle.style.color = color;
    statusMessage.textContent = message;

    // Build details
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

    statusDetails.innerHTML = detailsHTML;
  }

  function showStatusError(errorMessage) {
    const modal = statusCheckerModal;
    const errorState = modal.querySelector('#error-state');
    const errorMsg = modal.querySelector('#error-message');
    const checkAnotherBtn = modal.querySelector('#check-another-btn');

    errorState.style.display = 'block';
    checkAnotherBtn.style.display = 'block';
    errorMsg.textContent = errorMessage;
  }

  // Function to add check status button to Midtrans modal
  function addCheckStatusButton() {
    // Wait for Midtrans modal to appear
    const checkForModal = setInterval(() => {
      const snapModal = document.querySelector('.snap-modal');
      const snapContainer = document.querySelector('#snap-midtrans');
      
      if ((snapModal || snapContainer) && !document.querySelector('#custom-check-status-btn')) {
        clearInterval(checkForModal);
        
        // Find the container where we want to add our button
        let targetContainer = null;
        
        // Try different selectors for different Midtrans layouts
        const possibleContainers = [
          '.snap-footer',
          '.footer',
          '.payment-instruction',
          '.instruction-content',
          '.snap-content .content',
          '.snap-container .container'
        ];
        
        for (let selector of possibleContainers) {
          const element = document.querySelector(selector);
          if (element) {
            targetContainer = element;
            break;
          }
        }
        
        // If no specific container found, try to add to the main modal
        if (!targetContainer && snapModal) {
          targetContainer = snapModal;
        } else if (!targetContainer && snapContainer) {
          targetContainer = snapContainer;
        }
        
        if (targetContainer) {
          const checkStatusBtn = document.createElement('button');
          checkStatusBtn.id = 'custom-check-status-btn';
          checkStatusBtn.textContent = 'Check Status';
          checkStatusBtn.style.cssText = `
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin: 10px;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
          `;
          
          checkStatusBtn.addEventListener('click', () => {
            // Try to extract order ID from URL or page elements
            const urlParams = new URLSearchParams(window.location.search);
            let orderId = urlParams.get('order_id');
            
            // If not in URL, try to find it in the page
            if (!orderId) {
              // Look for order ID patterns in the page content more broadly
              const allElements = document.querySelectorAll('*');
              for (let element of allElements) {
                const text = element.textContent || element.innerText || element.value || '';
                const orderMatch = text.match(/TRX-\d{13}-\d+/);
                if (orderMatch) {
                  orderId = orderMatch[0];
                  console.log('Found order ID in element:', element, 'Order ID:', orderId);
                  break;
                }
              }
            }
            
            // Try to find in Midtrans specific elements
            if (!orderId) {
              const snapElements = document.querySelectorAll('[class*="snap"], [id*="snap"], [class*="midtrans"], [id*="midtrans"]');
              for (let element of snapElements) {
                const text = element.textContent || element.innerText || '';
                const orderMatch = text.match(/TRX-\d{13}-\d+/);
                if (orderMatch) {
                  orderId = orderMatch[0];
                  console.log('Found order ID in Midtrans element:', element, 'Order ID:', orderId);
                  break;
                }
              }
            }
            
            // If still no order ID, try to get from current transaction
            if (!orderId && window.snap && window.snap.currentTransaction) {
              orderId = window.snap.currentTransaction.order_id;
            }
            
            // Check if we can find it in localStorage or sessionStorage
            if (!orderId) {
              try {
                const storedOrderId = localStorage.getItem('currentOrderId') || sessionStorage.getItem('currentOrderId');
                if (storedOrderId && storedOrderId.match(/TRX-\d{13}-\d+/)) {
                  orderId = storedOrderId;
                }
              } catch (e) {
                console.log('Could not access storage:', e);
              }
            }
            
            // Fallback: prompt user to enter order ID
            if (!orderId) {
              orderId = prompt('Please enter your Order ID (e.g., TRX-1234567890-123):');
            }
            
            if (orderId) {
              console.log('Using order ID:', orderId);
              showStatusChecker(orderId);
            } else {
              alert('Could not find Order ID. Please check your transaction details.');
            }
          });
          
          checkStatusBtn.addEventListener('mouseenter', () => {
            checkStatusBtn.style.transform = 'translateY(-2px)';
            checkStatusBtn.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.4)';
          });
          
          checkStatusBtn.addEventListener('mouseleave', () => {
            checkStatusBtn.style.transform = 'translateY(0)';
            checkStatusBtn.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
          });
          
          targetContainer.appendChild(checkStatusBtn);
          console.log('Check Status button added to Midtrans modal');
        }
      }
    }, 500);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkForModal);
    }, 10000);
  }

  // Override window.snap.pay to add our custom button
  function enhanceMidtransSnap() {
    if (window.snap && window.snap.pay) {
      const originalPay = window.snap.pay;
      
      window.snap.pay = function(token, options) {
        // Store current transaction info and preserve original callbacks
        if (options && options.onSuccess) {
          const originalOnSuccess = options.onSuccess;
          options.onSuccess = function(result) {
            window.snap.currentTransaction = result;
            return originalOnSuccess(result);
          };
        }
        
        // Preserve original onClose callback behavior
        if (options && options.onClose) {
          const originalOnClose = options.onClose;
          options.onClose = function() {
            console.log('Midtrans modal closed by user');
            return originalOnClose();
          };
        }
        
        // Call original pay method
        const result = originalPay.call(this, token, options);
        
        // Add our custom button after modal appears
        setTimeout(addCheckStatusButton, 1000);
        
        return result;
      };
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceMidtransSnap);
  } else {
    enhanceMidtransSnap();
  }

  // Also try to enhance snap when the script loads (in case it's loaded after snap)
  setTimeout(enhanceMidtransSnap, 2000);

  // Make functions globally available for manual use
  window.MidtransCustom = {
    showStatusChecker,
    hideStatusChecker,
    addCheckStatusButton
  };

})();
