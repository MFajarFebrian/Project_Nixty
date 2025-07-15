<template>
  <div class="admin-dashboard">
    <!-- Compact Header -->
    <div class="admin-header">
      <div class="header-left">
        <h1 class="dashboard-title">
          <i class="fas fa-tachometer-alt"></i>
          Admin Dashboard
        </h1>
        <p class="dashboard-subtitle">Manage your database and system settings</p>
      </div>
      <div class="header-right">
        <div class="header-controls">
          <div class="quick-actions">
            <button @click="refreshData" class="quick-btn refresh-btn" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Dashboard</h3>
        <p>{{ error }}</p>
        <button @click="refreshData" class="retry-btn">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Compact Stats Row -->
      <div class="stats-row">
        <div 
          v-for="stat in getQuickStats" 
          :key="stat.title"
          class="stat-card"
          :class="`stat-${stat.color}`"
        >
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-title">{{ stat.title }}</p>
            <p v-if="stat.change" class="stat-change">{{ stat.change }}</p>
        </div>
      </div>

        <!-- Stock Overview Card -->
        <div class="stat-card stat-stock" @click="showStockManagement = true">
          <div class="stat-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stockStats.total }}</h3>
            <p class="stat-title">Products</p>
            <p class="stat-change">{{ stockStats.lowStock }} low stock</p>
              </div>
          <div class="stat-action">
                <i class="fas fa-chevron-right"></i>
              </div>
          </div>
        </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Transaction Chart Widget -->
          <TransactionChart @dateRangeChanged="handleDateRangeChanged" />
          <!-- Stock Overview Widget -->
          <div class="widget stock-widget">
            <div class="widget-header">
              <h3><i class="fas fa-chart-line"></i> Stock Overview</h3>
              <button @click="showStockManagement = true" class="widget-action">
                <i class="fas fa-external-link-alt"></i>
              </button>
            </div>
            <div class="widget-content">
              <StockOverview 
                :products="products"
                :loading="productsLoading"
                @refresh="loadProducts"
                @view-management="showStockManagement = true"
                @view-product="viewProduct"
              />
            </div>
          </div>
          
          <!-- Recent Activity Widget -->
          <div class="widget activity-widget">
            <div class="widget-header">
              <h3><i class="fas fa-clock"></i> Recent Activity</h3>
              <span class="activity-count">{{ recentActivity.length }}</span>
            </div>
            <div class="widget-content">
          <div class="activity-list">
            <div 
                  v-for="activity in recentActivity.slice(0, 5)" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="activity-content">
                    <h4>{{ activity.product_name || 'Unknown Product' }}</h4>
                <p class="activity-details">
                      Order: {{ activity.order_id || 'N/A' }} • 
                      {{ formatCurrency(activity.amount || 0) }}
                </p>
                <p class="activity-time">{{ formatDate(activity.created_at) }}</p>
              </div>
              <div class="activity-status">
                <span 
                  class="status-badge"
                  :class="`status-${getStatusBadgeClass(activity.status)}`"
                >
                      {{ activity.status || 'Unknown' }}
                </span>
              </div>
            </div>
            
            <div v-if="recentActivity.length === 0" class="no-activity">
              <i class="fas fa-inbox"></i>
              <p>No recent activity</p>
            </div>
          </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Database Tables Widget -->
          <div class="widget tables-widget">
            <div class="widget-header">
              <h3><i class="fas fa-database"></i> Database Tables</h3>
              <p>Click to manage data</p>
            </div>
            <div class="widget-content">
              <div class="tables-grid">
                <NuxtLink
                  v-for="(tableInfo, tableName) in tablesInfo"
                  :key="tableName"
                  :to="`/admin/tables/${tableName}`"
                  class="table-card"
                >
                  <div class="table-icon">
                    <i :class="getTableIcon(tableName)"></i>
                  </div>
                  <div class="table-info">
                    <h4>{{ tableInfo.displayName || getTableDisplayName(tableName) }}</h4>
                    <p class="table-count">{{ tableInfo.recordCount || 0 }} records</p>
                    <p class="table-columns">{{ tableInfo.columnCount || 0 }} columns</p>
                  </div>
                  <div class="table-arrow">
                    <i class="fas fa-chevron-right"></i>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Quick Stats Widget -->
          <div class="widget quick-stats-widget">
            <div class="widget-header">
              <h3><i class="fas fa-chart-pie"></i> Quick Stats</h3>
            </div>
            <div class="widget-content">
              <div class="quick-stats-grid">
                <div class="quick-stat">
                  <div class="quick-stat-icon success">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ totalTransactions || 0 }}</span>
                    <span class="quick-stat-label">Transactions</span>
                  </div>
                </div>
                <div class="quick-stat">
                  <div class="quick-stat-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ stockStats.lowStock }}</span>
                    <span class="quick-stat-label">Low Stock</span>
                  </div>
                </div>
                <div class="quick-stat">
                  <div class="quick-stat-icon danger">
                    <i class="fas fa-times-circle"></i>
                  </div>
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ stockStats.outOfStock }}</span>
                    <span class="quick-stat-label">Out of Stock</span>
                  </div>
                </div>
                <div class="quick-stat">
                  <div class="quick-stat-icon info">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="quick-stat-info">
                    <span class="quick-stat-value">{{ totalUsers || 0 }}</span>
                    <span class="quick-stat-label">Users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Management Modal -->
    <div v-if="showStockManagement" class="modal-overlay" @click="showStockManagement = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button @click="showStockManagement = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <StockManagement 
            :products="products"
            :categories="categories"
            :loading="productsLoading"
            @refresh="loadProducts"
            @close="showStockManagement = false"
          />
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<script setup lang="js">
import { onMounted, ref, computed } from 'vue';
import ToastNotifications from '~/components/admin/ToastNotifications.vue';
import StockOverview from '~/components/admin/StockOverview.vue';
import StockManagement from '~/components/admin/StockManagement.vue';
import TransactionChart from '~/components/admin/TransactionChart.vue';
import { useAdminAuth } from '~/composables/useAdminAuth';
import { useAdminOverview } from '~/composables/useAdminOverview';

