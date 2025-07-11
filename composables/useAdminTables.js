import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminAuth } from './useAdminAuth';
import { useToast } from './useToast';

/**
 * Admin table management composable
 */
export function useAdminTables() {
  const { getAdminHeaders, checkAdminAccess } = useAdminAuth();
  const { success, error: showError } = useToast();
  
  // State
  const loading = ref(false);
  const error = ref(null);
  const tables = ref([]);
  const currentTable = ref(null);
  const allTableData = ref([]); // Store all data for client-side operations
  const tableColumns = ref([]);
  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const searchQuery = ref('');
  const sortBy = ref('id');
  const sortOrder = ref('asc');
  const showCsvUpload = ref(false);
  const tableRelations = ref({});

  const tableData = computed(() => {
    if (!allTableData.value) return [];
    
    let data = [...allTableData.value];
    
    // 1. Filter by search query
    if (searchQuery.value) {
      const lowerCaseQuery = searchQuery.value.toLowerCase();
      data = data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(lowerCaseQuery)
        )
      );
    }

    // 2. Sort data
    if (sortBy.value) {
      data.sort((a, b) => {
        let valA = a[sortBy.value];
        let valB = b[sortBy.value];

        // Gracefully handle nulls and different types
        if (valA == null) return 1;
        if (valB == null) return -1;
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3. Update pagination totals based on filtered data
    pagination.total = data.length;
    pagination.totalPages = Math.ceil(data.length / pagination.limit);

    // 4. Paginate data
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    
    return data.slice(start, end);
  });

  // Computed
  const hasData = computed(() => {
    return Array.isArray(tableData.value) && tableData.value.length > 0;
  });
  const isFirstPage = computed(() => pagination.page === 1);
  const isLastPage = computed(() => pagination.page >= pagination.totalPages);

  // Methods
  const clearError = () => {
    error.value = null;
  };

  const setError = (message) => {
    error.value = message;
    console.error('Admin Tables Error:', message);
  };

  // Fetch available tables
  const fetchTables = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch('/api/admin/tables', {
        headers: getAdminHeaders()
      });

      if (response.success) {
        tables.value = response.tables || [];
      } else {
        setError(response.message || 'Failed to fetch tables');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tables');
    } finally {
      loading.value = false;
    }
  };

  // Fetch table data
  const fetchTableData = async (tableName, { forceRefresh = false } = {}) => {
    try {
      if (!forceRefresh && allTableData.value.length > 0 && currentTable.value === tableName) {
        console.log('Using cached data for', tableName);
        pagination.page = 1; // Reset to first page when re-selecting a cached table
        return true;
      }
      
      checkAdminAccess();
      loading.value = true;
      clearError();
      
      console.log(`Fetching all data for table: ${tableName}`);

      // Fetch ALL data, remove pagination params for this main fetch
      const response = await $fetch(`/api/admin/tables/${tableName}`, {
        headers: getAdminHeaders(),
        query: {}
      });
      
      console.log('API Response (all data):', response);

      if (response && response.success) {
        currentTable.value = tableName;
        
        if (Array.isArray(response.data)) {
          allTableData.value = response.data;
          console.log(`Cached ${allTableData.value.length} records`);
        } else {
          console.error('API returned non-array data:', response.data);
          allTableData.value = [];
        }
        
        if (response.meta && Array.isArray(response.meta.columns)) {
          tableColumns.value = response.meta.columns;
        } else {
          console.error('API returned invalid columns data:', response.meta?.columns);
          tableColumns.value = [];
        }

        if (response.meta && response.meta.relations) {
          tableRelations.value = response.meta.relations;
        }
        
        // Reset pagination and let the computed property handle the view
        pagination.page = 1;
        
        return true;
      } else {
        const errorMsg = response?.message || 'Failed to fetch table data';
        console.error('API error:', errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch table data';
      console.error('Exception in fetchTableData:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Create new record
  const createRecord = async (tableName, data) => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch(`/api/admin/tables/${tableName}`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: data
      });

      if (response.success) {
        // Refresh table data
        await fetchTableData(tableName, { forceRefresh: true });
        success('Record created successfully!');
        return response.data;
      } else {
        const errorMessage = response.data?.errors
          ? response.data.errors.join(', ')
          : response.message || 'Failed to create record';
        setError(errorMessage);
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create record';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update record
  const updateRecord = async (tableName, id, data) => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch(`/api/admin/tables/${tableName}/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: data
      });

      if (response.success) {
        // Refresh table data
        await fetchTableData(tableName, { forceRefresh: true });
        success('Record updated successfully!');
        return response.data;
      } else {
        const errorMessage = response.data?.errors
          ? response.data.errors.join(', ')
          : response.message || 'Failed to update record';
        setError(errorMessage);
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update record';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete record
  const deleteRecord = async (tableName, id) => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch(`/api/admin/tables/${tableName}/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (response.success) {
        // Refresh table data
        await fetchTableData(tableName, { forceRefresh: true });
        success('Record deleted successfully!');
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to delete record';
        setError(errorMessage);
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete record';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      pagination.page = page;
    }
  };

  const nextPage = () => {
    if (!isLastPage.value) {
      pagination.page++;
    }
  };

  const prevPage = () => {
    if (!isFirstPage.value) {
      pagination.page--;
    }
  };

  const search = (query) => {
    searchQuery.value = query;
    pagination.page = 1; // Reset to first page on new search
  };

  const sort = (column) => {
    if (sortBy.value === column) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = column;
      sortOrder.value = 'asc';
    }
    pagination.page = 1; // Reset to first page on new sort
  };

  const resetFilters = () => {
    searchQuery.value = '';
    sortBy.value = 'id';
    sortOrder.value = 'asc';
    pagination.page = 1;
  };

  // New method to force refresh
  const refreshData = () => {
    if (currentTable.value) {
      fetchTableData(currentTable.value, { forceRefresh: true });
    }
  };

  const changeLimit = (newLimit) => {
    pagination.limit = newLimit;
    pagination.page = 1; // Go to first page when limit changes
  };

  // Initialize tables on mount
  onMounted(() => {
    fetchTables();
  });

  return {
    // State
    loading,
    error,
    tables,
    currentTable,
    tableData,
    tableColumns,
    tableRelations,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    showCsvUpload,
    
    // Computed
    hasData,
    isFirstPage,
    isLastPage,
    
    // Methods
    clearError,
    fetchTables,
    fetchTableData,
    createRecord,
    updateRecord,
    deleteRecord,
    goToPage,
    nextPage,
    prevPage,
    search,
    sort,
    resetFilters,
    refreshData,
    changeLimit
  };
}
