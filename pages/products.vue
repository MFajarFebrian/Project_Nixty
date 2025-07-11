<template>
  <div class="products-page">
    <div class="page-header">
      <h1 class="page-title galaxy-gradient-text">All Products</h1>
      <p class="page-subtitle">Browse our complete collection of software solutions.</p>
    </div>

    <!-- Filters Section (optional placeholder) -->
    <div class="filters-container">
      <input type="text" placeholder="Search products..." class="search-input" v-model="searchQuery" />
      <!-- Add more filters like category dropdowns here if needed -->
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import ProductCard from '~/components/ProductCard.vue';

const route = useRoute();
const allProducts = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('');

// Get category from URL parameter
const categoryFromUrl = computed(() => route.query.category || '');

const fetchAllProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Fetch products and categories
    const [productsResponse, categoriesResponse] = await Promise.all([
      $fetch('/api/products'),
      $fetch('/api/categories')
    ]);
    
    allProducts.value = productsResponse.data || [];
    categories.value = categoriesResponse.data || [];
    
    // Set selected category from URL
    selectedCategory.value = categoryFromUrl.value;
    
  } catch (err) {
    error.value = 'Failed to load products. Please try again later.';
    console.error('Error fetching products:', err);
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  let filtered = allProducts.value;
  
  // Filter by category
  if (selectedCategory.value) {
    const selectedCat = categories.value.find(cat => cat.slug === selectedCategory.value);
    if (selectedCat) {
      filtered = filtered.filter(product => product.category_id === selectedCat.id);
    }
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const versionMatch = product.version?.toLowerCase().includes(searchTerm);
      return nameMatch || versionMatch;
    });
  }
  
  return filtered;
});

// Watch for URL parameter changes
watch(categoryFromUrl, (newCategory) => {
  selectedCategory.value = newCategory;
});

const clearCategoryFilter = () => {
  selectedCategory.value = '';
  // Update URL without category parameter
  navigateTo('/products');
};

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

.filters-container {
    display: flex;
    justify-content: center;
    margin-bottom: var(--galaxy-space-xl);
}

.search-input {
    width: 100%;
    max-width: 500px;
    padding: var(--galaxy-space-md);
    background-color: var(--galaxy-dark-matter);
    border: 1px solid var(--galaxy-asteroid-gray);
    border-radius: var(--galaxy-radius-md);
    color: var(--galaxy-starlight);
    font-size: 1rem;
    transition: var(--galaxy-transition-normal);
}
.search-input:focus {
    outline: none;
    border-color: var(--galaxy-aurora-cyan);
    box-shadow: var(--galaxy-glow-cyan);
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
    .products-grid {
        grid-template-columns: 1fr;
    }
}
</style> 