// Set page meta
definePageMeta({
  layout: 'default'
});

// Admin authentication
const { requireAdmin } = useAdminAuth();

// Ensure admin access on mount
onMounted(() => {
  if (!requireAdmin()) {
    // Redirection handled by requireAdmin
    return;
  }
});

// Admin overview composable
const {
  loading,
  error,
  statistics,
  tablesInfo,
  recentActivity,
  fetchOverview,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  getTableDisplayName,
  getTableIcon,
  products,
  productsLoading,
  loadProducts,
  totalTransactions,
  totalUsers,
  getQuickStats
} = useAdminOverview();

// Stock management state
const showStockManagement = ref(false);
const categories = ref([]);

// Computed properties
// const getQuickStats = computed(() => []); // replaced by composable version

const stockStats = computed(() => {
  const total = products.value.length;
  const lowStock = products.value.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.value.filter(p => p.stock === 0).length;
  
  return { total, lowStock, outOfStock };
});

// Methods
const loadCategories = async () => {
  try {
    const response = await $fetch('/api/admin/tables/categories');
    if (response && response.success) {
      categories.value = response.data.map(category => ({
        id: category.id,
        name: category.name
      }));
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const refreshData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    await Promise.all([
      fetchOverview(),
      loadProducts(),
      loadCategories()
    ]);
  } catch (err) {
    console.error('Error refreshing data:', err);
    error.value = err.message || 'Failed to refresh dashboard data';
  } finally {
    loading.value = false;
  }
};

const viewProduct = (productId) => {
  if (productId) {
    navigateTo(`/product/${productId}`);
  }
};

// Handle date range changes from TransactionChart
const handleDateRangeChanged = async (dateRange) => {
  try {
    console.log('Date range changed in TransactionChart:', dateRange);
    
    // Fetch filtered overview data based on the date range
    loading.value = true;
    
    // Update all dashboard data with the selected date range
    await fetchOverview(dateRange.startDate, dateRange.endDate);
    
    // Also refresh other related data
    await loadProducts();

    console.log('Dashboard updated with date range:', dateRange);
  } catch (err) {
    console.error('Error updating overview with date range:', err);
    error.value = err.message || 'Failed to update dashboard data';
  } finally {
    loading.value = false;
  }
};

// Lifecycle
// Set page title
useHead({
  title: 'Admin Dashboard'
});

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.admin-dashboard {
  min-height: 100vh;
  background: var(--galaxy-hero-gradient);
  padding: var(--galaxy-space-lg);
  font-family: var(--galaxy-font-primary);
}

/* Compact Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-xl);
  margin-bottom: var(--galaxy-space-xl);
  backdrop-filter: blur(10px);
}

.header-left {
  flex: 1;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-title i {
  color: var(--galaxy-aurora-cyan);
  font-size: 1.5rem;
}

.dashboard-subtitle {
  font-size: 0.9rem;
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: var(--galaxy-space-md);
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border: none;
  border-radius: var(--galaxy-radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  font-family: var(--galaxy-font-primary);
}

.quick-btn.stock-btn {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #00b894);
  color: var(--galaxy-deep-space);
}

.quick-btn.stock-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
}

.quick-btn.refresh-btn {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.quick-btn.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.quick-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-btn.warning-btn {
  background: linear-gradient(135deg, var(--galaxy-solar-yellow), #ff9800);
  color: var(--galaxy-deep-space);
}

.quick-btn.warning-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  backdrop-filter: blur(10px);
}

.loading-spinner,
.error-message {
  text-align: center;
  color: var(--galaxy-starlight);
}

.loading-spinner i {
  font-size: 2.5rem;
  color: var(--galaxy-aurora-cyan);
  margin-bottom: var(--galaxy-space-md);
}

.error-message i {
  font-size: 2.5rem;
  color: var(--galaxy-plasma-orange);
  margin-bottom: var(--galaxy-space-md);
}

.retry-btn {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  border: none;
  padding: var(--galaxy-space-sm) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  margin-top: var(--galaxy-space-md);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

/* Dashboard Content */
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Compact Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--galaxy-space-lg);
  margin-bottom: var(--galaxy-space-xl);
}

