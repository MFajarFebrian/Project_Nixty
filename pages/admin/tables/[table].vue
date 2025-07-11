<template>
  <div class="table-management">
    <!-- Header -->
    <div class="table-header">
      <div class="header-content">
        <h1 class="table-title">
          <i :class="getTableIcon(tableName)"></i>
          {{ tableDisplayName }} Management
        </h1>
      </div>
      
      <div class="header-actions">
        <button v-if="tableName === 'product_licenses'" @click="showCsvUpload = true" class="upload-btn">
          <i class="fas fa-file-upload"></i>
          Import CSV
        </button>
        <button @click="showCreateModal = true" class="create-btn">
          <i class="fas fa-plus"></i>
          Add New {{ tableDisplayName.slice(0, -1) }}
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="table-controls">
      <div class="search-section">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchInput"
            @input="handleSearch"
            type="text"
            placeholder="Search records..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="filter-section">
        <CustomSelect
          v-model="selectedLimit"
          :options="limitOptions"
          @update:modelValue="changeLimit"
        />
        
        <button @click="refreshData" class="refresh-btn">
          <i class="fas fa-sync"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading {{ tableDisplayName.toLowerCase() }}...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Data</h3>
        <p>{{ error }}</p>
        <button @click="loadTableData" class="retry-btn">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>
    </div>

    <!-- Table Content -->
    <div v-else class="table-container">
      <!-- Table -->
      <div 
        ref="tableWrapperRef"
        class="table-wrapper"
        @mousedown="onMouseDown"
        @mouseleave="onMouseLeave"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
      >
        <table v-if="hasData" class="data-table">
          <thead>
            <tr>
              <th 
                v-for="column in visibleColumns" 
                :key="column.name"
                @click="handleSort(column.name)"
                class="sortable-header"
                :class="{ 'sorted': sortBy === column.name }"
              >
                {{ formatColumnName(column.name) }}
                <i 
                  v-if="sortBy === column.name"
                  :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  class="sort-icon"
                ></i>
                <i v-else class="fas fa-sort sort-icon inactive"></i>
              </th>
              <th class="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in tableData" :key="record.id" class="data-row">
              <td v-for="column in visibleColumns" :key="column.name" class="data-cell" :data-column="column.name">
                <span v-if="column.name === 'password'">••••••••</span>
                <span v-else-if="column.name === 'email'" class="email-cell">
                  {{ record[column.name] }}
                </span>
                <span v-else-if="isCurrencyColumn(column)" class="currency-value">
                  {{ formatCurrency(record[column.name]) }}
                </span>
                <span v-else-if="isDateColumn(column)" class="date-value">
                  {{ formatDate(record[column.name]) }}
                </span>
                <span v-else-if="isBooleanColumn(column)" class="boolean-value">
                  <i :class="record[column.name] ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
                </span>
                <span v-else-if="isStatusColumn(column)" class="status-column">
                  <span class="status-badge" :class="`status-${record[column.name]?.toLowerCase()}`">
                    {{ formatStatus(record[column.name]) }}
                  </span>
                </span>
                <span v-else-if="isLongText(record[column.name])" class="long-text" :title="record[column.name]">
                  {{ truncateText(record[column.name]) }}
                </span>
                <span v-else>{{ record[column.name] }}</span>
              </td>
              <td class="actions-cell">
                <button @click="editRecord(record)" class="edit-btn" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(record)" class="delete-btn" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- No Data State -->
        <div v-if="!hasData && !loading" class="no-data">
          <i class="fas fa-inbox"></i>
          <h3>No {{ tableDisplayName }} Found</h3>
          <p v-if="searchQuery">Try adjusting your search criteria</p>
          <p v-else>Get started by adding your first {{ tableDisplayName.slice(0, -1).toLowerCase() }}</p>
          <button @click="showCreateModal = true" class="create-btn">
            <i class="fas fa-plus"></i>
            Add {{ tableDisplayName.slice(0, -1) }}
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="hasData" class="pagination-container">
        <div class="pagination-info">
          Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} results
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="prevPage" 
            :disabled="isFirstPage"
            class="pagination-btn"
            :class="{ disabled: isFirstPage }"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="page-btn"
              :class="{ active: page === pagination.page }"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="isLastPage"
            class="pagination-btn"
            :class="{ disabled: isLastPage }"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <RecordModal
      v-if="showCreateModal || showEditModal"
      :show="showCreateModal || showEditModal"
      :mode="showCreateModal ? 'create' : 'edit'"
      :table-name="tableName"
      :columns="tableColumns"
      :record="editingRecord"
      :relations="tableRelations"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      title="Confirm Delete"
      :message="`Are you sure you want to delete this ${tableDisplayName.slice(0, -1).toLowerCase()}? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-class="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Csv Upload Modal -->
    <CsvUploadModal
      v-if="showCsvUpload"
      :show="showCsvUpload"
      @close="showCsvUpload = false"
      @upload-complete="handleUploadComplete"
    />

    <!-- Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRoute } from '#app';
