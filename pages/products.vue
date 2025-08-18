<template>
  <div class="products-page">
    <div class="page-header">
      <h1 class="page-title galaxy-gradient-text">All Products</h1>
      <p class="page-subtitle">Browse our complete collection of software solutions.</p>
    </div>


    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>Loading Products...</p>
    </div>
    <div v-else-if="error" class="state-container">
      <p class="error-text">&#10060; {{ error }}</p>
    </div>
    <div v-else-if="filteredProducts.length === 0" class="state-container">
        <p>No products found.</p>
    </div>
    <div v-else class="products-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '~/components/ProductCard.vue';


definePageMeta({
  middleware: 'user-only'
});

const allProducts = ref([]);
const isLoading = ref(true);
const error = ref(null);


const filteredProducts = allProducts;

const fetchAllProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const productsResponse = await $fetch('/api/products');
    
    console.log('Products response:', productsResponse);
    
    allProducts.value = productsResponse.products || [];
    
  } catch (err) {
    error.value = 'Failed to load products. Please try again later.';
    console.error('Error fetching products:', err);
  } finally {
    isLoading.value = false;
  }
};


useHead({
  title: 'Products'
});

onMounted(fetchAllProducts);
</script>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: var(--galaxy-space-2xl) auto;
  padding: var(--galaxy-space-md);
  font-family: var(--galaxy-font-primary);
  color: var(--galaxy-starlight);
}

.page-header {
  text-align: center;
  margin-bottom: var(--galaxy-space-xl);
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--galaxy-space-sm);
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--galaxy-cloud-gray);
  max-width: 600px;
  margin: 0 auto;
}


.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  gap: var(--galaxy-space-md);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--galaxy-asteroid-gray);
  border-left-color: var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-full);
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-text {
  font-size: 1.2rem;
  color: var(--galaxy-pulsar-pink);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--galaxy-space-xl);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .products-page {
    padding: var(--galaxy-space-sm);
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 