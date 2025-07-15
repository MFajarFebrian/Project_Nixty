<template>
  <div class="order-details-container">
    <div class="header-section">
      <button @click="$router.back()" class="galaxy-button-secondary back-btn">
        <i class="fas fa-arrow-left"></i>
        Back
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
      <!-- Compact Header with Order Status -->
      <div class="order-header-compact">
        <div class="order-status-card galaxy-card">
          <div class="status-header">
            <h2>Order #{{ order.order_id }}</h2>
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ formatStatus(order.status) }}
            </span>
          </div>
          <div class="order-meta-compact">
            <span>{{ formatDate(order.created_at) }}</span>
            <span v-if="order.updated_at !== order.created_at" class="updated-date">
              Updated: {{ formatDate(order.updated_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Left Column: Product & Payment Info -->
        <div class="left-column">
          <!-- Product Information -->
          <div class="product-card galaxy-card compact-card">
            <h3><i class="fas fa-box"></i> Product</h3>
            <div class="product-details-compact">
              <div class="product-info">
                <h4>{{ order.product_name_full || order.product_name }}</h4>
                <div class="product-meta">
                  <span v-if="order.product_version" class="version">v{{ order.product_version }}</span>
                  <span v-if="order.quantity && order.quantity > 1" class="quantity">{{ order.quantity }} licenses</span>
                  <span v-if="order.category_name" class="category">{{ order.category_name }}</span>
                </div>
                <p v-if="order.product_description" class="description">{{ order.product_description }}</p>
              </div>
              <div class="product-pricing">
                <div class="pricing-container">
                  <div class="total-badge">
                    <i class="fas fa-star"></i>
                    <span>Total</span>
                  </div>
                  <p class="price">{{ formatCurrency(order.amount) }}</p>
                  <p v-if="order.quantity && order.quantity > 1" class="price-breakdown">
                    <i class="fas fa-calculator"></i>
                    {{ formatCurrency(order.amount / order.quantity) }} × {{ order.quantity }} licenses
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="payment-card galaxy-card compact-card">
            <h3><i class="fas fa-credit-card"></i> Payment</h3>
            <div class="payment-details-compact">
              <div class="payment-grid">
                <div class="payment-info">
                  <p><strong>Method:</strong> {{ order.payment_method || 'N/A' }}</p>
                  <p v-if="order.va_number"><strong>VA:</strong> {{ order.va_number }}</p>
                  <p><strong>Amount:</strong> {{ formatCurrency(order.amount) }}</p>
                  <p v-if="order.payment_gateway_status">
                    <strong>Status:</strong> 
                    <span :class="['gateway-status-badge', getStatusClass(order.payment_gateway_status)]">
                      {{ formatStatus(order.payment_gateway_status) }}
                    </span>
                  </p>
                </div>
                <div class="invoice-info">
                  <p><strong>Customer:</strong> {{ order.customer_name || order.email }}</p>
                  <p><strong>Email:</strong> {{ order.email }}</p>
                  <p v-if="isTransactionCompleted(order.status, order.payment_gateway_status)">
                    <strong>Paid:</strong> {{ formatDate(order.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: License Information -->
        <div class="right-column">
          <!-- License Information (Only for completed transactions) -->
          <div v-if="hasLicenses && isTransactionCompleted(order.status, order.payment_gateway_status)" class="license-card galaxy-card compact-card">
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
            
            <!-- License Accordion for Multiple Licenses -->
            <div class="license-accordion">
              <div v-for="(license, index) in licenseArray" :key="index" class="license-item">
                <div 
                  v-if="licenseCount > 1" 
                  class="license-header" 
                  @click="toggleLicense(index)"
                >
                  <h4>License #{{ index + 1 }}</h4>
                  <i :class="['fas', expandedLicenses.includes(index) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
                
                <div 
                  :class="['license-content', { 'expanded': licenseCount === 1 || expandedLicenses.includes(index) }]"
                >
                  <div class="license-key-section">
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
                    </div>
                    
                    <!-- Email & Password -->
                    <div v-if="license.email || license.password" class="license-credentials">
                      <div v-if="license.email" class="credential-row">
                        <label><strong>Email:</strong></label>
                        <div class="key-display">
                          <input type="text" :value="license.email" readonly class="license-key-input">
                          <button @click="copyText(license.email, 'Email')" class="copy-btn galaxy-button-secondary">
                            <i class="fas fa-copy"></i> Copy
                          </button>
                        </div>
                      </div>
                      <div v-if="license.password" class="credential-row">
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
          </div>
        </div>
      </div>


      <!-- Actions -->
      <div class="order-actions">
        <button @click="downloadInvoice" class="galaxy-button-primary">
          <i class="fas fa-download"></i>
          Invoice
        </button>
        <button v-if="hasLicenses" @click="downloadLicense" class="galaxy-button-secondary">
          <i class="fas fa-file-download"></i>
          License
        </button>
        <button 
          v-if="isPendingOrExpired(order.status, order.payment_gateway_status)" 
          @click="repayOrder" 
          class="galaxy-button-warn"
          :disabled="isProcessingPayment"
        >
          <i v-if="isProcessingPayment" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-credit-card"></i>
          {{ isProcessingPayment ? 'Processing...' : 'Pay Now' }}
        </button>
        <button 
          v-if="order.payment_gateway_status === 'not_found_in_gateway'" 
          @click="deleteTransaction" 
          class="galaxy-button-danger"
          :disabled="isDeleting"
        >
          <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-trash"></i>
          {{ isDeleting ? 'Deleting...' : 'Delete Transaction' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';
import { useTransactionDetails } from '~/composables/useTransactionDetails';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';

const { user } = useAuth();
const { success, error: showError } = useToast();
const route = useRoute();
const router = useRouter();
const { isPendingOrExpired, isTransactionCompleted, repayOrder: initiateRepayment } = useTransactionDetails();

const order = ref(null);
const isLoading = ref(true);
const error = ref(null);
const copied = ref(false);
const licenseKeyInput = ref(null);
const isFetchingLicense = ref(false);
const isProcessingPayment = ref(false);
const isDeleting = ref(false);
const syncInterval = ref(null);
const expandedLicenses = ref([]);

// Function to handle repayment
const repayOrder = async () => {
  if (!order.value || !order.value.id) return;
  
  try {
    await initiateRepayment(
      order.value.id, 
      user.value, 
      fetchOrderDetails // Callback to refresh data after payment
    );
  } catch (err) {
    console.error('Error initiating repayment:', err);
    showError('Failed to open payment window. Please try again.');
  }
};

// Function to handle transaction deletion
const deleteTransaction = async () => {
  if (!order.value || !order.value.id) return;
  
  if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
    return;
  }
  
  isDeleting.value = true;
  
  try {
    const response = await $fetch('/api/profile/history_order/delete-not-found', {
      method: 'POST',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      },
      body: {
        transactionId: order.value.id
      }
    });
    
    if (response.success) {
      success('Transaction deleted successfully');
      // Navigate back to the transactions list
      router.push('/profile/history_order');
    } else {
      throw new Error(response.message || 'Failed to delete transaction');
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
    showError(err.message || 'An error occurred while deleting the transaction');
  } finally {
    isDeleting.value = false;
  }
};

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
    
    const response = await $fetch(`/api/profile/history_order/${transactionId}`, {
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {
      order.value = response.data;
      
      // Auto-sync with Midtrans if transaction is pending
      if (isPendingTransaction(order.value)) {
        syncWithMidtrans();
        
        // Set up periodic checking for pending transactions
        if (syncInterval.value) clearInterval(syncInterval.value);
        syncInterval.value = setInterval(() => {
          if (isPendingTransaction(order.value)) {
            syncWithMidtrans();
          } else {
            clearInterval(syncInterval.value);
          }
        }, 30000); // Check every 30 seconds
      }
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

const isPendingTransaction = (transaction) => {
  if (!transaction) return false;
  return transaction.status === 'pending' || 
         (transaction.payment_gateway_status && 
          !['settlement', 'capture', 'cancel', 'deny', 'expire', 'failure'].includes(transaction.payment_gateway_status.toLowerCase()));
};

const syncWithMidtrans = async () => {
  if (!order.value || !order.value.id) return;
  
  try {
    console.log('Syncing transaction status with Midtrans...');
    const response = await $fetch(`/api/profile/history_order/sync-all`, {
      method: 'POST',
      body: { transactionIds: [order.value.id] },
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success && response.updated && response.updated.length > 0) {
      console.log('Transaction status updated from Midtrans');
      await fetchOrderDetails(); // Refresh order details
    }
  } catch (err) {
    console.error('Error syncing with Midtrans:', err);
  }
};

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (syncInterval.value) {
    clearInterval(syncInterval.value);
  }
});

// Helper computed property to always return an array of licenses
const licenseArray = computed(() => {
  // Try both license_info and license keys to handle different API responses
  const licenseData = order.value?.license_info || order.value?.license;
  console.log('License data from API:', licenseData);
  
  if (!licenseData) return [];
  
  // Parse the license data if it's a string
  let parsedData = licenseData;
  if (typeof licenseData === 'string') {
    try {
      parsedData = JSON.parse(licenseData);
      console.log('Parsed license data:', parsedData);
    } catch (e) {
      console.error('Error parsing license data:', e);
    }
  }
  
  const result = Array.isArray(parsedData) ? parsedData : [parsedData];
  console.log('Final license array:', result);
  return result;
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
  // Check both license_info and license keys
  const licenseData = order.value?.license_info || order.value?.license;
  if (!licenseData) return false;
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

// Konfigurasi invoice untuk customization
const invoiceConfig = {
  includeTax: false,        // Set true jika ingin menampilkan pajak
  taxRate: 0.10,           // Tarif pajak (10%)
  showSubtotal: false,     // Set true jika ingin menampilkan subtotal
  currency: 'IDR',         // Mata uang default
  companyName: 'NIXTY SOLUTIONS',
  companyTagline: 'Premium Software Solutions & Licensing',
  supportEmail: 'support@nixty.com'
};

const downloadInvoice = () => {
  // Generate and download invoice
  const invoiceData = {
    orderId: order.value.order_id,
    customerName: order.value.customer_name,
    email: order.value.email,
    productName: order.value.product_name_full || order.value.product_name,
    amount: order.value.amount,
    currency: order.value.product_currency || invoiceConfig.currency,
    orderDate: order.value.created_at,
    paymentDate: order.value.updated_at,
    paymentMethod: order.value.payment_method,
    status: order.value.status,
    config: invoiceConfig  // Pass configuration to PDF generator
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
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Define colors from the image
  const headerBgColor = '#0d2d44'; // Dark Blue
  const headerTextColor = '#ffffff';
  const tableHeaderBgColor = '#0d2d44';
  const tableHeaderTextColor = '#ffffff';
  const textColor = '#333333';
  const lightTextColor = '#666666';

  // Page Margins
  const pageMargin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (pageMargin * 2);
  let y = 20;

  // --- Header ---
  doc.setFillColor(headerBgColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company Name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headerTextColor);
  doc.text(data.config.companyName.toUpperCase(), pageMargin, 25);

  // Invoice Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - pageMargin, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: #${data.orderId}`, pageWidth - pageMargin, 28, { align: 'right' });
  doc.text(`Invoice Date: ${formatDate(data.orderDate)}`, pageWidth - pageMargin, 33, { align: 'right' });

  y = 55;

  // --- Seller & Bill To ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor);
  doc.text('SELLER', pageMargin, y);
  doc.text('BILL TO', pageWidth / 2, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightTextColor);

  // Seller Info
  doc.text(data.config.companyName, pageMargin, y + 7);
  doc.text(data.config.supportEmail, pageMargin, y + 14);

  // Bill To Info
  doc.text(data.customerName, pageWidth / 2, y + 7);
  doc.text(data.email, pageWidth / 2, y + 14);

  y += 30;

  // --- Table ---
  const tableY = y;
  const tableHeaderY = tableY;
  const tableRowY = tableHeaderY + 10;
  const col1X = pageMargin;
  const col2X = pageWidth - pageMargin - 50;

  // Table Header
  doc.setFillColor(tableHeaderBgColor);
  doc.rect(pageMargin, tableHeaderY, contentWidth, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(tableHeaderTextColor);
  doc.text('DESCRIPTION', col1X + 5, tableHeaderY + 7);
  doc.text('TOTAL', col2X + 45, tableHeaderY + 7, { align: 'right' });

  // Table Row
  doc.setDrawColor(lightTextColor);
  doc.setLineWidth(0.1);
  doc.rect(pageMargin, tableRowY, contentWidth, 12, 'S'); // Border for the row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);
  const productName = data.productName.length > 50 ? data.productName.substring(0, 50) + '...' : data.productName;
  doc.text(productName, col1X + 5, tableRowY + 8);
  doc.text(formatCurrency(data.amount), col2X + 45, tableRowY + 8, { align: 'right' });

  y = tableRowY + 12;

  // --- Grand Total ---
  const totalY = y + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor);
  doc.text('Grand Total', pageWidth - pageMargin - 70, totalY);
  doc.text(formatCurrency(data.amount), pageWidth - pageMargin, totalY, { align: 'right' });

  // --- Footer ---
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightTextColor);
  doc.text('Thank You for Your Business!', pageWidth / 2, y, { align: 'center' });

  // Save the PDF
  doc.save(`invoice-${data.orderId}.pdf`);
  success('🎉 Invoice downloaded successfully!');
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

const formatAdditionalInfo = (info) => {
  if (!info) return '';
  // Convert newlines to <br> tags for display
  return info.replace(/\n/g, '<br>');
};

const toggleLicense = (index) => {
  const idx = expandedLicenses.value.indexOf(index);
  if (idx > -1) {
    expandedLicenses.value.splice(idx, 1);
  } else {
    expandedLicenses.value.push(index);
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.order-details-container {
  max-width: 1200px;
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
  gap: var(--galaxy-space-lg);
}

.order-header-compact {
  margin-bottom: var(--galaxy-space-lg);
}

.order-meta-compact {
  display: flex;
  gap: var(--galaxy-space-md);
  font-size: 0.9rem;
  color: var(--galaxy-light-gray);
  margin-top: var(--galaxy-space-xs);
}

.updated-date {
  opacity: 0.7;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--galaxy-space-lg);
  align-items: start;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
}

.compact-card {
  padding: var(--galaxy-space-md);
}

.compact-card h3 {
  font-size: 1.1rem;
  margin-bottom: var(--galaxy-space-sm);
}

.product-details-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--galaxy-space-md);
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--galaxy-space-sm);
  margin: var(--galaxy-space-xs) 0;
}

.product-meta span {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--galaxy-radius-sm);
  background: rgba(255, 255, 255, 0.1);
  color: var(--galaxy-aurora-cyan);
}

.payment-details-compact {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--galaxy-space-md);
}

.payment-info p, .invoice-info p {
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: var(--galaxy-starlight);
}

.license-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
}

.license-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-sm);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.license-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.license-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--galaxy-starlight);
}

.license-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.license-content.expanded {
  max-height: 1000px;
  padding-top: var(--galaxy-space-sm);
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

.status-warning {
  background-color: var(--galaxy-solar-yellow);
  color: var(--galaxy-deep-space);
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

.pricing-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--galaxy-space-xs);
}

.total-badge {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  background: linear-gradient(135deg, var(--galaxy-aurora-cyan), var(--galaxy-nova-gold));
  color: var(--galaxy-deep-space);
  padding: 0.3rem 0.8rem;
  border-radius: var(--galaxy-radius-full);
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 174, 255, 0.3);
}

.total-badge i {
  font-size: 0.7rem;
}

.price-breakdown {
  font-size: 0.9rem;
  color: var(--galaxy-light-gray);
  margin: 0.2rem 0 0 0;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.price-breakdown i {
  color: var(--galaxy-aurora-cyan);
  font-size: 0.8rem;
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
  flex-wrap: wrap;
  gap: var(--galaxy-space-md);
  margin-top: var(--galaxy-space-lg);
}

.order-actions button {
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.galaxy-button-warn {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), var(--galaxy-solar-yellow));
  color: var(--galaxy-starlight);
  border: none;
  border-radius: var(--galaxy-radius-md);
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.galaxy-button-warn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 105, 180, 0.5);
}

.galaxy-button-warn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.galaxy-button-danger {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #ff3547);
  color: var(--galaxy-starlight);
  border: none;
  border-radius: var(--galaxy-radius-md);
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(255, 53, 71, 0.3);
}

.galaxy-button-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 53, 71, 0.5);
}

.galaxy-button-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: var(--galaxy-space-md);
  }

  .product-details-compact {
    flex-direction: column;
    gap: var(--galaxy-space-md);
  }

  .product-pricing {
    text-align: left;
  }

  .payment-grid {
    grid-template-columns: 1fr;
    gap: var(--galaxy-space-sm);
  }

  .order-meta-compact {
    flex-direction: column;
    gap: var(--galaxy-space-xs);
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
