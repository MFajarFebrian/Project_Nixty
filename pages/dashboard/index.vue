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
        
        <div class="stock-overview-container">
          <div class="stock-overview-layout">
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
            
            <div class="license-chart-right" v-if="!loadingCharts && safeChartData.length > 0">
              <h3><i class="fas fa-chart-bar"></i> Stock Distribution</h3>
              <div class="license-bars-horizontal">
                <div v-for="(item, index) in safeChartData" :key="index" class="license-bar-horizontal">
                  <div class="license-product-label-left">
                    <span class="license-product-name-full">{{ item.productName }}</span>
                    <span class="license-count-text">{{ item.totalLicenses }} units</span>
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
          
          <TransactionChart ref="transactionChartRef" @metrics-updated="handleMetricsUpdate" />
        </div>
        <div v-else class="loading-message">Loading analytics...</div>
      </div>

      <div class="dashboard-section dashboard-card">
        <h2><i class="fas fa-database"></i> Data View</h2>
        <div class="table-selector">
          <select v-model="selectedTable" @change="loadTableData">
            <option value="">Select a table to manage</option>
            <option value="orders">Orders</option>
            <option value="users">Users</option>
          </select>
        </div>
        
        <div v-if="selectedTable && !loadingTable" class="table-container">
          <div class="table-info">
            <h3>{{ selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1) }} ({{ filteredData.length }} records)</h3>
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
                <tr v-for="(record, index) in paginatedData" :key="record.order_id || record.id || index">
                  <td v-for="column in tableColumns" :key="column">
                    {{ formatCellData(record[column], column) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination-info">
              <span>Showing {{ paginationInfo.startItem }}-{{ paginationInfo.endItem }} of {{ paginationInfo.totalItems }} records</span>
            </div>
            <div class="pagination-controls">
              <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
                <i class="fas fa-chevron-left"></i> Previous
              </button>
              
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, totalPages)" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-btn', { active: currentPage === page }]"
                >
                  {{ page }}
                </button>
                <span v-if="totalPages > 5" class="pagination-ellipsis">...</span>
                <button 
                  v-if="totalPages > 5 && currentPage < totalPages - 2"
                  @click="goToPage(totalPages)"
                  :class="['page-btn', { active: currentPage === totalPages }]"
                >
                  {{ totalPages }}
                </button>
              </div>
              
              <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
                Next <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="loadingTable" class="loading-message">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading table data...</p>
          </div>
        </div>
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
const { $mobileSession } = useNuxtApp();

definePageMeta({
  layout: 'default',
  middleware: 'admin'
});

const products = ref([]);
const transactions = ref([]);
const categories = ref([]);
const users = ref([]);

const loadingCharts = ref(false);
const loadingTable = ref(false);

const transactionChartRef = ref(null);

const selectedTable = ref('');
const tableData = ref([]);
const tableColumns = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const chartMetrics = ref({
  totalRevenue: formatRupiah(0),
  totalOrders: '0',
  avgOrderValue: formatRupiah(0)
});


const currentUser = computed(() => user.value);


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


const lowStockProducts = computed(() => {
  return products.value.filter(p => {
    const stock = p.stock || p.available_stock || 0;
    return stock <= 5;
  }).slice(0, 10); // Show max 10
});


const licenseChartData = computed(() => {
  if (!products.value.length) return [];
  

  const productsWithStock = products.value
    .map(p => {
      const stock = p.stock || p.available_stock || 0;
      return {
        name: p.name,
        total: stock, // Use actual stock instead of total_licenses
        available: stock
      };
    })
    .filter(p => p.total >= 0); // Include all products, even with 0 stock
  
  if (!productsWithStock.length) return [];
  

  const maxStock = Math.max(...productsWithStock.map(p => p.total), 1); // Ensure at least 1 for percentage calculation
  
  return productsWithStock
    .sort((a, b) => b.total - a.total) // Sort by actual stock desc
    .slice(0, 10) // Show top 10 products
    .map(product => ({
      ...product,
      percentage: Math.max((product.total / maxStock) * 100, 5) // Minimum 5% width
    }));
});


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



const safeChartData = computed(() => {
  if (!licenseChartData.value || !Array.isArray(licenseChartData.value)) {
    return [];
  }
  return licenseChartData.value.map(item => ({
    productName: item.name || 'Unknown',
    totalLicenses: item.total || 0, // Now represents actual stock, not licenses
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


const filteredData = computed(() => {
  let data = [];
  
  if (!searchQuery.value || !tableData.value.length) {
    data = tableData.value;
  } else {
    const query = searchQuery.value.toLowerCase();
    data = tableData.value.filter(record => {
      return Object.values(record).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }
  
  return data;
});


const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredData.value.slice(startIndex, endIndex);
});


const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage);
});


const paginationInfo = computed(() => {
  const startItem = (currentPage.value - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage.value * itemsPerPage, filteredData.value.length);
  return {
    startItem,
    endItem,
    totalItems: filteredData.value.length
  };
});


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


const loadTableData = async () => {
  if (!selectedTable.value) {
    tableData.value = [];
    tableColumns.value = [];
    currentPage.value = 1;
    return;
  }
  
  loadingTable.value = true;
  searchQuery.value = '';
  currentPage.value = 1;
  
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
    

    if (data.length > 0) {
      const allColumns = Object.keys(data[0]);
      

      const essentialColumns = {
        orders: ['order_id', 'user_name', 'user_email', 'product_name', 'total', 'status', 'created_at'],
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


const formatColumnName = (column) => {
  return column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


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
  

  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...';
  }
  
  return value;
};


const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};


watch(searchQuery, () => {
  currentPage.value = 1;
});


const navigateToAddProduct = () => {
  router.push('/dashboard/add-product');
};

const navigateToAddLicense = () => {
  router.push('/dashboard/add-license');
};


const handleMetricsUpdate = (metrics) => {
  chartMetrics.value = {
    totalRevenue: formatRupiah(metrics.totalRevenue || 0),
    totalOrders: (metrics.totalOrders || 0).toString(),
    avgOrderValue: formatRupiah(metrics.avgOrderValue || 0)
  };
};


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


onMounted(async () => {
  await initUser();
  
  if (!user.value) {
    router.push('/login');
    return;
  }


  if (user.value && user.value.account_type === 'user') {
    router.push('/home');
    return;
  }
  

  if ($mobileSession) {
    await $mobileSession.initializeMobileFeatures();
  }
  

  await loadAllData();
});



useHead({
  title: 'Admin Dashboard',
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'theme-color',
      content: '#1e2a3a'
    }
  ]
});
</script>

<style scoped>
@import '~/assets/css/dashboard/index.css';
</style>
