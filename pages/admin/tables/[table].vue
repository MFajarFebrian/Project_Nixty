<template>
  <div class="table-management">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumb :current-table="tableName" />

    <!-- Header -->
    <div class="table-header">
      <div class="header-content">
        <h1 class="table-title">
          <i :class="getTableIcon(tableName)"></i>
          {{ tableDisplayName }} Management
        </h1>
      </div>
      
      <div class="header-actions">
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
        <select v-model="selectedLimit" @change="changeLimit" class="limit-select">
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
        
        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-undo"></i>
          Reset
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
      <div class="table-wrapper">
        <table class="data-table">
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
              <td v-for="column in visibleColumns" :key="column.name" class="data-cell">
                <span v-if="column.name === 'password'">••••••••</span>
                <span v-else-if="isDateColumn(column)" class="date-value">
                  {{ formatDate(record[column.name]) }}
                </span>
                <span v-else-if="isBooleanColumn(column)" class="boolean-value">
                  <i :class="record[column.name] ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
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

    <!-- Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminAuth } from '~/composables/useAdminAuth';
import { useAdminTables } from '~/composables/useAdminTables';
import { useAdminOverview } from '~/composables/useAdminOverview';

// Components
import AdminBreadcrumb from '~/components/admin/AdminBreadcrumb.vue';
import RecordModal from '~/components/admin/RecordModal.vue';
import ConfirmModal from '~/components/admin/ConfirmModal.vue';
import ToastNotifications from '~/components/admin/ToastNotifications.vue';

// Set page meta
definePageMeta({
  layout: 'default'
});

// Route and auth
const route = useRoute();
const { requireAdmin } = useAdminAuth();

// Get table name from route
const tableName = computed(() => route.params.table);
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
  pagination,
  searchQuery,
  sortBy,
  sortOrder,
  hasData,
  isFirstPage,
  isLastPage,
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
} = useAdminTables();

// Local state
const searchInput = ref('');
const selectedLimit = ref(20);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingRecord = ref(null);
const deletingRecord = ref(null);

// Computed
const visibleColumns = computed(() => {
  return tableColumns.value.filter(col => 
    !col.extra.includes('auto_increment') || col.name === 'id'
  );
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

// Methods
const { getTableIcon } = useAdminOverview();

const formatColumnName = (name) => {
  return name.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const isDateColumn = (column) => {
  return column.type.includes('timestamp') || column.type.includes('datetime') ||
         column.name.includes('_at') || column.name.includes('date');
};

const isBooleanColumn = (column) => {
  return column.type.includes('tinyint(1)') || column.name.startsWith('is_');
};

const isLongText = (text) => {
  return text && typeof text === 'string' && text.length > 50;
};

const truncateText = (text, length = 50) => {
  if (!text || typeof text !== 'string') return text;
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleSearch = () => {
  search(searchInput.value);
};

const clearSearch = () => {
  searchInput.value = '';
  search('');
};

const changeLimit = () => {
  pagination.limit = parseInt(selectedLimit.value);
  pagination.page = 1;
  loadTableData();
};

const handleSort = (column) => {
  const newOrder = (sortBy.value === column && sortOrder.value === 'asc') ? 'desc' : 'asc';
  sort(column, newOrder);
};

const loadTableData = () => {
  fetchTableData(tableName.value);
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
    if (showCreateModal.value) {
      await createRecord(tableName.value, data);
    } else if (showEditModal.value && editingRecord.value) {
      await updateRecord(tableName.value, editingRecord.value.id, data);
    }
    closeModal();
  } catch (error) {
    // Error is handled by the composable
  }
};

const handleDelete = async () => {
  try {
    if (deletingRecord.value) {
      await deleteRecord(tableName.value, deletingRecord.value.id);
    }
    showDeleteModal.value = false;
    deletingRecord.value = null;
  } catch (error) {
    // Error is handled by the composable
  }
};

// Watch for route changes
watch(() => route.params.table, (newTable) => {
  if (newTable) {
    loadTableData();
  }
});

// Initialize
onMounted(async () => {
  if (!requireAdmin()) {
    return;
  }

  await loadTableData();
});
</script>

<style scoped>
@import '~/assets/css/pages/admin-table-management.css';
</style>
