import { ref, computed } from 'vue';
import { useAdminAuth } from './useAdminAuth';

/**
 * Admin dashboard overview composable
 */
export function useAdminOverview() {
  const { getAdminHeaders, checkAdminAccess } = useAdminAuth();
  
  // State
  const loading = ref(false);
  const error = ref(null);
  const statistics = ref({});
  const percentChange = computed(() => statistics.value.percentChange || {});
  const recentActivity = ref([]);
  const tablesInfo = ref({});
  const products = ref([]);
  const productsLoading = ref(false);

  // Computed
  const totalUsers = computed(() => statistics.value.users || 0);
  const totalProducts = computed(() => statistics.value.products || 0);
  const totalTransactions = computed(() => statistics.value.transactions || 0);
  const totalRevenue = computed(() => statistics.value.totalRevenue || 0);
  const activeProducts = computed(() => statistics.value.activeProducts || 0);
  const activeDeals = computed(() => statistics.value.activeDeals || 0);
  // New metrics for dashboard
  const activeUsersCount = computed(() => statistics.value.activeUsers || 0);
  const productsSold = computed(() => statistics.value.productsSold || statistics.value.usedLicenses || 0);
  const totalOrders = computed(() => totalTransactions.value); // alias for clarity
  const adminUsers = computed(() => statistics.value.adminUsers || 0);
  const recentTransactionsCount = computed(() => statistics.value.recentTransactions || 0);

  const ordersChange = computed(() => percentChange.value.totalOrders);
  const activeUsersChange = computed(() => percentChange.value.activeUsers);
  const productsSoldChange = computed(() => percentChange.value.productsSold);
  const revenueChange = computed(() => percentChange.value.totalRevenue);

  const formatPercent = (val) => {
    if (val === null || val === undefined) return '-';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}%`;
  };
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'settlement': 'success',
      'pending': 'warning',
      'cancel': 'danger',
      'expire': 'secondary',
      'active': 'success',
      'inactive': 'secondary'
    };
    return statusClasses[status] || 'secondary';
  };

  // Methods
  const clearError = () => {
    error.value = null;
  };

  const setError = (message) => {
    error.value = message;
    console.error('Admin Overview Error:', message);
  };

  // Internal caching helpers
  let lastFetched = 0;
  let cachedParams = '';
  let pendingPromise = null;

  // Fetch overview data with simple caching/ throttling
  const fetchOverview = async (startDate, endDate, { forceRefresh = false } = {}) => {
    try {
      // Serialize params to identify identical requests
      const paramsKey = `${startDate || ''}|${endDate || ''}`;
      const now = Date.now();

      // If identical request made within last 5s and not forced, return immediately
      if (!forceRefresh && paramsKey === cachedParams && now - lastFetched < 5000) {
        return true; // Use existing state
      }

      // If a fetch for same params is already ongoing, reuse the same promise
      if (!forceRefresh && pendingPromise) {
        return pendingPromise;
      }
      checkAdminAccess();
      loading.value = true;
      clearError();

      const queryParams = new URLSearchParams();
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        queryParams.append('startDate', start.toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryParams.append('endDate', end.toISOString());
      }

      const url = queryParams.toString() ? `/api/admin/overview?${queryParams.toString()}` : '/api/admin/overview';

      // Store pending promise so subsequent calls can await instead of refetching
      pendingPromise = (async () => {
        try {
          console.log('Fetching admin overview with date range:', { startDate, endDate });
          console.log('API URL:', url);

          const response = await $fetch(url, {
            headers: getAdminHeaders()
          });
          console.log('Raw Admin Overview API Response:', response);

          if (response.success) {
            statistics.value = {
              ...(response.data.statistics || {}),
              percentChange: response.data.percentChange || {}
            };
            recentActivity.value = response.data.recentActivity || [];
            tablesInfo.value = response.data.tables || {};

            console.log('Processed overview data:', {
              statistics: statistics.value,
              recentActivity: recentActivity.value,
              tablesInfo: tablesInfo.value
            });
            return true;
          } else {
            setError(response.message || 'Failed to fetch overview data');
            return false;
          }
        } catch (err) {
          setError(err.message || 'Failed to fetch overview data');
          return false;
        } finally {
          loading.value = false;
        }
      })();

      const result = await pendingPromise;
      // Cache timestamp & params after successful fetch
      if (result) {
        lastFetched = Date.now();
        cachedParams = paramsKey;
      }
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch overview data');
      return false;
    }
  };

  // Get table display name
  const getTableDisplayName = (tableName) => {
    const displayNames = {
      'users': 'Users',
      'products': 'Products',
      'categories': 'Categories',
      'announcements': 'Announcements',
      'deals': 'Deals',
      'hero_slides': 'Hero Slides',
      'transactions': 'Transactions',
      'product_licenses': 'Product Licenses'
    };
    return displayNames[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1);
  };

  // Get table icon
  const getTableIcon = (tableName) => {
    const icons = {
      'users': 'fas fa-users',
      'products': 'fas fa-box',
      'categories': 'fas fa-tags',
      'announcements': 'fas fa-bullhorn',
      'deals': 'fas fa-percent',
      'hero_slides': 'fas fa-images',
      'transactions': 'fas fa-credit-card',
      'product_licenses': 'fas fa-key'
    };
    return icons[tableName] || 'fas fa-table';
  };

  // Get quick stats for dashboard cards
  const getQuickStats = computed(() => [
    {
      title: 'Total Orders',
      value: totalOrders.value,
      icon: 'fas fa-shopping-cart',
      color: 'purple',
      change: formatPercent(ordersChange.value)
    },
    {
      title: 'Active Users',
      value: activeUsersCount.value,
      icon: 'fas fa-users',
      color: 'blue',
      change: formatPercent(activeUsersChange.value)
    },
    {
      title: 'Products Sold',
      value: productsSold.value,
      icon: 'fas fa-box',
      color: 'green',
      change: formatPercent(productsSoldChange.value)
    },
    {
      title: 'Revenue',
      value: formatCurrency(totalRevenue.value),
      icon: 'fas fa-chart-line',
      color: 'gold',
      change: formatPercent(revenueChange.value)
    }
  ]);

  // Fetch products data with stock information
  async function loadProducts() {
    try {
      products.value = [];
      productsLoading.value = true;
      
      // Fetch products with stock data
      const response = await $fetch('/api/admin/tables/products', {
        query: {
          orderBy: 'name',
          orderDir: 'asc',
          pageSize: 1000 // Get all products for accurate overview
        }
      });
      
      if (response && response.success && Array.isArray(response.data)) {
        // Process products data
        products.value = response.data.map(product => ({
          ...product,
          // Gunakan available_stock jika ada, atau fallback ke stock lama
          stock: product.available_stock !== undefined ? product.available_stock : (product.stock || 0),
          // Tambahkan data lisensi
          total_licenses: product.total_licenses || 0,
          used_licenses: product.used_licenses || 0,
          expired_licenses: product.expired_licenses || 0,
          reserved_licenses: product.reserved_licenses || 0
        }));
      } else {
        throw new Error('Invalid products data received');
      }
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      productsLoading.value = false;
    }
  }

  return {
    // State
    loading,
    error,
    statistics,
    percentChange,
    recentActivity,
    tablesInfo,
    products,
    productsLoading,
    
    // Computed
    totalUsers,
    totalProducts,
    totalTransactions,
    totalOrders,
    totalRevenue,
    activeProducts,
    activeDeals,
    adminUsers,
    activeUsersCount,
    productsSold,
    ordersChange,
    activeUsersChange,
    productsSoldChange,
    revenueChange,
    recentTransactionsCount,
    getQuickStats,
    
    // Methods
    clearError,
    fetchOverview,
    formatCurrency,
    formatDate,
    getStatusBadgeClass,
    getTableDisplayName,
    getTableIcon,
    loadProducts
  };
}
