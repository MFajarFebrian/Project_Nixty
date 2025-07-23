<template>
  <div class="admin-dashboard">
    <div v-if="!currentUser" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    </div>
    
    <template v-else>
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {{ currentUser?.name || 'Admin' }}!</p>
      </div>

      <!-- Stock Management Section -->
      <div class="dashboard-section dashboard-card">
        <div class="section-header">
          <h2><i class="fas fa-boxes"></i> Stock Overview</h2>
          <div class="action-buttons">
            <button @click="navigateToAddProduct" class="action-btn add-product">
              <i class="fas fa-plus"></i> Add Product
            </button>
            <button @click="navigateToAddLicense" class="action-btn add-license">
              <i class="fas fa-key"></i> Add Licenses
            </button>
          </div>
        </div>
        
        <!-- Stock Overview Container -->
        <div class="stock-overview-container">
          <!-- Stock Overview Layout -->
          <div class="stock-overview-layout">
            <!-- Left side: Stats -->
            <div class="stock-stats-left">
              <div class="stock-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ stockStats.totalLicenses }}</span>
                  <span class="stat-label">Total Licenses</span>
                </div>
                <div class="stat-item warning" v-if="stockStats.lowStock > 0">
                  <span class="stat-number">{{ stockStats.lowStock }}</span>
                  <span class="stat-label">Low Stock (≤5)</span>
                </div>
                <div class="stat-item danger" v-if="stockStats.outOfStock > 0">
                  <span class="stat-number">{{ stockStats.outOfStock }}</span>
                  <span class="stat-label">Out of Stock</span>
                </div>
              </div>
            </div>
            
            <!-- Right side: Horizontal License Chart -->
            <div class="license-chart-right" v-if="!loadingCharts && safeChartData.length > 0">
              <h3><i class="fas fa-chart-bar"></i> License Distribution</h3>
              <div class="license-bars-horizontal">
                <div v-for="(item, index) in safeChartData" :key="index" class="license-bar-horizontal">
                  <div class="license-product-label-left">
                    <span class="license-product-name-full">{{ item.productName }}</span>
                    <span class="license-count-text">{{ item.totalLicenses }} licenses</span>
                  </div>
                  <div class="license-bar-horizontal-container">
                    <div class="license-bar-horizontal-fill" :style="{ width: item.percentage + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stock-list" v-if="safeStockProducts.length > 0">
          <h3>Products Requiring Attention</h3>
          <div class="product-grid">
            <div v-for="product in safeStockProducts" :key="product.id" class="product-item">
              <span class="product-name">{{ product.productName }}</span>
              <span class="product-stock" :class="product.stockClass">
                Stock: {{ product.stockAmount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Chart Section -->
      <div class="dashboard-section dashboard-card">
        <h2><i class="fas fa-chart-line"></i> Transaction Analytics</h2>
        <div class="chart-container" v-if="!loadingCharts">
          <div class="chart-stats">
            <div class="chart-stat">
              <span class="chart-number">{{ chartMetrics.totalRevenue }}</span>
              <span class="chart-label">Total Revenue</span>
            </div>
            <div class="chart-stat">
              <span class="chart-number">{{ chartMetrics.totalOrders }}</span>
              <span class="chart-label">Total Orders</span>
            </div>
            <div class="chart-stat">
              <span class="chart-number">{{ chartMetrics.avgOrderValue }}</span>
              <span class="chart-label">Avg Order Value</span>
            </div>
          </div>
          
          <!-- Use the existing TransactionChart component with metrics sync -->
          <TransactionChart ref="transactionChartRef" @metrics-updated="handleMetricsUpdate" />
        </div>
        <div v-else class="loading-message">Loading analytics...</div>
      </div>

      <!-- Table Management Section -->
      <div class="dashboard-section dashboard-card">
        <h2><i class="fas fa-database"></i> Data Management</h2>
        <div class="table-selector">
          <select v-model="selectedTable" @change="loadTableData">
            <option value="">Select a table to manage</option>
            <option value="orders">Orders</option>
            <option value="users">Users</option>
          </select>
        </div>
        
        <div v-if="selectedTable && !loadingTable" class="table-container">
          <div class="table-info">
            <h3>{{ selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1) }} ({{ tableData.length }} records)</h3>
            <input v-model="searchQuery" type="text" placeholder="Search records..." class="search-input">
          </div>
          
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="column in tableColumns" :key="column">{{ formatColumnName(column) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in filteredData" :key="record.id || index">
                  <td v-for="column in tableColumns" :key="column">
                    {{ formatCellData(record[column], column) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else-if="loadingTable" class="loading-message">Loading table data...</div>
      </div>

      <div class="dashboard-footer">
        <LogoutButton size="large" label="Logout" show-icon />
      </div>
    </template>
  </div>
</template>

<script setup lang="js">
import { onMounted, computed, ref, watch, nextTick } from 'vue';
import TransactionChart from '~/components/admin/TransactionChart.vue';
import { adminFetch } from '~/utils/adminApi';

const router = useRouter();
const { user, initUser } = useAuth();

// Set page meta
definePageMeta({
  layout: 'default',
  middleware: 'admin'
});

// Reactive state
const products = ref([]);
const transactions = ref([]);
const categories = ref([]);
const users = ref([]);

// Loading states
const loadingCharts = ref(true);
const loadingTable = ref(false);

// Chart component reference
const transactionChartRef = ref(null);

// Table management
const selectedTable = ref('');
const tableData = ref([]);
const tableColumns = ref([]);
const searchQuery = ref('');

// Format currency to Indonesian Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Chart metrics from the chart component
const chartMetrics = ref({
  totalRevenue: formatRupiah(0),
  totalOrders: '0',
  avgOrderValue: formatRupiah(0)
});

// Computed user for template
const currentUser = computed(() => user.value);

// Stock statistics
const stockStats = computed(() => {
  const totalLicenses = products.value.reduce((sum, p) => {
    const licenses = parseInt(p.total_licenses) || 0;
    return sum + licenses;
  }, 0);
  const lowStock = products.value.filter(p => {
    const stock = p.stock || p.available_stock || 0;
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStock = products.value.filter(p => {
    const stock = p.stock || p.available_stock || 0;
    return stock === 0;
  }).length;
  return { totalLicenses, lowStock, outOfStock };
});

// Low stock products for attention
const lowStockProducts = computed(() => {
  return products.value.filter(p => {
    const stock = p.stock || p.available_stock || 0;
    return stock <= 5;
  }).slice(0, 10); // Show max 10
});

// License distribution chart data
const licenseChartData = computed(() => {
  if (!products.value.length) return [];
  
  // Get products with license data
  const productsWithLicenses = products.value
    .filter(p => (p.total_licenses || 0) > 0)
    .map(p => ({
      name: p.name,
      total: p.total_licenses || 0,
      available: p.stock || p.available_stock || 0
    }));
  
  if (!productsWithLicenses.length) return [];
  
  // Calculate percentages based on max licenses
  const maxLicenses = Math.max(...productsWithLicenses.map(p => p.total));
  
  return productsWithLicenses
    .sort((a, b) => b.total - a.total) // Sort by total licenses desc
    .slice(0, 10) // Show top 10 products
    .map(product => ({
      ...product,
      percentage: Math.max((product.total / maxLicenses) * 100, 5) // Minimum 5% width
    }));
});

// Transaction statistics
const transactionStats = computed(() => {
  const totalRevenue = transactions.value
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (parseFloat(t.total) || 0), 0);
  
  const totalOrders = transactions.value.filter(t => t.status === 'completed').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalRevenue: formatRupiah(totalRevenue),
    totalOrders: totalOrders.toString(),
    avgOrderValue: formatRupiah(avgOrderValue)
  };
});


// Safe computed properties for templates
const safeChartData = computed(() => {
  if (!licenseChartData.value || !Array.isArray(licenseChartData.value)) {
    return [];
  }
  return licenseChartData.value.map(item => ({
    productName: item.name || 'Unknown',
    totalLicenses: item.total || 0,
    percentage: item.percentage || 0
  }));
});

const safeStockProducts = computed(() => {
  if (!lowStockProducts.value || !Array.isArray(lowStockProducts.value)) {
    return [];
  }
  return lowStockProducts.value.map(product => {
    const stock = product.stock || product.available_stock || 0;
    return {
      id: product.id || Math.random(),
      productName: product.name || 'Unknown Product',
      stockAmount: stock,
      stockClass: stock === 0 ? 'out-of-stock' : 'low-stock'
    };
  });
});




// Filtered table data based on search
const filteredData = computed(() => {
  if (!searchQuery.value || !tableData.value.length) {
    return tableData.value.slice(0, 50); // Limit to 50 records for performance
  }
  
  const query = searchQuery.value.toLowerCase();
  return tableData.value.filter(record => {
    return Object.values(record).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    });
  }).slice(0, 50);
});

// Load products data
const loadProducts = async () => {
  try {
    const response = await adminFetch('/api/admin/tables/products');
    if (response && response.success) {
      products.value = response.data || [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [];
  }
};
// Load transactions data (from orders table) - for table display
const loadOrders = async () => {
  try {
    const response = await adminFetch('/api/admin/transactions');
    if (response && response.success) {
      transactions.value = response.data || [];
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    transactions.value = [];
  }
};

// Load categories data
const loadCategories = async () => {
  try {
    const response = await adminFetch('/api/admin/tables/categories');
    if (response && response.success) {
      categories.value = response.data || [];
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = [];
  }
};

// Load users data
const loadUsers = async () => {
  try {
    const response = await adminFetch('/api/admin/tables/users');
    if (response && response.success) {
      users.value = response.data || [];
    }
  } catch (error) {
    console.error('Error loading users:', error);
    users.value = [];
  }
};

// Load specific table data
const loadTableData = async () => {
  if (!selectedTable.value) {
    tableData.value = [];
    tableColumns.value = [];
    return;
  }
  
  loadingTable.value = true;
  searchQuery.value = '';
  
  try {
    let data = [];
    
    switch (selectedTable.value) {
      case 'orders':
        data = transactions.value;
        break;
      case 'users':
        data = users.value;
        break;
    }
    
    tableData.value = data;
    
    // Extract essential columns based on table type
    if (data.length > 0) {
      const allColumns = Object.keys(data[0]);
      
      // Define essential columns for each table
      const essentialColumns = {
        orders: ['id', 'user_name', 'user_email', 'product_name', 'total', 'status', 'created_at'],
        users: ['id', 'name', 'email', 'account_type']
      };
      
      tableColumns.value = essentialColumns[selectedTable.value] || allColumns.slice(0, 6);
    } else {
      tableColumns.value = [];
    }
  } catch (error) {
    console.error('Error loading table data:', error);
    tableData.value = [];
    tableColumns.value = [];
  } finally {
    loadingTable.value = false;
  }
};

// Format column names for display
const formatColumnName = (column) => {
  return column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Format cell data for display
const formatCellData = (value, column) => {
  if (value === null || value === undefined) return '-';
  
  if (column.includes('price') || column.includes('amount') || column.includes('total')) {
    return formatRupiah(parseFloat(value));
  }
  
  if (column.includes('created_at') || column.includes('updated_at')) {
    return new Date(value).toLocaleDateString();
  }
  
  if (column.includes('email')) {
    const parts = value.split('@');
    if (parts.length === 2) {
      return `${parts[0].substring(0, 3)}***@${parts[1]}`;
    }
  }
  
  // Truncate long text values
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...';
  }
  
  return value;
};





// Navigation methods
const navigateToAddProduct = () => {
  router.push('/dashboard/add-product');
};

const navigateToAddLicense = () => {
  router.push('/dashboard/add-license');
};

// Handle metrics update from TransactionChart component
const handleMetricsUpdate = (metrics) => {
  chartMetrics.value = {
    totalRevenue: formatRupiah(metrics.totalRevenue || 0),
    totalOrders: (metrics.totalOrders || 0).toString(),
    avgOrderValue: formatRupiah(metrics.avgOrderValue || 0)
  };
};

// Load all data on mount
const loadAllData = async () => {
  loadingCharts.value = true;
  
  try {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadCategories(),
      loadUsers()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loadingCharts.value = false;
  }
};

// Ensure admin access on mount
onMounted(async () => {
  await initUser();
  
  if (!user.value) {
    router.push('/login');
    return;
  }

  // Redirect regular users to home
  if (user.value && user.value.account_type !== 'admin') {
    router.push('/home');
    return;
  }
  
  // Load dashboard data
  await loadAllData();
});


// Set page title
useHead({
  title: 'Admin Dashboard'
});
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.admin-dashboard {
  min-height: 100vh;
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-hero-gradient);
  font-family: var(--galaxy-font-primary);
  color: var(--galaxy-starlight);
  max-width: 100vw;
  overflow-x: hidden;
}

/* Loading States */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-spinner {
  text-align: center;
  color: var(--galaxy-aurora-cyan);
}

.loading-spinner i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
  color: var(--galaxy-comet-green);
}

.loading-spinner p {
  font-size: 1.2rem;
  margin: 0;
  color: var(--galaxy-starlight);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  text-align: center;
  padding: var(--galaxy-space-xl);
  color: var(--galaxy-cloud-gray);
  font-style: italic;
  font-size: 1.1rem;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: var(--galaxy-space-3xl);
  padding: var(--galaxy-space-xl);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-blue);
}

.dashboard-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--galaxy-space-sm);
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-header p {
  font-size: 1.2rem;
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

/* Sections */
.dashboard-card {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-xl);
  padding: var(--galaxy-space-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-large);
}

.dashboard-section {
  margin-bottom: var(--galaxy-space-3xl);
}

.license-bar-horizontal-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-md);
  overflow: hidden;
  height: 20px;
}

.license-bar-horizontal-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--galaxy-stellar-blue), var(--galaxy-aurora-cyan));
  border-radius: var(--galaxy-radius-md);
  transition: width 0.5s ease-in-out;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--galaxy-space-lg);
}