.stat-card {
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-lg);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  transition: var(--galaxy-transition-normal);
  backdrop-filter: blur(10px);
  position: relative;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--galaxy-shadow-medium);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--galaxy-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-blue .stat-icon {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.stat-green .stat-icon {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #4caf50);
  color: var(--galaxy-deep-space);
}

.stat-purple .stat-icon {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #9c27b0);
  color: var(--galaxy-starlight);
}

.stat-gold .stat-icon {
  background: linear-gradient(135deg, var(--galaxy-nova-gold), #ff9800);
  color: var(--galaxy-deep-space);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--galaxy-cloud-gray);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.stat-change {
  font-size: 0.75rem;
  color: var(--galaxy-aurora-cyan);
  margin: 0;
}

/* Stock Management Card */
.stat-card.stat-stock {
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(5, 150, 105, 0.05));
  border-color: rgba(100, 255, 218, 0.3);
  cursor: pointer;
  overflow: hidden;
}

.stat-card.stat-stock:hover {
  transform: translateY(-3px);
  border-color: rgba(100, 255, 218, 0.5);
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(100, 255, 218, 0.3);
}

.stat-card.stat-stock .stat-icon {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #00b894);
  color: var(--galaxy-deep-space);
}

.stat-card.stat-stock .stat-action {
  color: var(--galaxy-comet-green);
  font-size: 1rem;
  transition: var(--galaxy-transition-fast);
}

.stat-card.stat-stock:hover .stat-action {
  transform: translateX(4px);
  color: var(--galaxy-starlight);
}

/* Main Content Grid */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--galaxy-space-xl);
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

/* Widget Styles */
.widget {
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  backdrop-filter: blur(10px);
  margin-bottom: var(--galaxy-space-lg);
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.widget-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
}

.widget-header h3 i {
  color: var(--galaxy-aurora-cyan);
}

.widget-header p {
  font-size: 0.8rem;
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.widget-action {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--galaxy-aurora-cyan);
  width: 32px;
  height: 32px;
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--galaxy-transition-fast);
}

.widget-action:hover {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
  border-color: var(--galaxy-aurora-cyan);
}

.activity-count {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
}

.widget-content {
  padding: var(--galaxy-space-lg);
}

