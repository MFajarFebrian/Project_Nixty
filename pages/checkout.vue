<template>
  <div>
    <!-- Login warning modal -->
    <div v-if="showLoginWarning" class="modal-overlay">
      <div class="modal-content">
        <h2>Login Required</h2>
        <p>You must log in first to proceed with the product purchase.</p>
        <button class="cosmic-button" @click="openAuthModal">Login</button>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      v-if="isAuthModalOpen"
      :is-open="isAuthModalOpen"
      :default-tab="'login'"
      @close="closeAuthModal"
    />

    <!-- Other checkout content -->
    <div v-if="!showLoginWarning">
      <div class="checkout-page">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">!</div>
          <h2>Error</h2>
          <p>{{ error }}</p>
          <button class="galaxy-button-primary retry-btn" @click="fetchProductDetails">Try Again</button>
        </div>
        
        <!-- Product Content -->
        <div v-else-if="product" class="product-checkout-container">
          <div class="checkout-header">
            <h1>Complete Your Purchase</h1>
<p class="product-name">{{ selectedVersionName }}</p>
          </div>
          
          <div class="checkout-grid">
            <!-- Product Info Section -->
            <div class="product-info galaxy-card">
              <div class="product-image-container">
                <img 
                  :src="selectedVersionImage" 
                  :alt="selectedVersionName" 
                  class="product-image" 
                  @error="e => e.target.src = '/placeholder-grey.svg'"
                />
              </div>
              
            <div class="product-details">
                <div class="product-description" v-html="selectedVersionDescription"></div>
                
                <div class="product-features" v-if="selectedVersionFeatures.length > 0">
                  <h3>Features</h3>
                  <ul>
                    <li v-for="(feature, index) in selectedVersionFeatures" :key="index">
                      {{ feature }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Checkout Form Section -->
            <div class="checkout-form galaxy-card">
              <h2>Order Summary</h2>
              
              <!-- Version Selection -->
              <div class="form-group" v-if="availableVersions.length > 0">
                <label for="version">Select Version</label>
                <div class="version-options">
                  <button
                    v-for="version in availableVersions"
                    :key="version.id"
                    :class="['version-btn', { active: selectedVersionId === version.id }]"
                    @click="selectVersion(version)"
                  >
<span class="version-name">{{ version.name }}</span>
                    <span class="version-price">{{ formatCurrency(version.price) }}</span>
                    <span v-if="version.version === '365'" class="version-badge">Subscription</span>
                  </button>
                </div>
              </div>
              
              <!-- Email Field -->
              <div class="form-group">
                <label for="emailInput">Email for License Delivery</label>
                <input 
                  type="email" 
                  id="emailInput" 
                  :value="useCustomEmail ? customEmail : (user?.email || '')"
                  @input="handleEmailInput"
                  :placeholder="useCustomEmail ? 'Enter custom email address' : 'Your registered email'"
                  class="form-input"
                  :class="{ 'error': emailError }"
                  :disabled="!useCustomEmail"
                />
                
                <!-- Simple Checkbox -->
                <div class="simple-checkbox">
                  <input 
                    type="checkbox" 
                    id="useCustomEmailCheckbox" 
                    v-model="useCustomEmail" 
                    class="simple-checkbox-input"
                  />
                  <label for="useCustomEmailCheckbox" class="simple-checkbox-label">
                    Use different email address
                  </label>
                </div>
                
                <small v-if="emailError" class="error-text">{{ emailError }}</small>
                <small class="help-text">
                  {{ useCustomEmail ? 'Product license will be sent to the custom email above' : `Product license will be sent to your registered email: ${user?.email}` }}
                </small>
              </div>
              
              <div class="form-group">
                <label for="quantity">Quantity</label>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity" class="quantity-btn" :disabled="quantity <= 1">-</button>
                  <input 
                    type="number" 
                    id="quantity" 
                    v-model.number="quantity" 
                    min="1" 
                    :max="currentStock"
                    @blur="updateTotalPrice" 
                    @focus="onQuantityFocus"
                    @input="onQuantityInput"
                    @keyup.enter="updateTotalPrice"
                    class="quantity-input"
                    :class="{ 'calculating': isCalculating }"
                  />
                  <button @click="increaseQuantity" class="quantity-btn" :disabled="quantity >= currentStock">+</button>
                </div>
                <div class="stock-info">
                  <span v-if="currentStock > 0" class="stock-available">
                    <i class="fas fa-box"></i>
                    {{ currentStock }} licenses available
                  </span>
                  <span v-else class="stock-unavailable">
                    <i class="fas fa-exclamation-triangle"></i>
                    Out of stock
                  </span>
                </div>
              </div>
              
              <div class="price-summary">
                <div class="summary-header">
                  <i class="fas fa-calculator"></i>
                  <h3>Price Breakdown</h3>
                </div>
                <div class="summary-row">
                  <span><i class="fas fa-tag"></i> Product Price</span>
                  <span class="price-value">{{ formatCurrency(selectedVersionPrice) }}</span>
                </div>
                <div class="summary-row">
                  <span><i class="fas fa-boxes"></i> Quantity</span>
                  <span class="quantity-value">{{ displayQuantity }} {{ displayQuantity > 1 ? 'licenses' : 'license' }}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span><i class="fas fa-wallet"></i> <strong>Total Amount</strong></span>
                  <span class="total-amount">{{ formatCurrency(totalPrice) }}</span>
                </div>
                <div class="savings-indicator" v-if="displayQuantity > 1">
                  <i class="fas fa-piggy-bank"></i>
                  <span>{{ displayQuantity }} licenses for {{ formatCurrency(totalPrice) }}</span>
                </div>
              </div>
              
              <button @click="initiatePayment" class="galaxy-button-primary pay-button">
                <span class="button-text">Complete Purchase</span>
                <span class="button-icon">→</span>
              </button>
              
              <div class="payment-info">
                <p>Secure payment processing by Midtrans</p>
                <div class="payment-icons">
                  <img src="/qris-logo.png" alt="QRIS" class="payment-icon qris-logo" />
                  <!-- Add more payment icons -->
                </div>
                <p class="payment-note">Pay via QRIS, e-wallet, virtual account, or credit card</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Product Found -->
        <div v-else class="no-product-found">
          <p>Product not found.</p>
          <button class="galaxy-button-secondary" @click="$router.push('/')">Return to Home</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUtils } from '~/composables/useUtils';
