<template>
  <div class="order-details-container">
    <div class="header-section">
      <button @click="$router.back()" class="galaxy-button-secondary back-btn">
        <i class="fas fa-arrow-left"></i>
        Back to Orders
      </button>
      <h1 class="page-title galaxy-gradient-text">Order Details</h1>
    </div>

    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>Loading order details...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <p class="error-text">&#10060; {{ error }}</p>
      <button @click="fetchOrderDetails" class="galaxy-button-secondary">Try Again</button>
    </div>

    <div v-else-if="order" class="order-content">
      <!-- Order Status Header -->
      <div class="order-status-card galaxy-card">
        <div class="status-header">
          <h2>Order #{{ order.order_id }}</h2>
          <span :class="['status-badge', getStatusClass(order.status)]">
            {{ formatStatus(order.status) }}
          </span>
        </div>
        <div class="order-meta">
          <p><strong>Order Date:</strong> {{ formatDate(order.created_at) }}</p>
          <p v-if="order.updated_at !== order.created_at">
            <strong>Last Updated:</strong> {{ formatDate(order.updated_at) }}
          </p>
        </div>
      </div>

      <!-- Product Information -->
      <div class="product-card galaxy-card">
        <h3><i class="fas fa-box"></i> Product Information</h3>
        <div class="product-details">
          <div class="product-info">
            <h4>{{ order.product_name_full || order.product_name }}</h4>
            <p v-if="order.product_version" class="version">Version: {{ order.product_version }}</p>
            <p v-if="order.quantity && order.quantity > 1" class="quantity">Quantity: {{ order.quantity }} licenses</p>
            <p v-if="order.product_description" class="description">{{ order.product_description }}</p>
            <p v-if="order.category_name" class="category">Category: {{ order.category_name }}</p>
          </div>
          <div class="product-pricing">
            <p class="price">{{ formatCurrency(order.amount) }}</p>
            <p v-if="order.product_currency" class="currency">{{ order.product_currency }}</p>
            <p v-if="order.quantity && order.quantity > 1" class="price-breakdown">
              {{ formatCurrency(order.amount / order.quantity) }} × {{ order.quantity }}
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="payment-card galaxy-card">
        <h3><i class="fas fa-credit-card"></i> Payment Information</h3>
        <div class="payment-details">
          <div class="payment-info">
            <p><strong>Payment Method:</strong> {{ order.payment_method || 'N/A' }}</p>
            <p v-if="order.va_number"><strong>Virtual Account:</strong> {{ order.va_number }}</p>
            <p><strong>Amount:</strong> {{ formatCurrency(order.amount) }}</p>
            <p v-if="order.payment_gateway_status">
              <strong>Gateway Status:</strong> 
              <span :class="['gateway-status-badge', getStatusClass(order.payment_gateway_status)]">
                {{ formatStatus(order.payment_gateway_status) }}
              </span>
            </p>
          </div>
          
          <!-- Invoice Section -->
          <div class="invoice-section">
            <h4><i class="fas fa-file-invoice"></i> Invoice Details</h4>
            <div class="invoice-details">
              <p><strong>Invoice ID:</strong> {{ order.order_id }}</p>
              <p><strong>Customer:</strong> {{ order.customer_name || order.email }}</p>
              <p><strong>Email:</strong> {{ order.email }}</p>
              <p><strong>Issue Date:</strong> {{ formatDate(order.created_at) }}</p>
              <p v-if="isTransactionCompleted(order.status, order.payment_gateway_status)">
                <strong>Payment Date:</strong> {{ formatDate(order.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

<!-- License Information (Only for completed transactions) -->
<div v-if="hasLicenses && isTransactionCompleted(order.status, order.payment_gateway_status)" class="license-card galaxy-card">
  <h3><i class="fas fa-key"></i> License Information</h3>
  
  <!-- Partial License Delivery Warning -->
  <div v-if="isPartialLicenseDelivery" class="partial-license-warning">
    <div class="warning-content">
      <i class="fas fa-exclamation-triangle"></i>
      <div>
        <h4>Partial License Delivery</h4>
        <p>Only {{ deliveredLicenseCount }}/{{ requestedLicenseCount }} licenses were delivered. Please contact support.</p>
      </div>
    </div>
  </div>
  
  <div v-if="licenseCount > 1" class="license-count-info">
    <p><strong>{{ licenseCount }} licenses delivered</strong></p>
    <p v-if="isPartialLicenseDelivery" class="partial-info">{{ requestedLicenseCount }} licenses were originally requested</p>
  </div>
  <div class="license-details">
    <div v-for="(license, index) in licenseArray" :key="index" class="license-item">
      <h4 v-if="licenseCount > 1">License #{{ index + 1 }}</h4>
      <div class="license-key-section">
        <p><strong>License Type:</strong> {{ license.license_type || order.license_type_default }}</p>
        
        <!-- Product Key -->
        <div v-if="license.product_key" class="license-key-container">
          <label><strong>Product Key:</strong></label>
          <div class="key-display">
            <input 
              type="text" 
              :value="license.product_key" 
              readonly 
              class="license-key-input"
            >
            <button @click="copyText(license.product_key, 'Product key')" class="copy-btn galaxy-button-secondary">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
          <!-- Usage Information -->
          <div v-if="license.send_license !== null && license.max_usage !== null" class="usage-info">
            <p class="usage-text">
              <i class="fas fa-info-circle"></i>
              <strong>License Usage:</strong> {{ license.send_license }}/{{ license.max_usage }} 
              <span v-if="license.max_usage > 1" class="usage-note">
                (This license can be used {{ license.max_usage }} times)
              </span>
            </p>
          </div>
        </div>
        
        <!-- Email & Password -->
        <div v-if="license.email && license.password" class="license-credentials">
          <div class="credential-row">
            <label><strong>Email:</strong></label>
            <div class="key-display">
              <input type="text" :value="license.email" readonly class="license-key-input">
              <button @click="copyText(license.email, 'Email')" class="copy-btn galaxy-button-secondary">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
          <div class="credential-row">
            <label><strong>Password:</strong></label>
            <div class="key-display">
              <input type="password" :value="license.password" readonly class="license-key-input">
              <button @click="copyText(license.password, 'Password')" class="copy-btn galaxy-button-secondary">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </div>
        
        <p v-if="license.expires_at" class="expiry-info">
          <strong>Expires:</strong> {{ formatDate(license.expires_at) }}
        </p>
        
        <div v-if="license.additional_info" class="additional-info">
          <h4>Additional Information</h4>
          <div class="info-content" v-html="formatAdditionalInfo(license.additional_info)"></div>
        </div>
        
        <div v-if="license.notes" class="license-notes">
          <h4>Notes</h4>
          <p>{{ license.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- Actions -->
      <div class="order-actions">
        <button @click="downloadInvoice" class="galaxy-button-primary">
          <i class="fas fa-download"></i>
          Download Invoice
        </button>
        <button v-if="order.license_info" @click="downloadLicense" class="galaxy-button-secondary">
          <i class="fas fa-file-download"></i>
          Download License
        </button>
        <button 
          v-if="isTransactionCompleted(order.status, order.payment_gateway_status) && !hasLicenses" 
          @click="fetchLicenseManually" 
          class="galaxy-button-secondary"
          :disabled="isFetchingLicense"
        >
          <i v-if="isFetchingLicense" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sync"></i>
          {{ isFetchingLicense ? 'Fetching License...' : 'Get License Manually' }}
        </button>
        <button 
          v-if="!isTransactionCompleted(order.status, order.payment_gateway_status) && isPendingOrExpired(order.status, order.payment_gateway_status)" 
          @click="repayOrder" 
          class="galaxy-button-warn"
          :disabled="isProcessingPayment"
        >
          <i v-if="isProcessingPayment" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-credit-card"></i>
          {{ isProcessingPayment ? 'Processing...' : 'Pay Again' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';
import { useTransactionDetails } from '~/composables/useTransactionDetails';
import { useRoute } from 'vue-router';

const { user } = useAuth();
const { success, error: showError } = useToast();
const route = useRoute();

const order = ref(null);
const isLoading = ref(true);
const error = ref(null);
const copied = ref(false);
const licenseKeyInput = ref(null);
const isFetchingLicense = ref(false);
const isProcessingPayment = ref(false);

const fetchOrderDetails = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!user.value || !user.value.id) {
      throw new Error('User not authenticated.');
    }
    
    const transactionId = route.params.id;
    if (!transactionId) {
      throw new Error('Transaction ID is required.');
    }
    
    const response = await $fetch(`/api/profile/transactions/${transactionId}`, {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      order.value = response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch order details.');
    }
  } catch (err) {
    console.error('Error fetching order details:', err);
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

// Helper computed property to always return an array of licenses
const licenseArray = computed(() => {
  if (!order.value?.license_info) return [];
  return Array.isArray(order.value.license_info) ? order.value.license_info : [order.value.license_info];
});

const copyLicenseKey = async (licenseIndex = 0) => {
  const licenses = licenseArray.value;
  if (!licenses[licenseIndex]?.product_key) return;
  
  try {
    await navigator.clipboard.writeText(licenses[licenseIndex].product_key);
    copied.value = true;
    const message = licenses.length > 1 ? 
      `License key ${licenseIndex + 1} copied to clipboard!` : 
      'License key copied to clipboard!';
    success(message);
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error copying license key:', err);
    showError('Failed to copy license key. Please copy manually.');
  }
};

const hasLicenses = computed(() => {
  if (!order.value?.license_info) return false;
  return licenseArray.value.length > 0;
});

const licenseCount = computed(() => {
  return licenseArray.value.length;
});

const isPartialLicenseDelivery = computed(() => {
  if (!order.value?.payment_gateway_payload) return false;
  
  try {
    const payload = JSON.parse(order.value.payment_gateway_payload);
    return payload.partial_license_delivery === true;
  } catch {
    return false;
  }
});

const deliveredLicenseCount = computed(() => {
  return licenseArray.value.length;
});

const requestedLicenseCount = computed(() => {
  if (!order.value?.payment_gateway_payload) return deliveredLicenseCount.value;
  
  try {
    const payload = JSON.parse(order.value.payment_gateway_payload);
    return payload.licenses_requested || deliveredLicenseCount.value;
  } catch {
    return deliveredLicenseCount.value;
  }
});

const copyText = async (text, label) => {
  if (!text) return;
  
  try {
    await navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  } catch (err) {
    console.error(`Error copying ${label}:`, err);
    showError(`Failed to copy ${label}. Please copy manually.`);
  }
};

const copyCredential = async (type, licenseIndex = 0) => {
  const licenses = licenseArray.value;
  if (!licenses[licenseIndex]) return;
  
  let textToCopy = '';
  let successMessage = '';
  
  switch (type) {
    case 'email':
      textToCopy = licenses[licenseIndex].email;
      successMessage = licenses.length > 1 ? 
        `Email ${licenseIndex + 1} copied to clipboard!` : 
        'Email copied to clipboard!';
      break;
    case 'password':
      textToCopy = licenses[licenseIndex].password;
      successMessage = licenses.length > 1 ? 
        `Password ${licenseIndex + 1} copied to clipboard!` : 
        'Password copied to clipboard!';
      break;
    default:
      return;
  }
  
  if (!textToCopy) return;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    success(successMessage);
  } catch (err) {
    console.error(`Error copying ${type}:`, err);
    showError(`Failed to copy ${type}. Please copy manually.`);
  }
};

const downloadInvoice = () => {
  // Generate and download invoice
  const invoiceData = {
    orderId: order.value.order_id,
    customerName: order.value.customer_name,
    email: order.value.email,
    productName: order.value.product_name_full || order.value.product_name,
    amount: order.value.amount,
    currency: order.value.product_currency || 'IDR',
    orderDate: order.value.created_at,
    paymentDate: order.value.updated_at,
    paymentMethod: order.value.payment_method,
    status: order.value.status
  };
  
  generateInvoicePDF(invoiceData);
};

const downloadLicense = () => {
  if (!hasLicenses.value) return;
  
  if (licenseCount.value > 1) {
    downloadMultipleLicenses(licenseArray.value);
  } else {
    downloadSingleLicense(licenseArray.value[0], 0);
  }
};

const downloadSingleLicense = (license, index) => {
  const licenseData = {
    productName: order.value.product_name_full || order.value.product_name,
    licenseType: license.license_type || order.value.license_type_default,
    productKey: license.product_key,
    customerName: order.value.customer_name,
    email: license.email || order.value.email,
    issueDate: order.value.created_at,
    expiresAt: license.expires_at,
    additionalInfo: license.additional_info,
    notes: license.notes,
    licenseIndex: index
  };
  
  generateLicenseFile(licenseData);
};

const downloadMultipleLicenses = (licenses) => {
  const combinedLicenseData = {
    productName: order.value.product_name_full || order.value.product_name,
    customerName: order.value.customer_name,
    email: order.value.email,
    issueDate: order.value.created_at,
    licenses: licenses
  };
  
  generateMultipleLicenseFile(combinedLicenseData);
};

const generateInvoicePDF = (data) => {
  // Simple invoice generation - in a real app, you'd use a PDF library
  const invoiceContent = `
INVOICE
=======

Invoice ID: ${data.orderId}
Date: ${formatDate(data.orderDate)}

Customer Information:
- Name: ${data.customerName}
- Email: ${data.email}

Product Details:
- Product: ${data.productName}
- Amount: ${formatCurrency(data.amount)}
- Payment Method: ${data.paymentMethod || 'N/A'}
- Status: ${formatStatus(data.status)}

${data.paymentDate !== data.orderDate ? `Payment Date: ${formatDate(data.paymentDate)}` : ''}

Thank you for your purchase!
`;
  
  const blob = new Blob([invoiceContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${data.orderId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  success('Invoice downloaded successfully!');
};

const generateLicenseFile = (data) => {
  const licenseContent = `
LICENSE INFORMATION
==================

Product: ${data.productName}
License Type: ${data.licenseType}
Product Key: ${data.productKey}

Customer Information:
- Name: ${data.customerName}
- Email: ${data.email}

License Details:
- Issue Date: ${formatDate(data.issueDate)}
${data.expiresAt ? `- Expires: ${formatDate(data.expiresAt)}` : ''}

${data.additionalInfo ? `Additional Information:\n${data.additionalInfo}\n` : ''}
${data.notes ? `Notes:\n${data.notes}\n` : ''}

Please keep this license information in a safe place.
`;
  
  const blob = new Blob([licenseContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = data.licenseIndex !== undefined ? 
    `license-${data.productName.replace(/\s+/g, '-')}-${data.licenseIndex + 1}.txt` :
    `license-${data.productName.replace(/\s+/g, '-')}.txt`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  success('License file downloaded successfully!');
};

const generateMultipleLicenseFile = (data) => {
  let licenseContent = `
MULTIPLE LICENSES INFORMATION
=============================

Product: ${data.productName}
Customer: ${data.customerName}
Email: ${data.email}
Issue Date: ${formatDate(data.issueDate)}

`;
  
  data.licenses.forEach((license, index) => {
    licenseContent += `
LICENSE ${index + 1}
${'='.repeat(10)}

License Type: ${license.license_type || 'N/A'}
Product Key: ${license.product_key || 'N/A'}
Email: ${license.email || 'N/A'}
${license.password ? `Password: ${license.password}` : ''}
${license.expires_at ? `Expires: ${formatDate(license.expires_at)}` : ''}
${license.additional_info ? `Additional Info: ${license.additional_info}` : ''}
${license.notes ? `Notes: ${license.notes}` : ''}

`;
  });
  
  licenseContent += `\nPlease keep this license information in a safe place.`;
  
  const blob = new Blob([licenseContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `licenses-${data.productName.replace(/\s+/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  success('All licenses downloaded successfully!');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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
    'failure': 'Failed'
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
    'failure': 'status-failed'
  };
  return classMap[status.toLowerCase()] || 'status-default';
};

const isTransactionCompleted = (status, gatewayStatus) => {
  const completedStatuses = ['completed', 'settlement', 'capture'];
  return completedStatuses.includes(status?.toLowerCase()) || 
         completedStatuses.includes(gatewayStatus?.toLowerCase());
};

const formatAdditionalInfo = (info) => {
  if (!info) return '';
  // Convert newlines to <br> tags for display
  return info.replace(/\n/g, '<br>');
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.order-details-container {
  max-width: 1000px;
  margin: var(--galaxy-space-2xl) auto;
  padding: var(--galaxy-space-md);
}

.header-section {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  margin-bottom: var(--galaxy-space-xl);
}

.back-btn {
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  font-size: 0.9rem;
}

.back-btn i {
  margin-right: var(--galaxy-space-xs);
}

.page-title {
  font-size: 2.5rem;
  margin: 0;
  flex: 1;
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

.order-content {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xl);
}

.galaxy-card {
  background: var(--galaxy-card-gradient);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-lg);
  box-shadow: var(--galaxy-shadow-medium);
}

.order-status-card .status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-md);
}

.order-status-card h2 {
  margin: 0;
  color: var(--galaxy-starlight);
  font-size: 1.5rem;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: var(--galaxy-radius-full);
  font-size: 0.9rem;
  font-weight: bold;
}

.status-pending {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space);
}

.status-completed {
  background-color: var(--galaxy-comet-green);
  color: var(--galaxy-starlight);
}

.status-failed {
  background-color: var(--galaxy-pulsar-pink);
  color: var(--galaxy-starlight);
}

.status-default {
  background-color: var(--galaxy-asteroid-gray);
  color: var(--galaxy-starlight);
}

.order-meta p {
  margin: 0.5rem 0;
  color: var(--galaxy-starlight);
}

.galaxy-card h3 {
  margin: 0 0 var(--galaxy-space-md) 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--galaxy-space-lg);
}

.product-info h4 {
  margin: 0 0 var(--galaxy-space-sm) 0;
  color: var(--galaxy-starlight);
  font-size: 1.2rem;
}

.product-info p {
  margin: 0.3rem 0;
  color: var(--galaxy-starlight);
}

.version, .category, .quantity {
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
  opacity: 0.8;
}

.quantity {
  color: var(--galaxy-aurora-cyan);
  font-weight: 500;
  opacity: 1;
}

.product-pricing {
  text-align: right;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--galaxy-aurora-cyan);
  margin: 0;
}

.price-breakdown {
  font-size: 0.9rem;
  color: var(--galaxy-light-gray);
  margin: 0.2rem 0 0 0;
  opacity: 0.8;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-lg);
}

.payment-info p {
  margin: 0.5rem 0;
  color: var(--galaxy-starlight);
}

.gateway-status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: var(--galaxy-space-xs);
}

.invoice-section {
  background: rgba(255, 255, 255, 0.05);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.invoice-section h4 {
  margin: 0 0 var(--galaxy-space-sm) 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.invoice-details p {
  margin: 0.4rem 0;
  color: var(--galaxy-starlight);
}

.license-details {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-lg);
}

.license-key-section {
  background: rgba(255, 255, 255, 0.05);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.license-key-container {
  margin: var(--galaxy-space-sm) 0;
}

.license-key-container label {
  display: block;
  margin-bottom: var(--galaxy-space-xs);
  color: var(--galaxy-starlight);
  font-weight: bold;
}

.key-display {
  display: flex;
  gap: var(--galaxy-space-sm);
  align-items: center;
}

.license-key-input {
  flex: 1;
  padding: var(--galaxy-space-sm);
  background: var(--galaxy-deep-space);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.copy-btn {
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  font-size: 0.9rem;
  white-space: nowrap;
}

.copy-btn i {
  margin-right: var(--galaxy-space-xs);
}

.expiry-info {
  color: var(--galaxy-solar-yellow);
  font-weight: bold;
  margin-top: var(--galaxy-space-sm);
}

.usage-info {
  margin-top: var(--galaxy-space-sm);
  padding: var(--galaxy-space-sm);
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: var(--galaxy-radius-sm);
}

.usage-text {
  margin: 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.usage-note {
  font-weight: normal;
  opacity: 0.8;
}

.license-credentials {
  margin: var(--galaxy-space-md) 0;
}

.credential-row {
  margin-bottom: var(--galaxy-space-sm);
}

.credential-row:last-child {
  margin-bottom: 0;
}


.additional-info, .license-notes {
  background: rgba(255, 255, 255, 0.03);
  padding: var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.additional-info h4, .license-notes h4 {
  margin: 0 0 var(--galaxy-space-sm) 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 1rem;
}

.info-content {
  color: var(--galaxy-starlight);
  line-height: 1.6;
}

.license-notes p {
  margin: 0;
  color: var(--galaxy-starlight);
  line-height: 1.6;
}

/* Partial License Warning Styles */
.partial-license-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
  margin-bottom: var(--galaxy-space-lg);
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: var(--galaxy-space-sm);
}

.warning-content i {
  color: #ffc107;
  font-size: 1.2rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 var(--galaxy-space-xs) 0;
  color: #ffc107;
  font-size: 1rem;
}

.warning-content p {
  margin: 0;
  color: var(--galaxy-starlight);
  font-size: 0.9rem;
  line-height: 1.4;
}

.partial-info {
  color: var(--galaxy-light-gray);
  font-size: 0.9rem;
  margin-top: var(--galaxy-space-xs);
  opacity: 0.8;
}

.order-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  justify-content: center;
  margin-top: var(--galaxy-space-lg);
}

.order-actions button {
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  font-size: 1rem;
}

.order-actions button i {
  margin-right: var(--galaxy-space-xs);
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-sm);
  }

  .page-title {
    font-size: 2rem;
  }

  .order-status-card .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-sm);
  }

  .product-details {
    flex-direction: column;
    gap: var(--galaxy-space-md);
  }

  .product-pricing {
    text-align: left;
  }

  .key-display {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-btn {
    align-self: flex-start;
  }

  .order-actions {
    flex-direction: column;
  }
}
</style>
