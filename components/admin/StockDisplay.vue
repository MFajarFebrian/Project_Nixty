<template>
  <div class="stock-display">
    <div class="stock-info">
      <div class="stock-badge" :class="stockStatusClass" :title="getStockTitle()">
        <div class="stock-indicator"></div>
        <div class="stock-content">
          <span class="stock-number">{{ effectiveAvailableStock }}</span>
          <span class="stock-label">{{ getStockLabel() }}</span>
        </div>
      </div>
      
      <div v-if="showDetails" class="stock-details">
        <div class="stock-item">
          <span class="label">Available:</span>
          <span class="value available">{{ effectiveAvailableStock }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Used:</span>
          <span class="value used">{{ normalizedUsedLicenses }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Reserved:</span>
          <span class="value reserved">{{ normalizedReservedLicenses }}</span>
        </div>
        <div class="stock-item">
          <span class="label">Total:</span>
          <span class="value total">{{ normalizedTotalLicenses }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="lowStock && !outOfStock" class="stock-warning low-stock">
      <i class="fas fa-exclamation-triangle"></i>
      <span class="warning-text">Low stock</span>
    </div>
    
    <div v-if="outOfStock" class="stock-warning out-of-stock">
      <i class="fas fa-times-circle"></i>
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
      type: [Number, String],
      default: 0
    },
    // Data baru dari product_stock_view
    availableStock: {
      type: [Number, String],
      default: 0
    },
    usedLicenses: {
      type: [Number, String],
      default: 0
    },
    expiredLicenses: {
      type: [Number, String],
      default: 0
    },
    reservedLicenses: {
      type: [Number, String],
      default: 0
    },
    totalLicenses: {
      type: [Number, String],
      default: 0
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    lowStockThreshold: {
      type: [Number, String],
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
      let stock = this.availableStock !== undefined ? this.availableStock : 
                 (this.product?.available_stock !== undefined ? this.product.available_stock : this.stock);
      return parseInt(stock) || 0;
    },
    normalizedUsedLicenses() {
      return parseInt(this.usedLicenses) || 0;
    },
    normalizedExpiredLicenses() {
      return parseInt(this.expiredLicenses) || 0;
    },
    normalizedReservedLicenses() {
      return parseInt(this.reservedLicenses) || 0;
    },
    normalizedTotalLicenses() {
      return parseInt(this.totalLicenses) || 0;
    },
    normalizedLowStockThreshold() {
      return parseInt(this.lowStockThreshold) || 5;
    },
    lowStock() {
      const threshold = parseInt(this.product?.min_stock_threshold) || this.normalizedLowStockThreshold;
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
  },
  methods: {
    getStockTitle() {
      const stock = this.effectiveAvailableStock;
      const threshold = this.product?.min_stock_threshold || this.lowStockThreshold;
      
      if (stock === 0) {
        return 'Out of stock - No licenses available';
      } else if (stock <= threshold) {
        return `Low stock - Only ${stock} licenses remaining (threshold: ${threshold})`;
      } else {
        return `In stock - ${stock} licenses available`;
      }
    },
    getStockLabel() {
      const stock = this.effectiveAvailableStock;
      if (stock === 0) return 'out of stock';
      if (stock === 1) return 'license';
      return 'licenses';
    }
  }
}
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.stock-display {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xs);
  font-family: var(--galaxy-font-primary);
}

.stock-info {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
}

.stock-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 40px;
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--galaxy-shadow-small);
}

.stock-badge:hover {
  transform: translateY(-1px);
  box-shadow: var(--galaxy-shadow-medium);
}

.stock-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: var(--galaxy-radius-full);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.stock-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stock-badge.in-stock {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #00b894);
  border-color: rgba(100, 255, 218, 0.3);
}

.stock-badge.in-stock .stock-indicator {
  background: var(--galaxy-comet-green);
  box-shadow: 0 0 8px rgba(100, 255, 218, 0.6);
}

.stock-badge.low-stock {
  background: linear-gradient(135deg, var(--galaxy-solar-yellow), #ffa000);
  border-color: rgba(255, 235, 59, 0.3);
}

.stock-badge.low-stock .stock-indicator {
  background: var(--galaxy-solar-yellow);
  box-shadow: 0 0 8px rgba(255, 235, 59, 0.6);
}

.stock-badge.out-of-stock {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #e91e63);
  border-color: rgba(255, 107, 157, 0.3);
}

.stock-badge.out-of-stock .stock-indicator {
  background: var(--galaxy-pulsar-pink);
  box-shadow: 0 0 8px rgba(255, 107, 157, 0.6);
}

.stock-number {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: var(--galaxy-starlight);
}

.stock-label {
  font-size: 9px;
  text-transform: uppercase;
  opacity: 0.9;
  color: var(--galaxy-starlight);
  letter-spacing: 0.5px;
}

.stock-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--galaxy-space-sm);
  font-size: 12px;
  padding: var(--galaxy-space-sm);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--galaxy-space-xs);
  padding: 2px 0;
}

.stock-item .label {
  color: var(--galaxy-cloud-gray);
  font-size: 11px;
}

.stock-item .value {
  font-weight: 600;
  color: var(--galaxy-starlight);
  font-size: 12px;
}

.stock-item .value.available {
  color: var(--galaxy-comet-green);
}

.stock-item .value.used {
  color: var(--galaxy-aurora-cyan);
}

.stock-item .value.reserved {
  color: var(--galaxy-solar-yellow);
}

.stock-item .value.total {
  color: var(--galaxy-starlight);
  font-weight: 700;
}

.stock-warning {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--galaxy-radius-sm);
  margin-top: var(--galaxy-space-xs);
  border: 1px solid;
  backdrop-filter: blur(4px);
}

.stock-warning.low-stock {
  color: var(--galaxy-solar-yellow);
  background: rgba(255, 235, 59, 0.1);
  border-color: rgba(255, 235, 59, 0.3);
}

.stock-warning.out-of-stock {
  color: var(--galaxy-pulsar-pink);
  background: rgba(255, 107, 157, 0.1);
  border-color: rgba(255, 107, 157, 0.3);
}

.warning-text {
  font-size: 11px;
  font-weight: 500;
}

/* Compact version for table cells */
.stock-display.compact {
  gap: 2px;
}

.stock-display.compact .stock-badge {
  min-width: 48px;
  height: 32px;
  padding: 2px 6px;
}

.stock-display.compact .stock-number {
  font-size: 12px;
}

.stock-display.compact .stock-label {
  font-size: 8px;
}

.stock-display.compact .stock-warning {
  font-size: 10px;
  padding: 2px 6px;
}
</style> 