import { useAuth } from '~/composables/useAuth'
import AuthModal from '~/components/AuthModal.vue'

const route = useRoute();
const router = useRouter();
const { formatCurrency } = useUtils();

const product = ref(null);
const isLoading = ref(true);
const error = ref(null);
const quantity = ref(1);
const selectedVersionId = ref(null);
const availableVersions = ref([]);
const customEmail = ref('');
const useCustomEmail = ref(false); // Toggle for custom email
const emailError = ref('');
const isCalculating = ref(false);

// Handle email input changes
const handleEmailInput = (event) => {
  if (useCustomEmail.value) {
    customEmail.value = event.target.value;
  }
};

// Log route parameters for debugging
console.log('Checkout page loaded with route query:', route.query);

async function fetchProductDetails() {
  try {
    isLoading.value = true;
    error.value = null;
    
    const productId = route.query.productId;
    const productSlug = route.query.slug;
    
    if (!productId && !productSlug) {
      throw new Error('Missing product ID or slug in URL');
    }
    
    console.log('Fetching product details for:', productId ? `ID: ${productId}` : `Slug: ${productSlug}`);
    
    try {
      // Always use the checkout endpoint with either slug or productId
      const response = await $fetch('/api/products/checkout', {
        params: { 
          slug: productSlug,
          productId: productId 
        }
      });
      
      console.log('API response received:', response);
      
      if (!response || !response.product) {
        throw new Error('Product not found or invalid response format');
      }
      
      product.value = response.product;
      
      // Set available versions
      if (response.product.versions && response.product.versions.length > 0) {
        availableVersions.value = response.product.versions;
        
        // If productId is provided, select that specific version
        if (productId) {
          const targetVersion = response.product.versions.find(v => v.id === productId);
          if (targetVersion) {
            selectedVersionId.value = targetVersion.id;
          } else {
            // Fallback to first version if productId not found
            selectedVersionId.value = response.product.versions[0].id;
          }
        } else {
          // Default to first version if no productId
          selectedVersionId.value = response.product.versions[0].id;
        }
      } else {
        availableVersions.value = [{
          id: product.value.id,
          name: product.value.name,
          version: product.value.version,
          description: product.value.description, // Add description for fallback version
          price: product.value.price,
          image_url: product.value.image_url
        }];
        selectedVersionId.value = product.value.id;
      }
      
    } catch (apiError) {
      console.error('API error:', apiError);
      throw new Error(`API error: ${apiError.message || 'Unknown error'}`);
    }
    
    // Don't parse features globally anymore - will be handled per version
    
    console.log('Product data fetched:', product.value);
  } catch (e) {
    error.value = e.message || 'Failed to load product details';
    console.error('Error fetching product details:', e);
  } finally {
    isLoading.value = false;
  }
}

