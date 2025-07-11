<template>
  <div class="stock-management">
    <div class="management-header">
      <h2 class="management-title">Stock Management</h2>
      <div class="header-actions">
        <button @click="refreshData" class="action-btn refresh" :disabled="loading">
          <span v-if="loading" class="loading-spinner">⟳</span>
          <span v-else>⟳</span>
          Refresh
        </button>
        <button @click="exportData" class="action-btn export">
          📊 Export
        </button>
        <button @click="closeModal" class="action-btn close">
          ✕ Close
        </button>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">Search:</label>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search products..." 
          class="filter-input"
        />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Status:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Category:</label>
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Sort by:</label>
        <select v-model="sortBy" class="filter-select">
          <option value="name">Name</option>
          <option value="stock">Stock Level</option>
          <option value="category">Category</option>
          <option value="updated_at">Last Updated</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="stock-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id" class="table-row">
            <td class="product-cell">
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-version" v-if="product.version">{{ product.version }}</div>
              </div>
            </td>
            <td class="category-cell">
              <span class="category-badge">{{ product.categoryName || 'Uncategorized' }}</span>
            </td>
            <td class="stock-cell">
              <div class="stock-display">
                <span class="stock-value">{{ product.stock }}</span>
                <span class="stock-unit">units</span>
              </div>
            </td>
            <td class="status-cell">
              <StockDisplay 
                :available-stock="product.available_stock" 
                :used-licenses="product.used_licenses"
                :expired-licenses="product.expired_licenses"
                :reserved-licenses="product.reserved_licenses"
                :total-licenses="product.total_licenses"
                :show-details="false"
                :product="product"
              />
            </td>
            <td class="updated-cell">
              {{ formatDate(product.updated_at) }}
            </td>
            <td class="actions-cell">
              <button @click="viewProduct(product)" class="action-btn icon-btn view" title="View">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-section" v-if="totalPages > 1">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredProducts.length }} products
      </div>
      <div class="pagination-controls">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Previous
        </button>
        <span class="page-info">{{ currentPage }} of {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>

    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-title">Total Products</div>
        <div class="summary-number">{{ filteredProducts.length }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-title">In Stock</div>
        <div class="summary-number in-stock">{{ inStockCount }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-title">Low Stock</div>
        <div class="summary-number low-stock">{{ lowStockCount }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-title">Out of Stock</div>
        <div class="summary-number out-of-stock">{{ outOfStockCount }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import StockDisplay from './StockDisplay.vue'

export default {
  name: 'StockManagement',
  components: {
    StockDisplay
  },
  props: {
    products: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      categoryFilter: '',
      sortBy: 'name',
      currentPage: 1,
      itemsPerPage: 20,
      editingProduct: null
    }
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products]
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          (product.version && product.version.toLowerCase().includes(query)) ||
          (product.categoryName && product.categoryName.toLowerCase().includes(query))
        )
      }
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(product => {
          const stock = product.available_stock || product.stock
          const threshold = product.min_stock_threshold || 5
          switch (this.statusFilter) {
            case 'in_stock':
              return stock > threshold
            case 'low_stock':
              return stock > 0 && stock <= threshold
            case 'out_of_stock':
              return stock === 0
            default:
              return true
          }
        })
      }
      
      // Category filter
      if (this.categoryFilter) {
        filtered = filtered.filter(product => product.category_id == this.categoryFilter)
      }
      
      // Sort
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'stock':
            return (b.available_stock || b.stock) - (a.available_stock || a.stock)
          case 'category':
            return (a.categoryName || '').localeCompare(b.categoryName || '')
          case 'updated_at':
            return new Date(b.updated_at) - new Date(a.updated_at)
          default:
            return 0
        }
      })
      
      return filtered
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.filteredProducts.length)
    },
    inStockCount() {
      return this.filteredProducts.filter(p => {
        const stock = p.available_stock || p.stock
        const threshold = p.min_stock_threshold || 5
        return stock > threshold
      }).length
    },
    lowStockCount() {
      return this.filteredProducts.filter(p => {
        const stock = p.available_stock || p.stock
        const threshold = p.min_stock_threshold || 5
        return stock > 0 && stock <= threshold
      }).length
    },
    outOfStockCount() {
      return this.filteredProducts.filter(p => {
        const stock = p.available_stock || p.stock
        return stock === 0
      }).length
    }
  },
  methods: {
    async updateStock(product) {
      try {
        // Validate stock value
        if (product.stock < 0) {
          this.$toast?.error('Stock cannot be negative')
          this.refreshData() // Revert the change
          return
        }

        const response = await $fetch('/api/admin/update-stock', {
          method: 'POST',
          body: {
            productId: product.id,
            stock: product.stock
          }
        })
        
        if (response.success) {
          this.$emit('stock-updated', product)
          // Show success message
          this.$toast?.success('Stock updated successfully')
        } else {
          throw new Error(response.message || 'Failed to update stock')
        }
      } catch (error) {
        console.error('Error updating stock:', error)
        
        // Show specific error message
        let errorMessage = 'Failed to update stock'
        if (error.message) {
          errorMessage = error.message
        } else if (error.data?.message) {
          errorMessage = error.data.message
        }
        
        this.$toast?.error(errorMessage)
        
        // Revert the change by refreshing data
        this.refreshData()
      }
    },
    editProduct(product) {
      this.$emit('edit-product', product)
    },
    viewProduct(product) {
      this.$emit('view-product', product)
    },
    refreshData() {
      this.$emit('refresh')
    },
    exportData() {
      const headers = ['Product', 'Version', 'Category', 'Stock', 'Status', 'Last Updated']
      const rows = this.filteredProducts.map(p => [
        p.name,
        p.version || '',
        p.categoryName || 'Uncategorized',
        p.stock,
        p.stock > 5 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock',
        this.formatDate(p.updated_at)
      ])
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock-management-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },
    closeModal() {
      this.$emit('close')
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    statusFilter() {
      this.currentPage = 1
    },
    categoryFilter() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.stock-management {
  background: var(--galaxy-deep-space);
  color: var(--galaxy-starlight);
  font-family: var(--galaxy-font-primary);
  min-height: 100vh;
  padding: var(--galaxy-space-md);
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-md);
  padding-bottom: var(--galaxy-space-sm);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.management-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: var(--galaxy-space-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  padding: 4px 12px;
  border: none;
  border-radius: var(--galaxy-radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  font-family: var(--galaxy-font-primary);
}

.action-btn.refresh {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.action-btn.refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.action-btn.export {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #00b894);
  color: var(--galaxy-deep-space);
}

.action-btn.export:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
}

.action-btn.close {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #e91e63);
  color: var(--galaxy-starlight);
}

.action-btn.close:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--galaxy-space-sm);
  margin-bottom: var(--galaxy-space-md);
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  background: rgba(30,32,60,0.7);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255,255,255,0.07);
  backdrop-filter: blur(6px);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--galaxy-cloud-gray);
}

