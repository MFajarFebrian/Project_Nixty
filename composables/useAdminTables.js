import { ref, reactive, computed } from 'vue';
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
  const tableData = ref([]);
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

  // Computed
  const hasData = computed(() => tableData.value.length > 0);
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
  const fetchTableData = async (tableName, options = {}) => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const params = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        search: options.search || searchQuery.value,
        sortBy: options.sortBy || sortBy.value,
        sortOrder: options.sortOrder || sortOrder.value
      };

      const response = await $fetch(`/api/admin/tables/${tableName}`, {
        headers: getAdminHeaders(),
        query: params
      });

      if (response.success) {
        currentTable.value = tableName;
        tableData.value = response.data.records || [];
        tableColumns.value = response.data.columns || [];
        
        // Update pagination
        Object.assign(pagination, response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch table data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch table data');
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
        await fetchTableData(tableName);
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
        await fetchTableData(tableName);
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
        await fetchTableData(tableName);
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
      if (currentTable.value) {
        fetchTableData(currentTable.value);
      }
    }
  };

  const nextPage = () => {
    if (!isLastPage.value) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (!isFirstPage.value) {
      goToPage(pagination.page - 1);
    }
  };

  // Search and sort
  const search = (query) => {
    searchQuery.value = query;
    pagination.page = 1; // Reset to first page
    if (currentTable.value) {
      fetchTableData(currentTable.value);
    }
  };

  const sort = (column, order = 'asc') => {
    sortBy.value = column;
    sortOrder.value = order;
    if (currentTable.value) {
      fetchTableData(currentTable.value);
    }
  };

  const resetFilters = () => {
    searchQuery.value = '';
    sortBy.value = 'id';
    sortOrder.value = 'asc';
    pagination.page = 1;
    if (currentTable.value) {
      fetchTableData(currentTable.value);
    }
  };

  return {
    // State
    loading,
    error,
    tables,
    currentTable,
    tableData,
    tableColumns,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    
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
    resetFilters
  };
}