import { useAdminAuth } from '~/composables/useAdminAuth';
import { useAdminTables } from '~/composables/useAdminTables';
import { useAdminOverview } from '~/composables/useAdminOverview';
import { useRuntimeConfig } from '#app';
import { useUtils } from '~/composables/useUtils';

// Components
import RecordModal from '~/components/admin/RecordModal.vue';
import ConfirmModal from '~/components/admin/ConfirmModal.vue';
import ToastNotifications from '~/components/admin/ToastNotifications.vue';
import CsvUploadModal from '~/components/admin/CsvUploadModal.vue';
import CustomSelect from '~/components/admin/CustomSelect.vue';

// Set page meta
definePageMeta({
  layout: 'default'
});

// Route and auth
const route = useRoute();
const { requireAdmin } = useAdminAuth();

// Get table name from route
const tableName = ref(route.params.table);
const tableDisplayName = computed(() => {
  const { getTableDisplayName } = useAdminOverview();
  return getTableDisplayName(tableName.value);
});

// Admin tables composable
const {
  loading,
  error,
  tableData,
  tableColumns,
  tableRelations,
  pagination,
  searchQuery,
  sortBy,
  sortOrder,
  hasData,
  isFirstPage,
  isLastPage,
  showCsvUpload,
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
  changeLimit,
} = useAdminTables();

// Utils composable
const {
  getTableIcon,
  formatColumnName,
  isDateColumn,
  isBooleanColumn,
  isStatusColumn,
  isCurrencyColumn,
  isLongText,
  truncateText,
  formatDate,
  formatStatus,
  formatCurrency,
} = useUtils();

// Local state
const searchInput = ref(searchQuery.value);
const selectedLimit = ref(20);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingRecord = ref(null);
const deletingRecord = ref(null);

// Drag-scroll logic
const tableWrapperRef = ref(null);
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

const onMouseDown = (e) => {
  console.log('Mouse down on table wrapper');
  isDragging = true;
  startX = e.pageX - tableWrapperRef.value.offsetLeft;
  scrollLeft = tableWrapperRef.value.scrollLeft;
  tableWrapperRef.value.classList.add('dragging');
  e.preventDefault();
};

const onMouseLeave = () => {
  console.log('Mouse leave table wrapper');
  isDragging = false;
  if (tableWrapperRef.value) {
    tableWrapperRef.value.classList.remove('dragging');
  }
};

const onMouseUp = () => {
  console.log('Mouse up on table wrapper');
  isDragging = false;
  if (tableWrapperRef.value) {
    tableWrapperRef.value.classList.remove('dragging');
  }
};

const onMouseMove = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - tableWrapperRef.value.offsetLeft;
  const walk = (x - startX) * 1.5; // scroll speed
  tableWrapperRef.value.scrollLeft = scrollLeft - walk;
};

