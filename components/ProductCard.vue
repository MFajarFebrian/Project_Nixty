<template>
  <div class="product-card" :class="{ 'out-of-stock': isOutOfStock }">
    <!-- Product Image Section -->
    <div class="product-image-wrapper">
       <img 
        :src="imageUrl" 
        :alt="product.name" 
        class="product-image" 
        loading="lazy"
        @error="onImageError"
      />
      
      <!-- Overlays and Badges -->
      <div class="product-badges">
        <!-- Simplified badges - no complex features from old schema -->
        <span v-if="product.status === 'active'" class="badge active-badge">ACTIVE</span>
        <span v-if="isOutOfStock" class="badge out-of-stock-badge">OUT OF STOCK</span>
      </div>
      
    </div>

    <!-- Product Info Section -->
    <div class="product-info">
      <h3 class="product-title" :title="fullProductName">{{ fullProductName }}</h3>
      
      <div class="product-meta">
        <span v-if="product.category_name || product.category" class="product-category">{{ product.category_name || product.category }}</span>
        <span v-if="product.version" class="product-version">v{{ product.version }}</span>
      </div>
      
      <!-- Price Section -->
      <div class="product-pricing">
        <div class="price-container">
          <span v-if="product.discount_percentage" 
                class="original-price">{{ formatCurrency(product.price) }}</span>
          <span class="current-price">{{ formatCurrency(product.discount_price || product.price) }}</span>
        </div>
        
        <!-- Checkout Button -->
        <button class="checkout-button" @click="goToCheckout" title="Add to Cart" :disabled="isOutOfStock">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      price: 0,
      image_url: ''
    })
  }
});

const imageUrl = ref(getValidImageUrl(props.product.image_url));
const router = useRouter();

// Function to get a valid image URL or fallback
function getValidImageUrl(url) {
  if (!url) return '/placeholder-grey.svg';
  
  // If it's a local upload path that might not work on Vercel, use placeholder
  if (url.startsWith('/uploads/admin/')) {
    console.warn('Local upload detected, using placeholder:', url);
    return '/placeholder-grey.svg';
  }
  
  // Allow Vercel Blob URLs
  if (url.includes('vercel-storage.com') || url.startsWith('https://')) {
    return url;
  }
  
  return url;
}

const onImageError = () => {
  console.warn('Image failed to load:', imageUrl.value);
  imageUrl.value = '/placeholder-grey.svg';
};

const fullProductName = computed(() => {
  return props.product.name + (props.product.version ? ` ${props.product.version}` : '');
});

const isOutOfStock = computed(() => {
  return props.product.status === 'out_of_stock' || props.product.available_stock === 0;
});

const goToCheckout = () => {
  // Prevent checkout if product is out of stock
  if (isOutOfStock.value) {
    console.warn('Cannot checkout out of stock product');
    return;
  }
  
  console.log('ProductCard clicked! Product data:', props.product);
  console.log('Category slug:', props.product.category_slug);
  console.log('Product ID:', props.product.id);
  
  if (props.product.id) {
    // Prefer to use category_slug if available, fall back to slug if needed
    const slug = props.product.category_slug || props.product.slug || '';
    const url = `/checkout?slug=${slug}&productId=${props.product.id}`;
    console.log('Navigating to:', url);
    router.push(url);
  } else {
    console.error('Missing ID for product:', props.product);
  }
};

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--galaxy-radius-lg, 12px);
  overflow: hidden;
  background: var(--galaxy-card-gradient, linear-gradient(145deg, #16213e, #1a1a2e));
  border: 1px solid var(--galaxy-asteroid-gray, #2c2c54);
  box-shadow: var(--galaxy-shadow-medium, 0 4px 16px rgba(0,0,0,0.4));
  transition: all var(--galaxy-transition-normal, 0.3s ease);
  height: 100%;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), var(--galaxy-glow-cyan, 0 0 20px rgba(77,208,225,0.3));
  border-color: var(--galaxy-aurora-cyan, #4dd0e1);
}

.product-image-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
  background-color: var(--galaxy-dark-matter, #1a1a2e);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--galaxy-transition-slow, 0.5s ease);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}


.product-badges {
  position: absolute;
  top: var(--galaxy-space-md, 1rem);
  left: var(--galaxy-space-md, 1rem);
  z-index: 2;
  display: flex;
  gap: var(--galaxy-space-sm, 0.5rem);
}

.badge {
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: var(--galaxy-radius-full, 50px);
  color: var(--galaxy-starlight, #e8f4f8);
}

.new-badge {
  background: var(--galaxy-primary-gradient, linear-gradient(135deg, #1976d2, #42a5f5));
}

.discount-badge {
  background: var(--galaxy-pulsar-pink, #ff6b9d);
}

.active-badge {
  background: var(--galaxy-stellar-green, #4caf50);
}

.out-of-stock-badge {
  background: var(--galaxy-cloud-gray, #666);
  color: var(--galaxy-starlight, #fff);
}

.product-info {
  padding: var(--galaxy-space-md, 1rem);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--galaxy-starlight, #e8f4f8);
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--galaxy-space-sm, 0.5rem);
  line-height: 1.3;
  height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  gap: var(--galaxy-space-sm, 0.5rem);
  margin-bottom: var(--galaxy-space-md, 1rem);
}

.product-category, .product-version {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--galaxy-radius-full, 50px);
  background: var(--galaxy-asteroid-gray, #2c2c54);
  color: var(--galaxy-cloud-gray, #b8b8d4);
}

.product-pricing {
  margin-top: auto;
  padding-top: var(--galaxy-space-sm, 0.5rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.original-price {
  font-size: 0.8rem;
  text-decoration: line-through;
  color: var(--galaxy-cloud-gray, #b8b8d4);
  opacity: 0.7;
}

.current-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--galaxy-aurora-cyan, #4dd0e1);
}

.checkout-button {
  width: 40px;
  height: 40px;
  background: var(--galaxy-primary-gradient, linear-gradient(135deg, #1976d2, #42a5f5));
  border: none;
  border-radius: 8px;
  color: var(--galaxy-starlight, #e8f4f8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--galaxy-transition-fast, 0.2s ease);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
  flex-shrink: 0;
}

.checkout-button:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.5);
  background: linear-gradient(135deg, #1565c0, #2196f3);
}

.checkout-button:active {
  transform: scale(0.95);
}

.checkout-button:disabled {
  background: var(--galaxy-cloud-gray, #666) !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.checkout-button:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Out of Stock Styling */
.product-card.out-of-stock {
  opacity: 0.6;
  filter: grayscale(100%);
}

.product-card.out-of-stock .product-image {
  filter: grayscale(100%) brightness(0.8);
}

.product-card.out-of-stock .product-title,
.product-card.out-of-stock .current-price,
.product-card.out-of-stock .original-price {
  color: var(--galaxy-cloud-gray, #888) !important;
}

.product-card.out-of-stock:hover {
  transform: none;
  box-shadow: var(--galaxy-shadow-medium, 0 4px 16px rgba(0,0,0,0.4));
  border-color: var(--galaxy-asteroid-gray, #2c2c54);
}
</style>
