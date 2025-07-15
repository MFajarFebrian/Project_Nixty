<template>
  <div class="stock-overview">
    <div class="overview-header">
      <h3 class="overview-title">Stock Overview</h3>
      <div class="last-updated">
        Last updated: {{ lastUpdated }}
      </div>
    </div>

    <div class="overview-grid">
      <div class="overview-card total">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <div class="card-number">{{ totalProducts }}</div>
          <div class="card-label">Total Products</div>
        </div>
      </div>

      <div class="overview-card in-stock">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <div class="card-number">{{ inStockCount }}</div>
          <div class="card-label">In Stock</div>
          <div class="card-subtitle">{{ inStockPercentage }}%</div>
        </div>
      </div>

      <div class="overview-card low-stock">
        <div class="card-icon">⚠️</div>
        <div class="card-content">
          <div class="card-number">{{ lowStockCount }}</div>
          <div class="card-label">Low Stock</div>
          <div class="card-subtitle">{{ lowStockPercentage }}%</div>
        </div>
      </div>

      <div class="overview-card out-of-stock">
        <div class="card-icon">❌</div>
        <div class="card-content">
          <div class="card-number">{{ outOfStockCount }}</div>
          <div class="card-label">Out of Stock</div>
          <div class="card-subtitle">{{ outOfStockPercentage }}%</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <button @click="refreshData" class="action-btn refresh" :disabled="loading" title="Refresh Data">
        <span v-if="loading" class="loading-spinner">⟳</span>
        <span v-else>⟳</span>
      </button>
      <button @click="exportStockReport" class="action-btn export" title="Export Report">
        📊
      </button>
      <button @click="viewStockManagement" class="action-btn manage" title="Manage">
        🛠️
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockOverview',
  props: {
    products: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    totalProducts() {
      return this.products.length
    },
    inStockCount() {
      return this.products.filter(p => {
        const stock = p.available_stock !== undefined ? p.available_stock : p.stock;
        const threshold = p.min_stock_threshold || 5;
        return stock > threshold;
      }).length;
    },
    lowStockCount() {
      return this.products.filter(p => {
        const stock = p.available_stock !== undefined ? p.available_stock : p.stock;
        const threshold = p.min_stock_threshold || 5;
        return stock > 0 && stock <= threshold;
      }).length;
    },
    outOfStockCount() {
      return this.products.filter(p => {
        const stock = p.available_stock !== undefined ? p.available_stock : p.stock;
        return stock === 0;
      }).length;
    },
    inStockPercentage() {
      return this.totalProducts > 0 ? Math.round((this.inStockCount / this.totalProducts) * 100) : 0
    },
    lowStockPercentage() {
      return this.totalProducts > 0 ? Math.round((this.lowStockCount / this.totalProducts) * 100) : 0
    },
    outOfStockPercentage() {
      return this.totalProducts > 0 ? Math.round((this.outOfStockCount / this.totalProducts) * 100) : 0
    },
    lastUpdated() {
      return new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  methods: {
    refreshData() {
      this.$emit('refresh')
    },
    exportStockReport() {
      // Create CSV content
      const headers = ['Product', 'Version', 'Category', 'Stock', 'Sold', 'Status']
      const rows = this.products.map(p => [
        p.name,
        p.version || '',
        p.categoryName || '',
        p.stock,
        p.soldCount,
        p.status
      ])
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },
    viewStockManagement() {
      this.$emit('view-management')
    },
    viewProduct(productId) {
      this.$emit('view-product', productId)
    }
  }
}
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.stock-overview {
  background: var(--galaxy-card-gradient);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-xl);
  box-shadow: var(--galaxy-shadow-medium), var(--galaxy-glow-blue);
  font-family: var(--galaxy-font-primary);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-xl);
}

.overview-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin: 0;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.last-updated {
  font-size: 12px;
  color: var(--galaxy-cloud-gray);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--galaxy-space-lg);
  margin-bottom: var(--galaxy-space-xl);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-lg);
  padding: var(--galaxy-space-xl);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  transition: var(--galaxy-transition-normal);
  backdrop-filter: blur(10px);
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--galaxy-shadow-large);
}

.overview-card.total {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.1));
  border-color: rgba(102, 126, 234, 0.3);
  color: var(--galaxy-starlight);
}

.overview-card.total:hover {
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(102, 126, 234, 0.3);
}

.overview-card.in-stock {
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.2), rgba(5, 150, 105, 0.1));
  border-color: rgba(100, 255, 218, 0.3);
  color: var(--galaxy-starlight);
}

.overview-card.in-stock:hover {
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(100, 255, 218, 0.3);
}

.overview-card.low-stock {
  background: linear-gradient(135deg, rgba(255, 235, 59, 0.2), rgba(217, 119, 6, 0.1));
  border-color: rgba(255, 235, 59, 0.3);
  color: var(--galaxy-starlight);
}

.overview-card.low-stock:hover {
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(255, 235, 59, 0.3);
}

.overview-card.out-of-stock {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--galaxy-starlight);
}

.overview-card.out-of-stock:hover {
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(239, 68, 68, 0.3);
}

.card-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--galaxy-radius-lg);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--galaxy-space-xs);
  color: var(--galaxy-starlight);
}

.card-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--galaxy-space-xs);
  color: var(--galaxy-starlight);
}

.card-subtitle {
  font-size: 12px;
  opacity: 0.8;
  color: var(--galaxy-cloud-gray);
}

.quick-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border: none;
  border-radius: var(--galaxy-radius-md);
  font-size: 14px;
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

.action-btn.manage {
  background: linear-gradient(135deg, var(--galaxy-solar-yellow), #f39c12);
  color: var(--galaxy-deep-space);
}

.action-btn.manage:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 235, 59, 0.3);
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

/* Responsive Design */
@media (max-width: 768px) {
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--galaxy-space-sm);
  }
  
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .overview-card {
    flex-direction: column;
    text-align: center;
    gap: var(--galaxy-space-md);
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .card-number {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style> 