<template>
  <NuxtLink :to="`/product/${product.id}`" class="product-card">
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
        <span v-if="product.is_new" class="badge new-badge">NEW</span>
        <span v-if="product.discount_percentage" class="badge discount-badge">
          {{ product.discount_percentage }}% OFF
        </span>
      </div>
      <div class="product-overlay">
        <span class="btn quick-view-btn">View Details</span>
      </div>
    </div>

    <!-- Product Info Section -->
    <div class="product-info">
      <h3 class="product-title" :title="fullProductName">{{ fullProductName }}</h3>
      
      <div class="product-meta">
        <span v-if="product.category" class="product-category">{{ product.category }}</span>
        <span v-if="product.version" class="product-version">v{{ product.version }}</span>
      </div>
      
      <!-- Price Section -->
      <div class="product-pricing">
        <div class="price-container">
          <span v-if="product.original_price && product.original_price > product.price" 
                class="original-price">{{ formatCurrency(product.original_price) }}</span>
          <span class="current-price">{{ formatCurrency(product.price) }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
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

const imageUrl = ref(props.product.image_url || '/placeholder-grey.svg');
const router = useRouter();

const onImageError = () => {
  imageUrl.value = '/placeholder-grey.svg';
};

const fullProductName = computed(() => {
  return props.product.name + (props.product.version ? ` ${props.product.version}` : '');
});

const goToCheckout = () => {
  if (props.product.slug && props.product.id) {
    router.push(`/checkout?slug=${props.product.slug}&productId=${props.product.id}`);
  }
};

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

</script>

<style scoped>
// ... existing code ...
</style>