.product-item {
    background: rgba(255, 255, 255, 0.05);
    padding: var(--galaxy-space-lg);
    border-radius: var(--galaxy-radius-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-stock.low-stock {
    color: var(--galaxy-comet-orange);
}

.product-stock.out-of-stock {
    color: var(--galaxy-nova-red);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--galaxy-space-xl);
  flex-wrap: wrap;
  gap: var(--galaxy-space-md);
}

.action-buttons {
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
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  font-family: var(--galaxy-font-primary);
  text-decoration: none;
}

.action-btn.add-product {
  background: linear-gradient(135deg, var(--galaxy-comet-green), #00b894);
  color: var(--galaxy-deep-space);
  box-shadow: 0 2px 8px rgba(100, 255, 218, 0.3);
}

.action-btn.add-product:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.4);
}

.action-btn.add-license {
  background: linear-gradient(135deg, var(--galaxy-stellar-blue), var(--galaxy-aurora-cyan));
  color: var(--galaxy-starlight);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.action-btn.add-license:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dashboard-section h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-xl);
  text-align: center;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-md);
}

.dashboard-section h2 i {
  color: var(--galaxy-aurora-cyan);
  font-size: 1.8rem;
  text-shadow: var(--galaxy-glow-cyan);
}

.simple-chart h4 {
  color: var(--galaxy-starlight);
  font-size: 1.2rem;
  margin-bottom: var(--galaxy-space-lg);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
}