const selectedVersionPrice = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return product.value?.price || 0;
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.price : 0;
});

// Computed property for selected version description
const selectedVersionDescription = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return product.value?.description || '';
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? (selectedVersion.description || '') : (product.value?.description || '');
});

// Computed property for selected version image
const selectedVersionImage = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return product.value?.image_url || '/placeholder-grey.svg';
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.image_url || product.value?.image_url || '/placeholder-grey.svg' : product.value?.image_url || '/placeholder-grey.svg';
});

// Computed property for selected version name
const selectedVersionName = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return product.value?.name || '';
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.name : product.value?.name || '';
});

// Computed property for selected version features
const selectedVersionFeatures = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return [];
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  const featureMatch = selectedVersion.description.match(/Features:(.*?)(?:\n\n|$)/s);
  if (featureMatch && featureMatch[1]) {
    const featuresText = featureMatch[1].trim();
    return featuresText.split('\n').map(f => f.replace(/^[-•*]\s*/, '').trim()).filter(f => f);
  }
  return [];
});

const totalPrice = ref(0);
const displayQuantity = ref(1);

const currentStock = computed(() => {
  if (!selectedVersionId.value || !availableVersions.value.length) {
    return 0;
  }
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.available_stock || 0 : 0;
});

// Watch for changes in route query
watch(() => route.query, (newQuery) => {
  if (newQuery.productId || newQuery.slug) {
    fetchProductDetails();
  }
}, { immediate: true });

// Watch for price changes to update total (but only when not in calculating state)
watch(selectedVersionPrice, () => {
  if (!isCalculating.value) {
    updateTotalPrice();
  }
});

const selectVersion = (version) => {
  selectedVersionId.value = version.id;
  // Reset quantity when version changes and check stock
  if (quantity.value > version.available_stock) {
    quantity.value = Math.max(1, version.available_stock);
  }
  // Update total price when version changes
  updateTotalPrice();
};

const increaseQuantity = () => {
  if (quantity.value < currentStock.value) {
    quantity.value++;
    updateTotalPrice();
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    updateTotalPrice();
  }
};

const updateTotalPrice = () => {
  // Ensure quantity is within valid range
  if (quantity.value < 1) {
    quantity.value = 1;
  } else if (quantity.value > currentStock.value) {
    quantity.value = currentStock.value;
  }
  
  // Update display values
  displayQuantity.value = quantity.value;
  totalPrice.value = selectedVersionPrice.value * quantity.value;
  isCalculating.value = false;
};

const onQuantityFocus = () => {
  isCalculating.value = false;
};