/* Stock Widget */
.stock-widget .widget-content {
  padding: 0;
}

/* Activity Widget */
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--galaxy-transition-fast);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-sm);
}

.activity-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--galaxy-radius-full);
  background: var(--galaxy-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--galaxy-starlight);
  flex-shrink: 0;
  font-size: 0.75rem;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.activity-details {
  font-size: 0.7rem;
  color: var(--galaxy-cloud-gray);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.activity-time {
  font-size: 0.7rem;
  color: var(--galaxy-satellite-gray);
  margin: 0;
}

.activity-status {
  flex-shrink: 0;
}

.status-badge {
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-success {
  background: rgba(76, 175, 80, 0.2);
  color: var(--galaxy-comet-green);
}

.status-warning {
  background: rgba(255, 193, 7, 0.2);
  color: var(--galaxy-solar-yellow);
}

.status-danger {
  background: rgba(244, 67, 54, 0.2);
  color: var(--galaxy-plasma-orange);
}

.status-secondary {
  background: rgba(158, 158, 158, 0.2);
  color: var(--galaxy-cloud-gray);
}

.no-activity {
  text-align: center;
  padding: var(--galaxy-space-xl);
  color: var(--galaxy-cloud-gray);
}

.no-activity i {
  font-size: 1.5rem;
  margin-bottom: var(--galaxy-space-md);
  opacity: 0.5;
}

/* Tables Widget */
.tables-grid {
  display: grid;
  gap: var(--galaxy-space-md);
}

.table-card {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  text-decoration: none;
  color: var(--galaxy-starlight);
  transition: var(--galaxy-transition-normal);
}

.table-card:hover {
  transform: translateY(-2px);
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: var(--galaxy-glow-cyan);
  color: var(--galaxy-starlight);
}

.table-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--galaxy-radius-md);
  background: var(--galaxy-secondary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--galaxy-starlight);
  flex-shrink: 0;
  font-size: 0.875rem;
}

.table-info {
  flex: 1;
}

.table-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 var(--galaxy-space-xs) 0;
  color: var(--galaxy-starlight);
}

.table-count,
.table-columns {
  font-size: 0.7rem;
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.table-arrow {
  color: var(--galaxy-aurora-cyan);
  opacity: 0.7;
  transition: var(--galaxy-transition-fast);
}

.table-card:hover .table-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Quick Stats Widget */
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--galaxy-space-md);
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-stat-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--galaxy-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.quick-stat-icon.success {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #4caf50);
  color: var(--galaxy-deep-space);
}

.quick-stat-icon.warning {
  background: linear-gradient(135deg, var(--galaxy-solar-yellow), #ff9800);
  color: var(--galaxy-deep-space);
}

.quick-stat-icon.danger {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #e91e63);
  color: var(--galaxy-starlight);
}

.quick-stat-icon.info {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
}

.quick-stat-info {
  display: flex;
  flex-direction: column;
}

.quick-stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
}

.quick-stat-label {
  font-size: 0.7rem;
  color: var(--galaxy-cloud-gray);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--galaxy-z-modal);
  padding: var(--galaxy-space-md);
}

.modal-content {
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  backdrop-filter: blur(20px);
  max-width: 95vw;
  height: 75%;
  overflow: hidden;
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-blue);
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-xl);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin: 0;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: linear-gradient(135deg, var(--galaxy-pulsar-pink), #e91e63);
  color: var(--galaxy-starlight);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--galaxy-radius-full);
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--galaxy-transition-fast);
}

.close-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 107, 157, 0.4);
}

.modal-body {
  overflow-y: auto;
  flex: 1;
  height: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: var(--galaxy-space-md);
  }
  
  .admin-header {
    flex-direction: column;
    gap: var(--galaxy-space-lg);
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .quick-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: var(--galaxy-space-md);
  }
  
  .widget-header {
    flex-direction: column;
    gap: var(--galaxy-space-sm);
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: var(--galaxy-space-sm);
  }
  
  .dashboard-title {
    font-size: 1.3rem;
  }
  
  .quick-btn {
    padding: var(--galaxy-space-sm) var(--galaxy-space-md);
    font-size: 0.8rem;
  }
}
</style>