.simple-chart h4 i {
  color: var(--galaxy-comet-green);
  font-size: 1.1rem;
}

/* Stock Overview Container */
.stock-overview-container {
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Stock Overview Layout */
.stock-overview-layout {
  display: flex;
  gap: var(--galaxy-space-2xl);
  align-items: stretch;
  min-height: 350px;
  width: 100%;
  box-sizing: border-box;
}

/* Stock Statistics */
.stock-stats {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-lg);
  width: 100%;
}

.stock-stats-left {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 350px;
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
  box-sizing: border-box;
}

.stat-item {
  text-align: center;
  padding: var(--galaxy-space-lg);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--galaxy-transition-normal);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: var(--galaxy-transition-normal);
}

.stat-item:hover::before {
  left: 100%;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-cyan);
  border-color: var(--galaxy-aurora-cyan);
}

.stat-item.warning {
  background: linear-gradient(145deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
  border-color: rgba(255, 193, 7, 0.3);
}

.stat-item.danger {
  background: linear-gradient(145deg, rgba(244, 67, 54, 0.1), rgba(233, 30, 99, 0.05));
  border-color: rgba(244, 67, 54, 0.3);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-sm);
  text-shadow: var(--galaxy-glow-cyan);
}

.stat-label {
  font-size: 1rem;
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

/* Chart Statistics */
.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--galaxy-space-lg);
  margin-bottom: var(--galaxy-space-xl);
}

