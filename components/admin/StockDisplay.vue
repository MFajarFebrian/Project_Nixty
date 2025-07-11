<template>
  <div class="stock-display">
    <div class="stock-info">
      <div class="stock-badge" :class="stockStatusClass">
        <span class="stock-number">{{ availableStock }}</span>
        <span class="stock-label">in stock</span>
      </div>
      
      <div v-if="showDetails" class="stock-details">
        <div class="stock-item">
          <span class="label">Available:</span>
          <span class="value">{{ availableStock }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Used:</span>
          <span class="value">{{ usedLicenses }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Reserved:</span>
          <span class="value">{{ reservedLicenses }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Total:</span>
          <span class="value">{{ totalLicenses }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="lowStock" class="low-stock-warning">
      <span class="warning-icon">⚠️</span>
      <span class="warning-text">Low stock</span>
    </div>
    
    <div v-if="outOfStock" class="out-of-stock-warning">
      <span class="warning-icon">❌</span>
      <span class="warning-text">Out of stock</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockDisplay',
  props: {
    // Untuk kompatibilitas dengan kode lama
    stock: {
      type: Number,
      default: 0
    },
    // Data baru dari product_stock_view
    availableStock: {
      type: Number,
      default: 0
    },
    usedLicenses: {
      type: Number,
      default: 0
    },
    expiredLicenses: {
      type: Number,
      default: 0
    },
    reservedLicenses: {
      type: Number,
      default: 0
    },
    totalLicenses: {
      type: Number,
      default: 0
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    product: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    effectiveAvailableStock() {
      // Gunakan available_stock jika ada, atau fallback ke stock untuk kompatibilitas
      return this.availableStock !== undefined ? this.availableStock : 
             (this.product?.available_stock !== undefined ? this.product.available_stock : this.stock);
    },
    lowStock() {
      const threshold = this.product?.min_stock_threshold || this.lowStockThreshold;
      return this.effectiveAvailableStock > 0 && this.effectiveAvailableStock <= threshold;
    },
    outOfStock() {
      return this.effectiveAvailableStock === 0;
    },
    stockStatusClass() {
      if (this.outOfStock) return 'out-of-stock';
      if (this.lowStock) return 'low-stock';
      return 'in-stock';
    }
  }
}
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.stock-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stock-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  color: white;
  font-weight: bold;
}

.stock-badge.in-stock {
  background-color: var(--success-color, #4CAF50);
}

.stock-badge.low-stock {
  background-color: var(--warning-color, #FFC107);
}

.stock-badge.out-of-stock {
  background-color: var(--danger-color, #F44336);
}

.stock-number {
  font-size: 1.4rem;
  line-height: 1;
  margin-bottom: 0.1rem;
}

.stock-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.8;
}

.stock-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  font-size: 0.85rem;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.stock-item .label {
  color: var(--text-secondary-color, #777);
}

.stock-item .value {
  font-weight: 600;
  color: var(--text-primary-color, #333);
}

.low-stock-warning, .out-of-stock-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.low-stock-warning {
  color: var(--warning-text-color, #5F4700);
  background-color: var(--warning-bg-color, #FFF3CD);
}

.out-of-stock-warning {
  color: var(--danger-text-color, #7F1D1D);
  background-color: var(--danger-bg-color, #FFEBEE);
}
</style> 