const onQuantityInput = () => {
  // Show visual feedback that calculation is pending
  isCalculating.value = true;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = () => {
  emailError.value = '';
  
  // Only validate custom email if custom email is enabled
  if (useCustomEmail.value) {
    if (!customEmail.value.trim()) {
      emailError.value = 'Custom email is required when this option is selected';
      return false;
    }
    
    if (!validateEmail(customEmail.value)) {
      emailError.value = 'Please enter a valid email address';
      return false;
    }
  }
  
  return true;
};

const initiatePayment = async () => {
  console.log('🚀 Starting payment initiation...');
  
  // Check if user is authenticated
  if (!user.value) {
    console.error('❌ No user data found - authentication required');
    alert('You must be logged in to complete a purchase. Please log in first.');
    showLoginWarning.value = true;
    return;
  }
  
  console.log('👤 User authenticated:', {
    id: user.value.id,
    name: user.value.name,
    email: user.value.email
  });
  
  console.log('📋 User session data for header:', JSON.stringify(user.value));
  
  if (!product.value || quantity.value < 1) {
    console.error('❌ Invalid product or quantity');
    alert('Please select a valid quantity.');
    return;
  }
  
  // Check stock availability
  if (currentStock.value <= 0) {
    console.error('❌ Product out of stock');
    alert('This product is currently out of stock.');
    return;
  }
  
  if (quantity.value > currentStock.value) {
    console.error('❌ Insufficient stock');
    alert(`Only ${currentStock.value} licenses available. Please reduce quantity.`);
    return;
  }
  
  // Validate form including email
  if (!validateForm()) {
    console.error('❌ Form validation failed');
    return;
  }
  
  // Get the selected version details
  const selectedVersion = availableVersions.value.find(v => v.id === selectedVersionId.value);
  if (!selectedVersion) {
    console.error('❌ No valid product version selected');
    alert('Please select a valid product version.');
    return;
  }

  try {
    const requestBody = {
      product: {
        id: selectedVersion.id,
        name: product.value.name,
        version: selectedVersion.version,
        price: selectedVersion.price,
        category: product.value.category
      },
      customer: {
        name: user.value.name,
        email: user.value.email
      },
      quantity: quantity.value,
      custom_email: useCustomEmail.value ? customEmail.value.trim() : null
    };
    
    console.log('📦 Request body prepared:', requestBody);
    console.log('🔐 Sending authentication headers with user session');

    const response = await $fetch('/api/checkout/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-session': JSON.stringify(user.value)
      },
      body: requestBody,
    });

    if (response.token) {
      // Store order ID for the custom status checker
      if (response.order_id) {
        localStorage.setItem('currentOrderId', response.order_id);
        sessionStorage.setItem('currentOrderId', response.order_id);
      }
      
      window.snap.pay(response.token, {
        onSuccess: function(result){
          console.log("Payment successful!", result);
          // Add 5-second delay before redirecting to payment finish page
          setTimeout(() => {
            router.push({
              path: '/payment/finish',
              query: {
                order_id: result.order_id,
                status_code: result.status_code,
                transaction_status: result.transaction_status
              }
            });
          }, 5000); // 5000ms = 5 seconds
        },
        onPending: function(result){
          console.log("Payment pending", result);
          router.push({
            path: '/payment/unfinish',
            query: {
              order_id: result.order_id,
              status_code: result.status_code,
              transaction_status: result.transaction_status
            }
          });
        },
        onError: function(result){
          console.error("Payment failed", result);
          router.push({
            path: '/payment/error',
            query: {
              order_id: result.order_id,
              status_code: result.status_code,
              transaction_status: result.transaction_status
            }
          });
        },
        onClose: function(){
          console.log('Payment window closed by user.');
          const orderId = localStorage.getItem('currentOrderId');
          router.push({
            path: '/payment/unfinish',
            query: {
              order_id: orderId || '',
              reason: 'user_closed_popup'
            }
          });
        }
      });
    } else {
      alert('Failed to get payment token.');
    }
  } catch (e) {
    console.error('Error initiating payment:', e);
    alert('Error initiating payment: ' + (e.message || 'Unknown error'));
  }
};

const { user, initUser } = useAuth()
const showLoginWarning = ref(false)
const isAuthModalOpen = ref(false)

const openAuthModal = () => {
  isAuthModalOpen.value = true
}
const closeAuthModal = () => {
  isAuthModalOpen.value = false
  // If user is logged in after modal is closed, hide the warning
  if (user.value) showLoginWarning.value = false
}

// Set page title
useHead({
  title: 'Checkout'
});

onMounted(() => {
  initUser()
  if (!user.value) {
    showLoginWarning.value = true
  } else {
    // Initialize email options
    useCustomEmail.value = false; // Default to user's email
    customEmail.value = '';
  }
  fetchProductDetails();

  // Load Midtrans Snap.js only once
  if (!document.getElementById('midtrans-snap-script')) {
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const config = useRuntimeConfig();
    const clientKey = config.public.midtransClientKey || 'SB-Mid-client-XZVBXJmESkGTZlFP';

    let script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = midtransScriptUrl;
    script.setAttribute('data-client-key', clientKey);
    document.body.appendChild(script);
  }
  
  // Load official Midtrans enhancement script only once
  if (!document.getElementById('midtrans-official-script')) {
    const customScript = document.createElement('script');
    customScript.id = 'midtrans-official-script';
    customScript.src = '/midtrans-official.js';
    customScript.async = true;
    document.body.appendChild(customScript);
  }
});
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  padding: var(--galaxy-space-xl) var(--galaxy-space-md);
  color: var(--galaxy-starlight);
}

/* Loading and Error States */
.loading-state, .error-state, .no-product-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--galaxy-space-xl);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(77, 208, 225, 0.3);
  border-radius: 50%;
  border-top-color: var(--galaxy-aurora-cyan);
  animation: spin 1s infinite linear;
  margin-bottom: var(--galaxy-space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--galaxy-plasma-orange);
  color: var(--galaxy-starlight);
  border-radius: 50%;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: var(--galaxy-space-md);
}