.chart-stat {
  text-align: center;
  padding: var(--galaxy-space-lg);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
  transition: var(--galaxy-transition-normal);
}

.chart-stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-blue);
  border-color: var(--galaxy-stellar-blue);
}

.chart-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-sm);
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-label {
  font-size: 0.9rem;
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

/* Chart Container */
.simple-chart {
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-xl);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
}


.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 150px;
  margin-top: var(--galaxy-space-lg);
  gap: var(--galaxy-space-sm);
  padding: 0 var(--galaxy-space-md);
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  background: var(--galaxy-accent-gradient);
  border-radius: var(--galaxy-radius-sm) var(--galaxy-radius-sm) 0 0;
  transition: var(--galaxy-transition-normal);
  min-height: 4px;
  box-shadow: var(--galaxy-glow-cyan);
}

.bar:hover {
  transform: scaleY(1.05);
  box-shadow: var(--galaxy-glow-cyan), 0 0 15px var(--galaxy-aurora-cyan);
}

.bar-label {
  margin-top: var(--galaxy-space-sm);
  font-size: 0.8rem;
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

/* Table Management */
.table-selector {
  margin-bottom: var(--galaxy-space-lg);
}

.table-selector select {
  padding: var(--galaxy-space-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  background: rgba(30, 41, 59, 0.9);
  color: var(--galaxy-starlight);
  font-size: 1rem;
  width: 250px;
  backdrop-filter: blur(10px);
  transition: var(--galaxy-transition-normal);
  cursor: pointer;
}

.table-selector select:hover {
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.table-selector select:focus {
  outline: none;
  border-color: var(--galaxy-comet-green);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.3);
}

.table-selector option {
  background: rgba(30, 41, 59, 0.95);
  color: var(--galaxy-starlight);
  padding: var(--galaxy-space-sm);
  border: none;
}

/* Additional dropdown styling for better compatibility */
.table-selector select::-ms-expand {
  display: none;
}

.table-selector select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.table-info {
  margin-bottom: var(--galaxy-space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
}

.table-info h3 {
  color: var(--galaxy-starlight);
  font-size: 1.4rem;
  margin: 0;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: var(--galaxy-space-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  background: rgba(255, 255, 255, 0.1);
  color: var(--galaxy-starlight);
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: var(--galaxy-transition-normal);
}

.search-input::placeholder {
  color: var(--galaxy-cloud-gray);
}

/* Chart Container */
.chart-canvas-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin: var(--galaxy-space-lg) 0;
  padding: var(--galaxy-space-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-lg);
  backdrop-filter: blur(10px);
}

/* License Chart Placeholder */
.license-chart-placeholder {
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
  flex: 1;
  text-align: center;
}

.license-chart-placeholder h3 {
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-md);
}

.license-chart-placeholder p {
  color: var(--galaxy-cloud-gray);
  font-style: italic;
}

/* Stock List Placeholder */
.stock-list-placeholder {
  margin-top: var(--galaxy-space-xl);
  text-align: center;
  padding: var(--galaxy-space-lg);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stock-list-placeholder h3 {
  color: var(--galaxy-starlight);
  margin-bottom: var(--galaxy-space-md);
}

.stock-list-placeholder p {
  color: var(--galaxy-cloud-gray);
  font-style: italic;
}

.chart-canvas-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.search-input:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.data-table-wrapper {
  overflow-x: auto;
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: var(--galaxy-space-lg);
  text-align: left;
  font-weight: 600;
  color: var(--galaxy-aurora-cyan);
  border-bottom: 2px solid rgba(100, 255, 218, 0.3);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--galaxy-starlight);
  font-size: 0.9rem;
}

.data-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.data-table tr:last-child td {
  border-bottom: none;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--galaxy-space-lg);
  margin-top: var(--galaxy-space-lg);
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--galaxy-space-lg);
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
  transition: var(--galaxy-transition-normal);
}

