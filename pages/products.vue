<template>
  <div class="products-page">
    <div class="page-header">
      <h1 class="page-title galaxy-gradient-text">All Products</h1>
      <p class="page-subtitle">Browse our complete collection of software solutions.</p>
    </div>

    <!-- Filters Section -->
    <div class="filters-container">
      <div class="filters-wrapper">
        <!-- Search Input -->
        <div class="filter-group">
          <label class="filter-label">Search</label>
          <input 
            type="text" 
            placeholder="Search products..." 
            class="search-input" 
            v-model="searchQuery" 
          />
        </div>

        <!-- Category Filter -->
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select class="filter-select" v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.slug">
              {{ category.name }}
            </option>
          </select>
        </div>


        <!-- Sort By Filter -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select class="filter-select" v-model="sortBy">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <!-- Clear Filters Button -->
        <div class="filter-group">
          <button class="clear-filters-btn" @click="clearFilters">
            <i class="fas fa-times"></i>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="active-filters-label">Active Filters:</span>
        <div class="filter-tags">
          <span v-if="searchQuery" class="filter-tag">
            Search: "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="remove-tag">×</button>
          </span>
          <span v-if="selectedCategory" class="filter-tag">
            Category: {{ getCategoryName(selectedCategory) }}
            <button @click="selectedCategory = ''" class="remove-tag">×</button>
          </span>
          <span v-if="sortBy !== 'name-asc'" class="filter-tag">
            Sort: {{ formatSortBy(sortBy) }}
            <button @click="sortBy = 'name-asc'" class="remove-tag">×</button>
          </span>
        </div>
      </div>
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
const sortBy = ref('name-asc');

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
    
    console.log('Products response:', productsResponse);
    console.log('Categories response:', categoriesResponse);
    
    allProducts.value = productsResponse.data || [];
    
    // Handle different response formats
    if (categoriesResponse.data) {
      categories.value = categoriesResponse.data;
    } else if (Array.isArray(categoriesResponse)) {
      categories.value = categoriesResponse;
    } else {
      categories.value = [];
    }
    
    console.log('Categories loaded:', categories.value);
    console.log('Categories length:', categories.value.length);
    
    // Set selected category from URL
    selectedCategory.value = categoryFromUrl.value;
    
  } catch (err) {
    error.value = 'Failed to load products. Please try again later.';
    console.error('Error fetching products:', err);
  } finally {
    isLoading.value = false;
  }
};


watch([allProducts, categories], () => {
  if (allProducts.value.length) {
    allProducts.value.forEach(product => {
      // Use the category slug already returned from the API
      product.slug = product.category || '';
    });
    // Debug: log the first product to see its structure
    console.log('Sample product after slug assignment:', allProducts.value[0]);
  }
}, { immediate: true, deep: true });

const filteredProducts = computed(() => {
  let filtered = [...allProducts.value];
  
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
      const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
      return nameMatch || versionMatch || descriptionMatch;
    });
  }
  
  
  // Sort products
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'oldest':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      default:
        return 0;
    }
  });
  
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

// Helper functions
const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  sortBy.value = 'name-asc';
  navigateTo('/products');
};

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || sortBy.value !== 'name-asc';
});

const getCategoryName = (slug) => {
  const category = categories.value.find(cat => cat.slug === slug);
  return category ? category.name : slug;
};


const formatSortBy = (sort) => {
  const sortLabels = {
    'name-asc': 'Name (A-Z)',
    'name-desc': 'Name (Z-A)',
    'price-asc': 'Price (Low to High)',
    'price-desc': 'Price (High to Low)',
    'newest': 'Newest First',
    'oldest': 'Oldest First'
  };
  return sortLabels[sort] || sort;
};

// Set page title
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

.filters-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto var(--galaxy-space-xl) auto;
  padding: var(--galaxy-space-lg);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  backdrop-filter: blur(10px);
}

.filters-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--galaxy-space-md);
  margin-bottom: var(--galaxy-space-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin-bottom: 0.25rem;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  font-size: 1rem;
  transition: var(--galaxy-transition-normal);
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 3px rgba(77, 208, 225, 0.2);
}

.filter-select {
  cursor: pointer;
}

.filter-select option {
  background: var(--galaxy-dark-matter, #1a1a2e);
  color: var(--galaxy-starlight);
}

.clear-filters-btn {
  align-self: end;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-cloud-gray);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--galaxy-transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-filters-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--galaxy-aurora-cyan);
  color: var(--galaxy-starlight);
}

/* Active Filters */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--galaxy-space-sm);
  padding-top: var(--galaxy-space-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.active-filters-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--galaxy-aurora-cyan);
  margin-right: var(--galaxy-space-sm);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(77, 208, 225, 0.1);
  border: 1px solid rgba(77, 208, 225, 0.3);
  border-radius: var(--galaxy-radius-full);
  color: var(--galaxy-aurora-cyan);
  font-size: 0.85rem;
  font-weight: 500;
}

.remove-tag {
  background: none;
  border: none;
  color: var(--galaxy-aurora-cyan);
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0;
  margin-left: 0.25rem;
  transition: var(--galaxy-transition-fast);
}

.remove-tag:hover {
  color: var(--galaxy-starlight);
  transform: scale(1.1);
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
@media (max-width: 768px) {
  .filters-wrapper {
    grid-template-columns: 1fr;
  }
  
  .clear-filters-btn {
    align-self: stretch;
    margin-top: 1rem;
  }
  
  .filter-tags {
    justify-content: center;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .active-filters-label {
    margin-right: 0;
  }
}

@media (max-width: 600px) {
  .products-page {
    padding: var(--galaxy-space-sm);
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .filters-container {
    padding: var(--galaxy-space-md);
  }
  
  .filters-wrapper {
    gap: var(--galaxy-space-sm);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 