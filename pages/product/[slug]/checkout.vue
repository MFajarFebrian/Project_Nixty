<template>
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
        <h1>Checkout</h1>
<p class="product-name">{{ selectedVersionName || product.name }}</p>
      </div>
      
      <div class="checkout-grid">
        <!-- Product Info Section -->
        <div class="product-info galaxy-card">
          <div class="product-image-container">
            <img 
              :src="selectedVersionImage || product.image_url || '/placeholder-product.png'" 
              :alt="selectedVersionName || product.name" 
              class="product-image" 
              @error="e => e.target.src = '/placeholder-product.png'"
            />
          </div>
          
          <div class="product-details">
            <div class="product-description" v-html="selectedVersionDescription"></div>
            
            <div class="product-features" v-if="product.features">
              <h3>Features</h3>
              <ul>
                <li v-for="(feature, index) in product.features" :key="index">
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
          <div class="form-group" v-if="product.versions && product.versions.length > 1">
            <label for="version">Select Version</label>
            <div class="version-options">
              <button
                v-for="version in product.versions"
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
          
          <div class="form-group">
            <label for="quantity">Quantity</label>
            <div class="quantity-controls">
              <button @click="decreaseQuantity" class="quantity-btn">-</button>
              <input 
                type="number" 
                id="quantity" 
                v-model.number="quantity" 
                min="1" 
                @change="updateTotalPrice" 
                class="quantity-input"
              />
              <button @click="increaseQuantity" class="quantity-btn">+</button>
            </div>
          </div>
          
          <div class="price-summary">
            <div class="summary-row">
              <span>Product Price</span>
              <span>{{ formatCurrency(selectedVersionPrice) }}</span>
            </div>
            <div class="summary-row">
              <span>Quantity</span>
              <span>{{ quantity }}</span>
            </div>
            <div class="summary-row total">
              <span>Total Price</span>
              <span>{{ formatCurrency(totalPrice) }}</span>
            </div>
          </div>
          
          <button @click="initiatePayment" class="galaxy-button-primary pay-button checkout-button">
            <span class="button-icon">🛒</span>
            <span class="button-text">Payment</span>
          </button>
          
          <div class="payment-info">
            <p>Secure payment processing by Midtrans</p>
            <div class="payment-icons">
              <img src="/placeholder-icon.png" alt="Visa" class="payment-icon" />
              <img src="/placeholder-icon.png" alt="Mastercard" class="payment-icon" />
              <img src="/placeholder-icon.png" alt="Bank Transfer" class="payment-icon" />
            </div>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUtils } from '~/composables/useUtils';
const config = useRuntimeConfig();

const route = useRoute();
const router = useRouter();
const { formatCurrency } = useUtils();
const product = ref(null);
const isLoading = ref(true);
const error = ref(null);
const quantity = ref(1); // Default quantity
const selectedVersionId = ref(null); // To store the ID of the selected version

// Log route parameters for debugging
console.log('Checkout page loaded with route params:', route.params);

const totalPrice = computed(() => {
  return selectedVersionPrice.value * quantity.value;
});

const selectedVersionPrice = computed(() => {
  if (!product.value || !selectedVersionId.value) {
    return 0;
  }
  const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.price : 0;
});

const selectedVersionImage = computed(() => {
  if (!product.value || !selectedVersionId.value) {
    return null;
  }
  const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.image_url : null;
});

const selectedVersionName = computed(() => {
  if (!product.value || !selectedVersionId.value) {
    return product.value?.name || '';
  }
  const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? selectedVersion.name : product.value?.name || '';
});

// Computed property for selected version description
const selectedVersionDescription = computed(() => {
  if (!product.value || !selectedVersionId.value) {
    return product.value?.description || '';
  }
  const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
  return selectedVersion ? (selectedVersion.description || '') : (product.value?.description || '');
});

const fetchProductDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const slug = route.params.slug;
    
    if (!slug) {
      throw new Error('Missing product slug in URL');
    }
    
    console.log('Fetching product details for slug:', slug);
    
    try {
      const response = await $fetch(`/api/products/checkout`, {
        params: { slug }
      });
      
      console.log('API response received:', response);
      
      if (!response || !response.product) {
        throw new Error('Product not found or invalid response format');
      }
      
      product.value = response.product;
      // Set default selected version if available
      if (product.value.versions && product.value.versions.length > 0) {
        selectedVersionId.value = product.value.versions[0].id;
      }
    } catch (apiError) {
      console.error('API error:', apiError);
      throw new Error(`API error: ${apiError.message || 'Unknown error'}`);
    }
    
    // Parse features from description if not provided
    if (!product.value.features && product.value.description) {
      const featureMatch = product.value.description.match(/Features:(.*?)(?:\n\n|$)/s);
      if (featureMatch && featureMatch[1]) {
        const featuresText = featureMatch[1].trim();
        product.value.features = featuresText.split('\n').map(f => f.replace(/^[-•*]\s*/, '').trim()).filter(f => f);
      }
    }
    
    console.log('Product data fetched:', product.value);
  } catch (e) {
    error.value = e.message || 'Failed to load product details';
    console.error('Error fetching product details:', e);
  } finally {
    isLoading.value = false;
  }
};

const selectVersion = (version) => {
  selectedVersionId.value = version.id;
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const updateTotalPrice = () => {
  // Ensure quantity is at least 1
  if (quantity.value < 1) {
    quantity.value = 1;
  }
};

const initiatePayment = async () => {
  if (!product.value || quantity.value < 1 || !selectedVersionId.value) {
    alert('Please select a product version and valid quantity.');
    return;
  }
  
  // Get the selected version details
  const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
  if (!selectedVersion) {
    alert('Please select a valid product version.');
    return;
  }

  try {
    // Get selected version details
    const selectedVersion = product.value.versions.find(v => v.id === selectedVersionId.value);
    
    const response = await $fetch('/api/midtrans/initiate-transaction', {
      method: 'POST',
      body: {
        product_id: selectedVersion.id,
        product_name: `${product.value.name} ${selectedVersion.version || ''}`.trim(),
        price: selectedVersion.price,
        quantity: quantity.value,
      },
    });

    if (response.token) {
      window.snap.pay(response.token, {
        onSuccess: function(result){
          alert("Payment successful!");
          console.log(result);
          router.push('/');
        },
        onPending: function(result){
          alert("Payment pending. Please complete your payment.");
          console.log(result);
        },
        onError: function(result){
          alert("Payment failed. Please try again.");
          console.log(result);
        },
        onClose: function(){
          alert('Payment window closed. Your order is not complete.');
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

onMounted(() => {
  fetchProductDetails();

  // Load Midtrans Snap.js
  const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
  const clientKey = config.public.midtransClientKey;

  let script = document.createElement('script');
  script.src = midtransScriptUrl;
  script.setAttribute('data-client-key', clientKey);
  document.body.appendChild(script);
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
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-dark-matter);
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
  width: 60px;
  height: 40px;
  background: var(--galaxy-dark-matter);
  color: var(--galaxy-starlight);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  text-align: center;
  margin: 0 var(--galaxy-space-sm);
  font-size: 1.1rem;
}

/* Price Summary */
.price-summary {
  margin-bottom: var(--galaxy-space-xl);
  padding: var(--galaxy-space-md);
  background: rgba(26, 26, 46, 0.7);
  border-radius: var(--galaxy-radius-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--galaxy-space-xs) 0;
  color: var(--galaxy-light-gray);
}

.summary-row.total {
  margin-top: var(--galaxy-space-sm);
  padding-top: var(--galaxy-space-sm);
  border-top: 1px solid var(--galaxy-aurora-cyan);
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--galaxy-starlight);
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

.checkout-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  border: none !important;
  color: white !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.checkout-button:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.button-icon {
  transition: transform 0.3s ease;
  font-size: 1.1rem;
}

.checkout-button .button-icon {
  margin-right: var(--galaxy-space-xs);
}

.pay-button:hover .button-icon {
  transform: translateX(5px);
}

.checkout-button:hover .button-icon {
  transform: scale(1.1);
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
</style>