.product-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-cyan);
  border-color: var(--galaxy-aurora-cyan);
}

.product-name {
  font-weight: 600;
  color: var(--galaxy-starlight);
  font-size: 1rem;
}

.product-stock {
  font-size: 0.9rem;
  font-weight: 500;
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
}

.product-stock.low-stock {
  color: var(--galaxy-solar-yellow);
  background: rgba(255, 235, 59, 0.1);
  border: 1px solid rgba(255, 235, 59, 0.3);
}

.product-stock.out-of-stock {
  color: var(--galaxy-plasma-orange);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

/* Vertical License Chart (Right Side) */
.license-chart-right {
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--galaxy-shadow-medium);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 350px;
  box-sizing: border-box;
}

.license-chart-right h3 {
  color: var(--galaxy-starlight);
  font-size: 1.1rem;
  margin-bottom: var(--galaxy-space-lg);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
}

.license-chart-right h3 i {
  color: var(--galaxy-comet-green);
  font-size: 1rem;
}

.license-bars-horizontal {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-md);
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
}

.license-bar-horizontal {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-md);
  padding: var(--galaxy-space-sm);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--galaxy-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--galaxy-transition-normal);
}

.license-bar-horizontal:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(78, 205, 196, 0.3);
}

.license-product-label-left {
  min-width: 180px;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.license-bar-horizontal-container {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--galaxy-radius-sm);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.license-bar-horizontal-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4 0%, #44A08D 50%, #096A5A 100%);
  border-radius: var(--galaxy-radius-sm);
  transition: all 0.3s ease;
  box-shadow: 0 0 6px rgba(78, 205, 196, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-width: 8px;
  position: relative;
  overflow: hidden;
}

.license-bar-horizontal-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 30%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: var(--galaxy-radius-sm) 0 0 var(--galaxy-radius-sm);
}