.retry-btn {
  margin-top: var(--galaxy-space-md);
}

/* Main Container */
.product-checkout-container {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  text-align: center;
  margin-bottom: var(--galaxy-space-xl);
}

.checkout-header h1 {
  font-size: 2.5rem;
  margin-bottom: var(--galaxy-space-xs);
}

.product-name {
  font-size: 1.5rem;
  color: var(--galaxy-aurora-cyan);
}

/* Grid Layout */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--galaxy-space-xl);
}

@media (max-width: 992px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .quantity-controls {
    justify-content: center;
  }
  
  .quantity-btn {
    width: 44px;
    height: 44px;
    font-size: 1.4rem;
  }
  
  .quantity-input {
    width: 90px;
    height: 44px;
    font-size: 1.1rem;
    min-width: 90px;
  }
  
  .stock-info {
    text-align: center;
  }
}

/* Product Info Section */
.product-info {
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-lg);
}

.product-image-container {
  margin-bottom: var(--galaxy-space-lg);
  text-align: center;
}

.product-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--galaxy-radius-md);
  box-shadow: var(--galaxy-shadow-medium);
}

.product-details {
  color: var(--galaxy-light-gray);
}

.product-description {
  margin-bottom: var(--galaxy-space-lg);
  line-height: 1.7;
}

.product-features h3 {
  color: var(--galaxy-aurora-cyan);
  margin-bottom: var(--galaxy-space-sm);
}

.product-features ul {
  padding-left: var(--galaxy-space-lg);
}

.product-features li {
  margin-bottom: var(--galaxy-space-xs);
}

/* Checkout Form Section */
.checkout-form {
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-lg);
}

.checkout-form h2 {
  margin-bottom: var(--galaxy-space-lg);
  color: var(--galaxy-aurora-cyan);
}

.form-group {
  margin-bottom: var(--galaxy-space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--galaxy-space-sm);
  color: var(--galaxy-light-gray);
}

.form-input {
  width: 100%;
  padding: var(--galaxy-space-md);
  background: var(--galaxy-dark-matter);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  font-size: 1rem;
  transition: var(--galaxy-transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--galaxy-nova-gold);
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

.form-input.error {
  border-color: var(--galaxy-plasma-orange);
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.error-text {
  color: var(--galaxy-plasma-orange);
  font-size: 0.85rem;
  margin-top: var(--galaxy-space-xs);
  display: block;
}

.help-text {
  color: var(--galaxy-light-gray);
  font-size: 0.85rem;
  margin-top: var(--galaxy-space-xs);
  display: block;
  opacity: 0.8;
}

/* Simple Checkbox */
.simple-checkbox {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  margin-top: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-xs);
}

.simple-checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--galaxy-aurora-cyan);
  cursor: pointer;
}

.simple-checkbox-label {
  font-size: 0.9rem;
  color: var(--galaxy-light-gray);
  cursor: pointer;
  user-select: none;
}

.form-input:disabled {
  background: var(--galaxy-asteroid-gray);
  color: var(--galaxy-light-gray);
  opacity: 0.7;
  cursor: not-allowed;
}

.version-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: var(--galaxy-space-md);
  margin-bottom: var(--galaxy-space-lg);
}

.version-btn {
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  padding: var(--galaxy-space-md) var(--galaxy-space-sm);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  min-height: 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.version-btn:hover {
  background: var(--galaxy-cosmic-blue);
}

.version-btn.active {
  background: var(--galaxy-aurora-cyan);
  border-color: var(--galaxy-aurora-cyan);
  color: var(--galaxy-dark-matter);
}

.version-name {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: var(--galaxy-space-xs);
}

.version-price {
  font-size: 0.9rem;
  color: var(--galaxy-aurora-cyan);
}

.version-btn.active .version-price {
  color: var(--galaxy-dark-matter);
}

.version-btn.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(77, 208, 225, 0.2) 100%);
  pointer-events: none;
}

.version-btn.active::before {
  content: '✓';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  background: var(--galaxy-dark-matter);
  color: var(--galaxy-aurora-cyan);
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.version-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--galaxy-nova-gold);
  color: var(--galaxy-dark-matter);
  font-size: 0.7rem;
  padding: 2px 6px;
  border-bottom-right-radius: var(--galaxy-radius-sm);
  font-weight: bold;
  transform: translateY(-2px);
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--galaxy-space-xs);
}