// Computed
const visibleColumns = computed(() => {
  console.log('Computing visibleColumns with tableColumns:', tableColumns.value);
  if (!tableColumns.value || !Array.isArray(tableColumns.value)) {
    console.warn('tableColumns is not an array:', tableColumns.value);
    return [];
  }
  
  return tableColumns.value.filter(col => {
    // Selalu tampilkan kolom ID
    if (col.name === 'id') return true;
    
    // Jangan tampilkan kolom yang auto_increment selain ID
    return !col.extra?.includes('auto_increment');
  });
});

const visiblePages = computed(() => {
  const current = pagination.page;
  const total = pagination.totalPages;
  const delta = 2;
  const range = [];
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  if (current - delta > 2) {
    range.unshift('...');
  }
  if (current + delta < total - 1) {
    range.push('...');
  }
  
  range.unshift(1);
  if (total > 1) {
    range.push(total);
  }
  
  return range;
});

const limitOptions = computed(() => [
  { value: 10, label: '10 per page' },
  { value: 20, label: '20 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' },
]);

// Methods

const handleSearch = () => {
  search(searchInput.value);
};

const clearSearch = () => {
  searchInput.value = '';
  search('');
};

const handleSort = (column) => {
  sort(column);
};

const editRecord = (record) => {
  editingRecord.value = { ...record };
  showEditModal.value = true;
};

const confirmDelete = (record) => {
  deletingRecord.value = record;
  showDeleteModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingRecord.value = null;
};

const handleSave = async (data) => {
  try {
    if (data.id) {
      // Update
      await updateRecord(tableName.value, data.id, data.record);
    } else {
      // Create
      await createRecord(tableName.value, data.record);
    }
    closeModal();
  } catch (err) {
    console.error('Error saving record:', err);
    // The error is already handled and displayed by useAdminTables and useToast
    // No need to re-throw or display here, just prevent modal from closing
  }
};

const handleDelete = async () => {
  if (deletingRecord.value) {
    await deleteRecord(tableName.value, deletingRecord.value.id);
    showDeleteModal.value = false;
    deletingRecord.value = null;
  }
};

const handleUploadComplete = () => {
  refreshData();
};

const loadTableData = () => {
  fetchTableData(tableName.value, { forceRefresh: true });
};

// Tambahkan method untuk memaksa refresh data
const forceRefreshData = async () => {
  console.log('Force refreshing data...');
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500)); // Delay sedikit untuk efek visual
  await loadTableData();
  loading.value = false;
};

// Tambahkan watch untuk debug tableData
watch(tableData, (newData) => {
  console.log('tableData changed:', newData);
  console.log('hasData is now:', hasData.value);
}, { deep: true });

// Watch for route changes
watch(() => route.params.table, async (newTable) => {
  if (newTable) {
    try {
      await loadTableData();
    } catch (err) {
      console.error('Error loading table data for route change:', err);
      error.value = err.message || 'Failed to load table data';
    }
  }
});

// Get runtime config
const config = useRuntimeConfig();
const isDevelopment = computed(() => config.public.nodeEnv === 'development');

// Initialize
onMounted(async () => {
  try {
    console.log('Table component mounted, checking admin access...');
    if (!requireAdmin()) {
      console.error('Admin access required');
      return;
    }

    console.log('Admin access confirmed, loading table data...');
    await loadTableData();
    console.log('Initial table data loaded');
    
    // Jika data tidak muncul, coba load ulang setelah delay singkat
    if (!hasData.value && !error.value) {
      console.log('No data loaded on first attempt, trying again after delay...');
      setTimeout(async () => {
        console.log('Reloading data after delay');
        await loadTableData();
      }, 1000);
    }
  } catch (err) {
    console.error('Error initializing table management:', err);
    error.value = err.message || 'Failed to initialize table management';
  }

  // Add document event listeners for drag-scroll
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mouseleave', onMouseLeave);
});

// Cleanup event listeners
onUnmounted(() => {
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mouseleave', onMouseLeave);
});
</script>

<style scoped>
@import '~/assets/css/pages/admin-table-management.css';
</style>
