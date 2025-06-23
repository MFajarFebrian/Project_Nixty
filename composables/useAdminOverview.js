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
  const recentActivity = ref([]);
  const tablesInfo = ref({});

  // Computed
  const totalUsers = computed(() => statistics.value.users || 0);
  const totalProducts = computed(() => statistics.value.products || 0);
  const totalTransactions = computed(() => statistics.value.transactions || 0);
  const totalRevenue = computed(() => statistics.value.totalRevenue || 0);
  const activeProducts = computed(() => statistics.value.activeProducts || 0);
  const activeDeals = computed(() => statistics.value.activeDeals || 0);
  const adminUsers = computed(() => statistics.value.adminUsers || 0);
  const recentTransactionsCount = computed(() => statistics.value.recentTransactions || 0);

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

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch('/api/admin/overview', {
        headers: getAdminHeaders()
      });

      if (response.success) {
        statistics.value = response.data.statistics || {};
        recentActivity.value = response.data.recentActivity || [];
        tablesInfo.value = response.data.tables || {};
      } else {
        setError(response.message || 'Failed to fetch overview data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch overview data');
    } finally {
      loading.value = false;
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
      title: 'Total Users',
      value: totalUsers.value,
      icon: 'fas fa-users',
      color: 'blue',
      change: adminUsers.value > 0 ? `${adminUsers.value} admins` : null
    },
    {
      title: 'Products',
      value: totalProducts.value,
      icon: 'fas fa-box',
      color: 'green',
      change: activeProducts.value > 0 ? `${activeProducts.value} active` : null
    },
    {
      title: 'Transactions',
      value: totalTransactions.value,
      icon: 'fas fa-credit-card',
      color: 'purple',
      change: recentTransactionsCount.value > 0 ? `${recentTransactionsCount.value} this week` : null
    },
    {
      title: 'Revenue',
      value: formatCurrency(totalRevenue.value),
      icon: 'fas fa-chart-line',
      color: 'gold',
      change: activeDeals.value > 0 ? `${activeDeals.value} active deals` : null
    }
  ]);

  return {
    // State
    loading,
    error,
    statistics,
    recentActivity,
    tablesInfo,
    
    // Computed
    totalUsers,
    totalProducts,
    totalTransactions,
    totalRevenue,
    activeProducts,
    activeDeals,
    adminUsers,
    recentTransactionsCount,
    getQuickStats,
    
    // Methods
    clearError,
    fetchOverview,
    formatCurrency,
    formatDate,
    getStatusBadgeClass,
    getTableDisplayName,
    getTableIcon
  };
}