.quantity-btn {
  width: 40px;
  height: 40px;
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
}

.quantity-btn:hover {
  background: var(--galaxy-cosmic-blue);
}

.quantity-input {
  width: 80px;
  height: 40px;
  background: var(--galaxy-dark-matter);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  text-align: center;
  font-size: 1rem;
  padding: 0 var(--galaxy-space-xs);
  min-width: 80px;
  box-sizing: border-box;
  transition: var(--galaxy-transition-normal);
}

.quantity-input:focus {
  outline: none;
  border-color: var(--galaxy-nova-gold);
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

/* Hide number input spinner arrows */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.quantity-input[type=number] {
  -moz-appearance: textfield;
}

.quantity-input.calculating {
  border-color: var(--galaxy-solar-yellow);
  background: rgba(255, 215, 0, 0.05);
}

.quantity-input.calculating:focus {
  border-color: var(--galaxy-solar-yellow);
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--galaxy-asteroid-gray);
}

.stock-info {
  margin-top: var(--galaxy-space-sm);
  font-size: 0.9rem;
}

.stock-available {
  color: var(--galaxy-comet-green);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.stock-unavailable {
  color: var(--galaxy-plasma-orange);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

/* Price Summary */
.price-summary {
  margin-bottom: var(--galaxy-space-xl);
  padding: var(--galaxy-space-lg);
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(77, 208, 225, 0.1) 100%);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid var(--galaxy-aurora-cyan);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-md);
  padding-bottom: var(--galaxy-space-sm);
  border-bottom: 1px solid rgba(77, 208, 225, 0.3);
}

.summary-header i {
  color: var(--galaxy-aurora-cyan);
  font-size: 1.2rem;
}

.summary-header h3 {
  margin: 0;
  color: var(--galaxy-aurora-cyan);
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-sm) 0;
  color: var(--galaxy-light-gray);
  font-size: 0.95rem;
}

.summary-row span:first-child {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
}

.summary-row i {
  color: var(--galaxy-aurora-cyan);
  font-size: 0.9rem;
  width: 16px;
  text-align: center;
}

.price-value {
  font-weight: 600;
  color: var(--galaxy-starlight);
}

.quantity-value {
  font-weight: 600;
  color: var(--galaxy-starlight);
  background: rgba(77, 208, 225, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.9rem;
}

.summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--galaxy-aurora-cyan), transparent);
  margin: var(--galaxy-space-sm) 0;
}

.summary-row.total {
  margin-top: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md) 0;
  background: rgba(77, 208, 225, 0.05);
  border-radius: var(--galaxy-radius-md);
  padding-left: var(--galaxy-space-md);
  padding-right: var(--galaxy-space-md);
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--galaxy-starlight);
  border: 1px solid rgba(77, 208, 225, 0.3);
}

.total-amount {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--galaxy-nova-gold);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.savings-indicator {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  margin-top: var(--galaxy-space-sm);
  padding: var(--galaxy-space-sm);
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--galaxy-radius-sm);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: var(--galaxy-comet-green);
  font-size: 0.9rem;
  font-weight: 500;
}

.savings-indicator i {
  color: var(--galaxy-comet-green);
  font-size: 1rem;
}

/* Pay Button */
.pay-button {
  width: 100%;
  padding: var(--galaxy-space-md);
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-lg);
}

.button-icon {
  transition: transform 0.3s ease;
}

.pay-button:hover .button-icon {
  transform: translateX(5px);
}

/* Payment Info */
.payment-info {
  text-align: center;
  color: var(--galaxy-light-gray);
  font-size: 0.9rem;
}

.payment-icons {
  display: flex;
  justify-content: center;
  gap: var(--galaxy-space-md);
  margin-top: var(--galaxy-space-sm);
}

.payment-icon {
  height: 30px;
  opacity: 0.7;
}

.qris-logo {
  height: 40px;
  opacity: 1;
}

.payment-note {
  margin-top: var(--galaxy-space-sm);
  color: var(--galaxy-light-gray);
  font-size: 0.85rem;
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: var(--galaxy-card-gradient, #222);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  text-align: center;
  color: var(--galaxy-starlight, #fff);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.cosmic-button {
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  background: var(--galaxy-primary-gradient, #4f8cff);
  color: #fff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s, filter 0.2s;
}
.cosmic-button:hover {
  filter: brightness(1.2);
}
</style> 