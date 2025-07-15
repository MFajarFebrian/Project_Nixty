<template>
  <div class="search-results-page">
    <!-- Search Header -->
    <div class="search-header galaxy-card">
      <h1>Search Results</h1>
      <div class="search-info">
        <p v-if="searchQuery">
          Showing results for "{{ searchQuery }}"
          <span v-if="selectedType !== 'all'">in {{ selectedType }}</span>
        </p>
        <div class="search-filters">
          <button 
            v-for="type in ['all', 'Product', 'Deal', 'News']" 
            :key="type"
            :class="['filter-btn', { active: selectedType === type }]"
            @click="filterResults(type)"
          >
            <i :class="getFilterIcon(type)"></i>
            {{ type }}
            <span v-if="getResultCount(type)" class="count">({{ getResultCount(type) }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state galaxy-card">
      <div class="loading-spinner"></div>
      <p>Searching...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state galaxy-card">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button class="galaxy-button-primary" @click="performSearch">Try Again</button>
    </div>

    <!-- Results -->
    <div v-else-if="filteredResults.length > 0" class="search-results">
      <!-- Products -->
      <div v-if="hasResults('Product')" class="results-section">
        <h2 v-if="selectedType === 'all'">Products</h2>
        <div class="results-grid">
          <div 
            v-for="result in getResultsByType('Product')" 
            :key="result.id"
            class="result-card product-card galaxy-card"
            @click="navigateToProduct(result)"
          >
            <div class="result-content">
              <h3>{{ result.name }}</h3>
              <p v-if="result.category" class="category">{{ result.category }}</p>
              <p class="description">{{ result.description }}</p>
              <div class="price" v-if="result.price">{{ result.price }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Deals -->
      <div v-if="hasResults('Deal')" class="results-section">
        <h2 v-if="selectedType === 'all'">Deals</h2>
        <div class="results-grid">
          <div 
            v-for="result in getResultsByType('Deal')" 
            :key="result.id"
            class="result-card deal-card galaxy-card"
            @click="navigateToDeal(result)"
          >
            <div class="result-content">
              <h3>{{ result.title }}</h3>
              <p v-if="result.productName" class="product-name">{{ result.productName }}</p>
              <p class="description">{{ result.description }}</p>
              <div class="price-info">
                <span class="new-price">{{ result.price }}</span>
                <span v-if="result.oldPrice" class="old-price">{{ result.oldPrice }}</span>
                <span v-if="result.discount" class="discount">{{ result.discount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- News -->
      <div v-if="hasResults('News')" class="results-section">
        <h2 v-if="selectedType === 'all'">News</h2>
        <div class="results-grid">
          <div 
            v-for="result in getResultsByType('News')" 
            :key="result.id"
            class="result-card news-card galaxy-card"
            @click="navigateToNews(result)"
          >
            <div class="result-content">
              <div class="news-header">
                <h3>{{ result.title }}</h3>
                <span v-if="result.isNew" class="new-badge">New</span>
              </div>
              <p class="date">{{ result.date }}</p>
              <p class="content">{{ result.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results galaxy-card">
      <i class="fas fa-search"></i>
      <h3>No results found</h3>
      <p>Try different keywords or filters</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// State
const searchQuery = ref('');
const selectedType = ref('all');
const results = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Computed
const filteredResults = computed(() => {
  if (selectedType.value === 'all') {
    return results.value;
  }
  return results.value.filter(result => result.type === selectedType.value);
});

// Methods
const getFilterIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'product':
      return 'fas fa-box';
    case 'deal':
      return 'fas fa-tags';
    case 'news':
      return 'fas fa-newspaper';
    default:
      return 'fas fa-search';
  }
};

const getResultCount = (type) => {
  if (type === 'all') {
    return results.value.length;
  }
  return results.value.filter(result => result.type === type).length;
};

const hasResults = (type) => {
  return getResultCount(type) > 0 && (selectedType.value === 'all' || selectedType.value === type);
};

const getResultsByType = (type) => {
  return results.value.filter(result => result.type === type);
};

const filterResults = (type) => {
  selectedType.value = type;
  // Update URL without triggering a new search
  router.replace({
    query: { ...route.query, type }
  });
};

const navigateToProduct = (product) => {
  router.push(`/product/${product.slug}`);
};

const navigateToDeal = (deal) => {
  router.push(`/deals/${deal.id}`);
};

const navigateToNews = (news) => {
  router.push(`/news/${news.id}`);
};

const performSearch = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch('/api/search', {
      params: {
        q: searchQuery.value,
        type: selectedType.value,
        limit: 50 // Show more results on the search page
      }
    });

    if (response.success) {
      results.value = response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch search results');
    }
  } catch (e) {
    error.value = e.message;
    console.error('Search error:', e);
  } finally {
    isLoading.value = false;
  }
};

// Watch route changes
watch(() => route.query, (newQuery) => {
  searchQuery.value = newQuery.q || '';
  selectedType.value = newQuery.type || 'all';
  if (searchQuery.value) {
    performSearch();
  }
}, { immediate: true });
</script>

<style scoped>
.search-results-page {
  padding: var(--galaxy-space-lg, 2rem);
  min-height: calc(100vh - var(--header-height, 80px));
  background: var(--galaxy-background, #0a0a1f);
}

.search-header {
  margin-bottom: var(--galaxy-space-lg, 2rem);
  padding: var(--galaxy-space-lg, 2rem);
}

.search-header h1 {
  color: var(--galaxy-starlight, #e8f4f8);
  margin-bottom: var(--galaxy-space-md, 1rem);
}

.search-info {
  color: var(--galaxy-cloud-gray, #b8b8d4);
}

.search-filters {
  display: flex;
  gap: var(--galaxy-space-md, 1rem);
  margin-top: var(--galaxy-space-md, 1rem);
}

.filter-btn {
  background: var(--galaxy-asteroid-gray, #2c2c54);
  border: 1px solid var(--galaxy-asteroid-gray, #2c2c54);
  color: var(--galaxy-cloud-gray, #b8b8d4);
  padding: 0.5rem 1rem;
  border-radius: var(--galaxy-radius-md, 8px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn.active {
  background: var(--galaxy-primary-gradient, linear-gradient(135deg, #1976d2, #42a5f5));
  border-color: var(--galaxy-aurora-cyan, #4dd0e1);
  color: var(--galaxy-starlight, #e8f4f8);
  box-shadow: var(--galaxy-glow-cyan, 0 0 20px rgba(77,208,225,0.3));
}

.filter-btn:hover:not(.active) {
  border-color: var(--galaxy-aurora-cyan, #4dd0e1);
  background: var(--galaxy-dark-matter, #1a1a2e);
}

.count {
  font-size: 0.8em;
  opacity: 0.8;
}

.results-section {
  margin-bottom: var(--galaxy-space-xl, 3rem);
}

.results-section h2 {
  color: var(--galaxy-starlight, #e8f4f8);
  margin-bottom: var(--galaxy-space-md, 1rem);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--galaxy-space-md, 1rem);
}

.result-card {
  padding: var(--galaxy-space-md, 1rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), var(--galaxy-glow-cyan, 0 0 20px rgba(77,208,225,0.3));
  border-color: var(--galaxy-aurora-cyan, #4dd0e1);
}

.result-content h3 {
  color: var(--galaxy-starlight, #e8f4f8);
  margin-bottom: var(--galaxy-space-sm, 0.5rem);
}

.category, .product-name {
  color: var(--galaxy-cloud-gray, #b8b8d4);
  font-size: 0.9em;
  margin-bottom: var(--galaxy-space-sm, 0.5rem);
}

.description, .content {
  color: var(--galaxy-cloud-gray, #b8b8d4);
  margin-bottom: var(--galaxy-space-md, 1rem);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price, .new-price {
  color: var(--galaxy-aurora-cyan, #4dd0e1);
  font-weight: bold;
  font-size: 1.1em;
}

.old-price {
  color: var(--galaxy-cloud-gray, #b8b8d4);
  text-decoration: line-through;
  margin-left: var(--galaxy-space-sm, 0.5rem);
}

.discount {
  background: var(--galaxy-pulsar-pink, #ff6b9d);
  color: var(--galaxy-starlight, #e8f4f8);
  padding: 0.2rem 0.5rem;
  border-radius: var(--galaxy-radius-full, 50px);
  font-size: 0.8em;
  margin-left: var(--galaxy-space-sm, 0.5rem);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-sm, 0.5rem);
}

.new-badge {
  background: var(--galaxy-primary-gradient, linear-gradient(135deg, #1976d2, #42a5f5));
  color: var(--galaxy-starlight, #e8f4f8);
  padding: 0.2rem 0.5rem;
  border-radius: var(--galaxy-radius-full, 50px);
  font-size: 0.8em;
}

.date {
  color: var(--galaxy-cloud-gray, #b8b8d4);
  font-size: 0.9em;
  margin-bottom: var(--galaxy-space-sm, 0.5rem);
}

.loading-state, .error-state, .no-results {
  text-align: center;
  padding: var(--galaxy-space-xl, 3rem);
  color: var(--galaxy-cloud-gray, #b8b8d4);
}

.loading-spinner {
  border: 4px solid var(--galaxy-asteroid-gray, #2c2c54);
  border-top: 4px solid var(--galaxy-aurora-cyan, #4dd0e1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--galaxy-space-md, 1rem);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state i, .no-results i {
  font-size: 3rem;
  color: var(--galaxy-pulsar-pink, #ff6b9d);
  margin-bottom: var(--galaxy-space-md, 1rem);
}
</style> 