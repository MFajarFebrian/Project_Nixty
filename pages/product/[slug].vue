<template>
  <div class="product-page-container">
    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>Loading Product...</p>
    </div>
    <div v-else-if="error" class="state-container">
      <p class="error-text">&#10060; {{ error }}</p>
        <button @click="fetchProductData" class="galaxy-button-secondary">Try Again</button>
    </div>
    <div v-else class="product-content">
      
      <div class="product-header galaxy-card">
        <h1 class="product-title galaxy-gradient-text">{{ productFamily }}</h1>
        <p class="product-subtitle">Choose the version that suits your needs</p>
      </div>

      
      <div class="version-grid">
        <div v-for="product in products" :key="product.id" class="version-card galaxy-card" :class="{ 'out-of-stock': isProductOutOfStock(product) }">
          
          <div class="version-header">
            <h2 class="version-title">{{ product.version }}</h2>
            <div class="badge-container">
              <span v-if="product.is_new" class="badge new-badge">NEW</span>
              <span v-if="isProductOutOfStock(product)" class="badge out-of-stock-badge">OUT OF STOCK</span>
            </div>
          </div>

          
          <div class="version-image-container">
            <img :src="product.image_url || '/placeholder-product.png'" 
                 :alt="product.name" 
                 class="version-image" />
          </div>

          
          <div class="version-details">
            <p class="version-description">{{ product.short_description }}</p>
            <div class="price-section">
              <span class="price-label">Price:</span>
              <span class="price-amount">{{ formatCurrency(product.price) }}</span>
              <span v-if="product.period" class="price-period">{{ product.period }}</span>
            </div>
          </div>

          
          <div class="version-actions">
            <button class="buy-now-btn galaxy-button-primary" @click="goToCheckout(product)" :disabled="isProductOutOfStock(product)">
              {{ isProductOutOfStock(product) ? 'Out of Stock' : 'Buy Now' }}
              <span v-if="!isProductOutOfStock(product)" class="icon">&#10148;</span>
            </button>
            <button class="details-btn galaxy-button-secondary" @click="showDetails(product)">
              View Details
            </button>
          </div>
        </div>
      </div>

      
      <div v-if="selectedProduct" class="product-details galaxy-card">
        <h3 class="details-title">Product Details</h3>
        <div v-html="selectedProduct.description" class="details-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const products = ref([]);
const selectedProduct = ref(null);
const isLoading = ref(true);
const error = ref(null);
const product = ref(null);


const productFamily = computed(() => {
  if (products.value.length === 0) return '';
  return products.value[0].name.split(' ').slice(0, -1).join(' ');
});

const fetchProductData = async () => {
  const slug = route.params.slug;
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Fetching products for slug:', slug);
    const response = await $fetch(`/api/products/details`, {
      params: {
        slug: slug,
        productId: route.query.productId // Pass productId from query
      }
    });
    console.log('API Response:', response);


    if (response.success && response.product && Array.isArray(response.versions)) {

      product.value = response.product;
      products.value = response.versions;
    } else if (response.product && Array.isArray(response.versions)) {

      product.value = response.product;
      products.value = response.versions;
    } else {
      throw new Error('Invalid product data received');
    }


    if (route.query.productId) {
      const targetVersion = products.value.find(v => v.id == route.query.productId);
      if (targetVersion) {
        selectedProduct.value = targetVersion;
      } else {
        selectedProduct.value = products.value[0];
      }
    } else {
      selectedProduct.value = products.value[0];
    }
    
    console.log('Processed products:', products.value);
  } catch (err) {
    console.error('Error fetching product:', err);
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const isProductOutOfStock = (product) => {
  return product.status === 'out_of_stock' || product.available_stock === 0;
};

const showDetails = (product) => {
  selectedProduct.value = product;

  document.querySelector('.product-details')?.scrollIntoView({ behavior: 'smooth' });
};

const goToCheckout = (product) => {

  if (isProductOutOfStock(product)) {
    console.warn('Cannot checkout out of stock product');
    return;
  }
  

  const productSlug = product.slug || route.params.slug;
  router.push(`/product/${productSlug}/checkout`);
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

onMounted(fetchProductData);
</script>

<style scoped>
.product-page-container {
  max-width: 1200px;
  margin: var(--galaxy-space-2xl) auto;
  padding: var(--galaxy-space-md);
}

.product-content {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xl);
}

.product-header {
  text-align: center;
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
}

.product-title {
  font-size: 2.5rem;
  margin-bottom: var(--galaxy-space-sm);
}

.product-subtitle {
  color: var(--galaxy-cloud-gray);
  font-size: 1.1rem;
}

.version-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--galaxy-space-xl);
}

.version-card {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-lg);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid var(--galaxy-asteroid-gray);
  transition: all var(--galaxy-transition-normal);
}

.version-card:hover {
  transform: translateY(-5px);
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: var(--galaxy-glow-cyan);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-title {
  font-size: 1.5rem;
  color: var(--galaxy-starlight);
}

.badge-container {
  display: flex;
  gap: var(--galaxy-space-xs);
}

.badge.new-badge {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-full);
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.out-of-stock-badge {
  background: var(--galaxy-cloud-gray, #666);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-full);
  font-size: 0.8rem;
  font-weight: bold;
}

.version-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: var(--galaxy-radius-md);
  background: var(--galaxy-deep-space);
}

.version-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform var(--galaxy-transition-normal);
}

.version-card:hover .version-image {
  transform: scale(1.05);
}

.version-details {
  flex-grow: 1;
}

.version-description {
  color: var(--galaxy-cloud-gray);
  margin-bottom: var(--galaxy-space-md);
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-md);
}

.price-label {
  color: var(--galaxy-cloud-gray);
}

.price-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--galaxy-aurora-cyan);
}

.price-period {
  color: var(--galaxy-cloud-gray);
  font-size: 0.9rem;
}

.version-actions {
  display: flex;
  gap: var(--galaxy-space-md);
}

.buy-now-btn, .details-btn {
  flex: 1;
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
  transition: all var(--galaxy-transition-normal);
}

.buy-now-btn {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  border: none;
}

.buy-now-btn:disabled {
  background: var(--galaxy-cloud-gray, #666) !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.buy-now-btn:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.details-btn {
  background: transparent;
  border: 1px solid var(--galaxy-aurora-cyan);
  color: var(--galaxy-aurora-cyan);
}

.buy-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.details-btn:hover {
  background: rgba(77, 208, 225, 0.1);
}

/* Out of Stock Styling */
.version-card.out-of-stock {
  opacity: 0.6;
  filter: grayscale(100%);
}

.version-card.out-of-stock .version-image {
  filter: grayscale(100%) brightness(0.8);
}

.version-card.out-of-stock .version-title,
.version-card.out-of-stock .price-amount,
.version-card.out-of-stock .version-description {
  color: var(--galaxy-cloud-gray, #888) !important;
}

.version-card.out-of-stock:hover {
  transform: none;
  border-color: var(--galaxy-asteroid-gray);
  box-shadow: none;
}

.product-details {
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
}

.details-title {
  font-size: 1.8rem;
  margin-bottom: var(--galaxy-space-lg);
  color: var(--galaxy-starlight);
}

.details-content {
  color: var(--galaxy-cloud-gray);
  line-height: 1.6;
}

/* Loading and Error States */
.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: var(--galaxy-space-md);
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

@media (max-width: 768px) {
  .version-grid {
    grid-template-columns: 1fr;
  }
  
  .version-actions {
    flex-direction: column;
  }
}
</style> 