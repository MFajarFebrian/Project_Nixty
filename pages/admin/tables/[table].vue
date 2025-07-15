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
        <button @click="goBackToDashboard" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
        <button v-if="tableName === 'product_licenses'" @click="showCsvUpload = true" class="upload-btn">
          <i class="fas fa-file-upload"></i>
          Import
        </button>
        <button @click="showCreateModal = true" class="create-btn">
          <i class="fas fa-plus"></i>
          Add
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
<td v-for="column in visibleColumns" :key="column.name" class="data-cell" :data-column="column.name" @dblclick="tableName !== 'users' && tableName !== 'transactions' && (shouldDisplayAsImage(record[column.name]) || shouldColumnDisplayAsImage(column.name) ? handleImageCellClick(record, column) : setEditingCell(record, column, $event))">
                <input
                  v-if="isEditing(record, column)"
                  :value="record[column.name]"
                  class="inline-edit-input"
                  @blur="saveCell(record, column, $event.target.value)"
                  @keyup.enter="saveCell(record, column, $event.target.value)"
                  @keyup.esc="editingCell = null"
                />
                <template v-else>
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
                  <div v-else-if="shouldDisplayAsImage(record[column.name]) || shouldColumnDisplayAsImage(column.name)" class="image-cell" :class="{ 'has-image': record[column.name] && record[column.name].trim() !== '' }">
                    <template v-if="record[column.name] && record[column.name].trim() !== ''">
                      <img :src="getImageUrl(record[column.name])" :alt="formatColumnName(column.name)" class="table-image" @error="handleImageError($event)" />
                      <span class="error-image-placeholder" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Failed to load image</span>
                      </span>
                    </template>
                    <template v-else>
                      <div class="empty-image-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Double-click to upload</span>
                      </div>
                    </template>
                  </div>
                  <span v-else-if="isLongText(record[column.name])" class="long-text" :title="record[column.name]">
                    {{ truncateText(record[column.name]) }}
                  </span>
                  <span v-else :class="{ 'empty-cell': !record[column.name] }">
                    {{ record[column.name] || '-' }}
                  </span>
                </template>
              </td>
              <td class="actions-cell">
                <button v-if="tableName !== 'users' && tableName !== 'transactions'" @click="editRecord(record)" class="edit-btn" title="Edit">
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
            Add
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

    <!-- Image Upload Modal -->
    <ImageUploadModal
      v-if="showImageUploadModal"
      :show="showImageUploadModal"
      :record="editingRecord"
      :tableName="tableName"
      @close="showImageUploadModal = false"
      @save="saveImage"
    />

    <!-- Image Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showImageDeleteModal"
      :show="showImageDeleteModal"
      title="Delete Image"
      :message="`Are you sure you want to delete this image? This action cannot be undone.`"
      confirm-text="Delete Image"
      confirm-class="danger"
      @confirm="handleImageDelete"
      @cancel="showImageDeleteModal = false"
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
import { useRoute, useRouter } from '#app';
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
import ImageUploadModal from '~/components/admin/ImageUploadModal.vue';

// Set page meta
definePageMeta({
  layout: 'default'
});

// Route and auth
const route = useRoute();
const router = useRouter();
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
const showImageUploadModal = ref(false);
const showImageDeleteModal = ref(false);
const editingRecord = ref(null);
const deletingRecord = ref(null);
const deletingImageRecord = ref(null);
const editingCell = ref(null);

// Drag-scroll logic
const tableWrapperRef = ref(null);
let isDragging = false;
let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