.license-bar-horizontal-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20%;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  border-radius: 0 var(--galaxy-radius-sm) var(--galaxy-radius-sm) 0;
}

.license-bar-horizontal:hover .license-bar-horizontal-fill {
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: scaleY(1.1);
}

.license-product-name-full {
  color: var(--galaxy-starlight);
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.license-count-text {
  color: #4ECDC4;
  font-weight: 500;
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Stock List */
.stock-list {
  margin-top: var(--galaxy-space-xl);
}

.stock-list h3 {
  color: var(--galaxy-starlight);
  font-size: 1.3rem;
  margin-bottom: var(--galaxy-space-lg);
  text-align: center;
}

/* Footer */
.dashboard-footer {
  text-align: center;
  margin-top: var(--galaxy-space-3xl);
  padding-top: var(--galaxy-space-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stock-overview-layout {
    flex-direction: column;
    gap: var(--galaxy-space-xl);
  }
  
  .stock-stats-left {
    flex: none;
    height: auto;
  }
  
  .license-chart-right {
    height: 300px;
  }
  
  .stock-stats {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .chart-stats {
    grid-template-columns: 1fr;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: var(--galaxy-space-lg);
  }
  
  .dashboard-header h1 {
    font-size: 2.2rem;
  }
  
  .dashboard-section h2 {
    font-size: 1.6rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
    min-width: 140px;
  }
  
  .stock-stats {
    grid-template-columns: 1fr;
  }
  
  .chart-stats {
    grid-template-columns: 1fr;
  }
  
  .table-selector select {
    width: 100%;
  }
  
  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: var(--galaxy-space-md);
  }
  
  .dashboard-header {
    padding: var(--galaxy-space-lg);
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .chart-number {
    font-size: 1.6rem;
  }
}
</style>