.filter-input,
.filter-select {
  padding: 4px 8px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--galaxy-radius-sm);
  background: rgba(255,255,255,0.03);
  color: var(--galaxy-starlight);
  font-size: 13px;
  font-family: var(--galaxy-font-primary);
  transition: var(--galaxy-transition-fast);
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 10px rgba(77, 208, 225, 0.3);
}

.filter-input::placeholder {
  color: var(--galaxy-cloud-gray);
}

.table-container {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255,255,255,0.07);
  backdrop-filter: blur(6px);
  overflow: hidden;
  margin-bottom: var(--galaxy-space-md);
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.stock-table th {
  background: rgba(255,255,255,0.07);
  padding: 8px 6px;
  text-align: left;
  font-weight: 600;
  color: var(--galaxy-starlight);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  font-size: 13px;
}

.stock-table td {
  padding: 8px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: var(--galaxy-starlight);
  font-size: 13px;
}

.table-row:hover {
  background: rgba(255,255,255,0.03);
}

.product-cell { min-width: 120px; }
.product-info { gap: 0; }
.product-name { font-weight: 600; }
.product-version { font-size: 11px; color: var(--galaxy-cloud-gray); }

.category-cell { min-width: 80px; }
.category-badge {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: var(--galaxy-radius-sm);
}

.stock-cell { min-width: 80px; }
.stock-display { gap: 2px; }
.stock-value { font-size: 13px; font-weight: 600; }
.stock-unit { font-size: 11px; color: var(--galaxy-cloud-gray); }

.status-cell { min-width: 70px; }
.updated-cell { min-width: 90px; font-size: 11px; }
.actions-cell { min-width: 80px; }
.actions-cell .action-btn {
  padding: 2px 6px;
  font-size: 15px;
  margin-right: 2px;
  background: none;
  border: none;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.actions-cell .action-btn:last-child { margin-right: 0; }
.actions-cell .icon-btn.view i { color: var(--galaxy-aurora-cyan); }
.actions-cell .icon-btn.view:hover i { color: #00b894; }
.actions-cell .action-btn:focus { outline: none; }

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-md);
  padding: var(--galaxy-space-xs) var(--galaxy-space-md);
  background: rgba(30,32,60,0.7);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255,255,255,0.07);
  backdrop-filter: blur(6px);
}

.pagination-info, .page-info { font-size: 12px; }
.pagination-controls { gap: 4px; }
.pagination-btn { padding: 2px 10px; font-size: 12px; }

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--galaxy-space-sm);
  margin-top: var(--galaxy-space-md);
}

.summary-card {
  padding: var(--galaxy-space-md);
  background: rgba(30,32,60,0.7);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255,255,255,0.07);
  backdrop-filter: blur(6px);
  text-align: center;
  transition: var(--galaxy-transition-normal);
}

.summary-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--galaxy-cloud-gray);
  margin-bottom: 2px;
}

.summary-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
}
.summary-number.in-stock { color: var(--galaxy-comet-green); }
.summary-number.low-stock { color: var(--galaxy-solar-yellow); }
.summary-number.out-of-stock { color: var(--galaxy-pulsar-pink); }

/* Responsive Design */
@media (max-width: 1024px) {
  .stock-management { padding: var(--galaxy-space-sm); }
  .management-header { flex-direction: column; gap: var(--galaxy-space-sm); align-items: flex-start; }
  .header-actions { width: 100%; justify-content: flex-end; }
  .filters-section { grid-template-columns: 1fr; }
  .table-container { overflow-x: auto; }
  .stock-table { min-width: 600px; }
  .pagination-section { flex-direction: column; gap: 2px; }
}
@media (max-width: 768px) {
  .management-title { font-size: 1.1rem; }
  .summary-section { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .summary-section { grid-template-columns: 1fr; }
  .stock-table th, .stock-table td { padding: 4px; }
}
</style> 