const onMouseDown = (e) => {
  // Don't start dragging if clicking on interactive elements
  if (e.target.closest('button, input, a, .sortable-header')) {
    return;
  }
  
  // Check if we're clicking on empty space in the table wrapper
  // or on table elements that aren't data cells
  const isOnTableWrapper = e.target === tableWrapperRef.value;
  const isOnTable = e.target.closest('table') && !e.target.closest('.data-cell');
  const isOnEmptySpace = e.target.classList.contains('table-wrapper') || 
                        e.target.tagName === 'TABLE' || 
                        e.target.tagName === 'THEAD' || 
                        e.target.tagName === 'TBODY' || 
                        e.target.tagName === 'TR';
  
  if (!isOnTableWrapper && !isOnTable && !isOnEmptySpace) {
    return;
  }
  
  isDragging = true;
  startX = e.pageX;
  startY = e.pageY;
  scrollLeft = tableWrapperRef.value.scrollLeft;
  scrollTop = tableWrapperRef.value.scrollTop;
  tableWrapperRef.value.style.cursor = 'grabbing';
  tableWrapperRef.value.style.userSelect = 'none';
  e.preventDefault();
};

const onMouseLeave = () => {
  isDragging = false;
  if (tableWrapperRef.value) {
    tableWrapperRef.value.style.cursor = 'grab';
  }
};

const onMouseUp = () => {
  isDragging = false;
  if (tableWrapperRef.value) {
    tableWrapperRef.value.style.cursor = 'grab';
  }
};

const onMouseMove = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX;
  const y = e.pageY;
  const walkX = (x - startX) * 1; // horizontal scroll speed
  const walkY = (y - startY) * 1; // vertical scroll speed
  tableWrapperRef.value.scrollLeft = scrollLeft - walkX;
  tableWrapperRef.value.scrollTop = scrollTop - walkY;
};

// Helper function to detect if a value should be displayed as an image
const shouldDisplayAsImage = (value) => {
  if (!value || typeof value !== 'string') return false;
  
  const lowerValue = value.toLowerCase().trim();
  
  // Check for empty or placeholder values
  if (lowerValue === '' || lowerValue === 'null' || lowerValue === 'undefined') {
    return false;
  }
  
  // Check for image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif', '.avif', '.jfif'];
  if (imageExtensions.some(ext => lowerValue.includes(ext))) {
    return true;
  }
  
  // Check for data URLs
  if (lowerValue.startsWith('data:image/')) {
    return true;
  }
  
  // Check for common image hosting patterns
  const imagePatterns = [
    '/images/',
    '/uploads/',
    '/assets/',
    '/media/',
    '/pictures/',
    '/photos/',
    '/avatars/',
    '/thumbnails/',
    'cloudinary.com',
    'amazonaws.com',
    'imgur.com',
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'imagekit.io',
    'res.cloudinary.com'
  ];
  
  if (imagePatterns.some(pattern => lowerValue.includes(pattern))) {
    return true;
  }
  
  // Check if it's a URL that starts with http and contains image-like patterns
  if (lowerValue.startsWith('http') && (lowerValue.includes('image') || lowerValue.includes('photo') || lowerValue.includes('pic'))) {
    return true;
  }
  
  // Check if it's a path that starts with / and looks like an image
  if (lowerValue.startsWith('/') && (lowerValue.length > 10)) {
    return true;
  }
  
  return false;
};

// Helper function to detect if a column should be treated as an image column
const shouldColumnDisplayAsImage = (columnName) => {
  if (!columnName || typeof columnName !== 'string') return false;
  
  const lowerColumnName = columnName.toLowerCase();
  const imageColumnNames = [
    'image', 'image_url', 'imageurl', 'img', 'img_url', 'imgurl',
    'avatar', 'avatar_url', 'avatarurl', 'profile_image', 'profile_picture',
    'photo', 'photo_url', 'photourl', 'picture', 'picture_url', 'pictureurl',
    'banner', 'banner_url', 'bannerurl', 'cover', 'cover_image', 'cover_url',
    'logo', 'logo_url', 'logourl', 'icon', 'icon_url', 'iconurl',
    'thumbnail', 'thumbnail_url', 'thumbnailurl', 'thumb', 'thumb_url',
    'poster', 'poster_url', 'posterurl', 'featured_image', 'featured_img'
  ];
  
  return imageColumnNames.some(imageName => lowerColumnName.includes(imageName));
};

// Helper function to get full image URL
const getImageUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  
  // If it's already a full URL, return as is
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  
  // If it's a relative path, prepend the base URL
  if (value.startsWith('/')) {
    // Get the current origin (protocol + domain + port)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${value}`;
  }
  
  return value;
};

// Helper function to handle image loading errors
const handleImageError = (event) => {
  const img = event.target;
  const errorSpan = img.nextElementSibling;
  
  img.style.display = 'none';
  if (errorSpan && errorSpan.classList.contains('error-image-placeholder')) {
    errorSpan.style.display = 'flex';
  }
};

// Event handlers for opening and saving image modal
const openImageUpload = (record) => {
  editingRecord.value = { ...record };
  showImageUploadModal.value = true;
};

// Handler for image cell double-click
const handleImageCellClick = (record, column) => {
  const imageValue = record[column.name];
  
  // Check if there's an existing image
  if (imageValue && imageValue.trim() !== '') {
    // Show delete confirmation modal for existing image
    deletingImageRecord.value = { record, column };
    showImageDeleteModal.value = true;
  } else {
    // Open image upload modal for empty cell
    openImageUpload(record);
  }
};

// Handler for confirming image deletion
const handleImageDelete = async () => {
  if (deletingImageRecord.value) {
    const { record, column } = deletingImageRecord.value;
    try {
      // Clear the image field
      await updateRecord(tableName.value, record.id, { [column.name]: '' });
      showImageDeleteModal.value = false;
      deletingImageRecord.value = null;
      
      // Refresh the table data to update the UI
      await refreshData();
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  }
};

const saveImage = async ({ id, record }) => {
  try {
    await updateRecord(tableName.value, id, record);
    showImageUploadModal.value = false;
  } catch (err) {
    console.error('Error updating image:', err);
  }
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

// Method untuk kembali ke dashboard admin
const goBackToDashboard = () => {
  router.push('/admin');
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


const setEditingCell = (record, column, event) => {
  if (column.name === 'id' || column.name.includes('_at') || column.name === 'password') {
    return; // Don't allow editing for these columns
  }
  editingCell.value = { recordId: record.id, columnName: column.name };
  nextTick(() => {
    const input = event.currentTarget.querySelector('.inline-edit-input');
    if (input) {
      input.focus();
    }
  });
};

const isEditing = (record, column) => {
  return editingCell.value && editingCell.value.recordId === record.id && editingCell.value.columnName === column.name;
};

const saveCell = async (record, column, value) => {
  editingCell.value = null;
  if (record[column.name] !== value) {
    await updateRecord(tableName.value, record.id, { [column.name]: value });
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
  // document.addEventListener('mouseup', onMouseUp);
  // document.addEventListener('mouseleave', onMouseLeave);
});

// Cleanup event listeners
// onUnmounted(() => {
//   document.removeEventListener('mouseup', onMouseUp);
//   document.removeEventListener('mouseleave', onMouseLeave);
// });
</script>

<style>
@import '~/assets/css/pages/admin-table-management.css';
</style>

<style scoped>
.table-wrapper {
  cursor: grab;
  overflow: auto;
  user-select: none;
}

.table-wrapper:active {
  cursor: grabbing;
}

.data-cell {
  cursor: default;
}

.empty-cell {
  color: #9ca3af;
  font-style: italic;
  cursor: pointer;
}

.empty-cell:hover {
  background-color: rgba(77, 208, 225, 0.1);
}

.image-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem;
}

.table-image {
  max-width: 80px;
  max-height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-image:hover {
  transform: scale(1.05);
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 4px 8px rgba(77, 208, 225, 0.2);
}

.image-cell .empty-cell {
  color: #6b7280;
  font-style: italic;
  font-size: 0.85rem;
  padding: 0.5rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-cell .empty-cell:hover {
  background-color: rgba(77, 208, 225, 0.1);
  border-color: var(--galaxy-aurora-cyan);
  color: var(--galaxy-starlight);
}

.image-cell .error-cell {
  color: #ef4444;
  font-style: italic;
  font-size: 0.85rem;
  padding: 0.5rem;
  border: 1px dashed rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(239, 68, 68, 0.1);
}

.image-cell .error-cell:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #dc2626;
}
</style>
