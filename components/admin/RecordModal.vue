<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i :class="mode === 'create' ? 'fas fa-plus' : 'fas fa-edit'"></i>
          {{ mode === 'create' ? 'Create New' : 'Edit' }} {{ getTableDisplayName(tableName) }}
        </h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="record-form">
          <div class="form-grid">
            <div
              v-for="column in editableColumns"
              :key="column.name"
              class="form-group"
              :class="getFieldClass(column)"
            >
              <label :for="column.name" class="form-label">
                {{ formatColumnName(column.name) }}
                <span v-if="isRequired(column)" class="required">*</span>
              </label>

              <!-- Text Input -->
              <input
                v-if="isTextInput(column)"
                :id="column.name"
                v-model="formData[column.name]"
                :type="getInputType(column)"
                :placeholder="getPlaceholder(column)"
                :required="isRequired(column)"
                :readonly="isAutoFilled(column)"
                :disabled="isFieldDisabled(column) || isFieldLoading(column)"
                :class="['form-input', { 'auto-filled': isAutoFilled(column), 'disabled': isFieldDisabled(column) }]"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="isTextarea(column)"
                :id="column.name"
                v-model="formData[column.name]"
                :placeholder="getPlaceholder(column)"
                :required="isRequired(column)"
                :disabled="isFieldDisabled(column) || isFieldLoading(column)"
                :class="['form-textarea', { 'disabled': isFieldDisabled(column) }]"
                rows="4"
              ></textarea>

              <!-- Select -->
              <div v-else-if="isSelect(column)" class="select-group">
                <div v-if="isFieldLoading(column)" class="select-loading-overlay">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Loading...</span>
                  <button 
                    v-if="column.name === 'product_id'"
                    @click="reloadProductOptions" 
                    class="reload-btn"
                    title="Reload products"
                  >
                    Reload
                  </button>
                </div>
                <CustomSelect
                  :id="column.name"
                  v-model="formData[column.name]"
                  :options="getSelectOptionsForCustomComponent(column)"
                  :placeholder="`Select ${formatColumnName(column.name)}`"
                  :required="isRequired(column)"
                  :disabled="isAutoFilled(column) || isFieldDisabled(column) || isFieldLoading(column)"
                />

                <!-- Auto-fill trigger button for product_id -->
                <button
                  v-if="column.name === 'product_id' && props.tableName === 'product_licenses' && formData.product_id"
                  type="button"
                  @click="triggerAutoFill"
                  class="auto-fill-btn"
                  title="Refresh auto-fill"
                >
                  🔄
                </button>
              </div>

              <!-- Status Selector for Transactions -->
              <div v-else-if="column.name === 'status' && props.tableName === 'transactions'" class="status-options">
                <div 
                  v-for="status in ['completed', 'pending', 'failed']" 
                  :key="status"
                  class="status-option"
                  :class="[status, { active: formData.status === status }]"
                  @click="formData.status = status"
                >
                  <i 
                    :class="getStatusIcon(status)" 
                    aria-hidden="true"
                  ></i>
                  {{ formatStatus(status) }}
                </div>
              </div>

              <!-- Boolean Checkbox -->
              <div v-else-if="isBoolean(column)" class="checkbox-wrapper">
                <input
                  :id="column.name"
                  v-model="formData[column.name]"
                  type="checkbox"
                  :disabled="isFieldDisabled(column)"
                  :class="['form-checkbox', { 'disabled': isFieldDisabled(column) }]"
                />
                <label :for="column.name" class="checkbox-label">
                  {{ getCheckboxLabel(column) }}
                </label>
              </div>

              <!-- Number Input -->
              <input
                v-else-if="isNumber(column)"
                :id="column.name"
                v-model="formData[column.name]"
                type="number"
                :step="getNumberStep(column)"
                :min="getNumberMin(column)"
                :placeholder="getPlaceholder(column)"
                :required="isRequired(column)"
                :disabled="isFieldDisabled(column)"
                :class="['form-input', { 'disabled': isFieldDisabled(column) }]"
              />

              <!-- Date Input -->
              <input
                v-else-if="isDate(column)"
                :id="column.name"
                v-model="formData[column.name]"
                type="datetime-local"
                :required="isRequired(column)"
                :disabled="isFieldDisabled(column)"
                :class="['form-input', { 'disabled': isFieldDisabled(column) }]"
              />

              <!-- Image Upload -->
              <ImageUpload
                v-else-if="isImageField(column)"
                v-model="formData[column.name]"
                :label="formatColumnName(column.name)"
                :required="isRequired(column)"
              />

              <!-- Default Input -->
              <input
                v-else
                :id="column.name"
                v-model="formData[column.name]"
                type="text"
                :placeholder="getPlaceholder(column)"
                :required="isRequired(column)"
                :disabled="isFieldDisabled(column)"
                :class="['form-input', { 'disabled': isFieldDisabled(column) }]"
              />

              <!-- Field Help Text -->
              <p v-if="getHelpText(column)" 
                 :class="[
                   'field-help',
                   {
                     'slug-tip': column.name === 'slug' && props.tableName === 'products' && !formData.category_id,
                     'slug-auto': column.name === 'slug' && props.tableName === 'products' && formData.category_id
                   }
                 ]">
                {{ getHelpText(column) }}
              </p>

              <!-- Disabled field explanation -->
              <p v-if="isFieldDisabled(column)" class="field-help disabled-help">
                <i class="fas fa-info-circle"></i>
                Field disabled - not applicable for {{ formatLicenseTypeName(formData.license_type) }} licenses
              </p>

              <!-- Auto-filled indicator -->
              <p v-if="isAutoFilled(column)" class="auto-filled-note">
                ✨ Auto-filled from selected product
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="cancel-btn">
              <i class="fas fa-times"></i>
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="save-btn">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else :class="mode === 'create' ? 'fas fa-plus' : 'fas fa-save'"></i>
              {{ mode === 'create' ? 'Create' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, watch, onMounted } from 'vue';
import ImageUpload from '~/components/admin/ImageUpload.vue';
import CustomSelect from '~/components/admin/CustomSelect.vue';
import { useAdminRelations } from '~/composables/useAdminRelations';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create', // 'create' or 'edit'
    validator: (value) => ['create', 'edit'].includes(value)
  },
  tableName: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    default: () => []
  },
  record: {
    type: Object,
    default: null
  },
  relations: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['close', 'save']);

// State
const loading = ref(false);
const formData = ref({});

// Relations composable
const { loadingStates, getFieldOptions, getCachedOptions, fetchProductVersions, getProductById } = useAdminRelations();

// Computed
const editableColumns = computed(() => {
  return props.columns.filter(col => 
    !col.extra.includes('auto_increment') && 
    col.name !== 'id' && 
    col.name !== 'created_at' && 
    col.name !== 'updated_at'
  );
});

// Methods
const getTableDisplayName = (tableName) => {
  const displayNames = {
    'users': 'User',
    'products': 'Product',
    'categories': 'Category',
    'announcements': 'Announcement',
    'deals': 'Deal',
    'hero_slides': 'Hero Slide',
    'transactions': 'Transaction',
    'product_licenses': 'Product License',
    'product_versions': 'Product Version',
    'categories': 'Category',
    'transactions': 'Transaction',
    'posts': 'Post',
    'pages': 'Page',
    'settings': 'Setting',
    'license_types': 'License Type'
  };
  return displayNames[tableName] || tableName;
};

const formatColumnName = (name) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const isRequired = (column) => {
  return column.nullable === false && !column.default && !column.extra.includes('auto_increment');
};

const isAutoFilled = (column) => {
  // For product_licenses, product_name and product_version are auto-filled when product_id is selected
  if (props.tableName === 'product_licenses') {
    return ['product_name', 'product_version'].includes(column.name) && formData.value.product_id;
  }
  if (props.tableName === 'products' && column.name === 'slug') {
    return !!formData.value.category_id;
  }
  return false;
};

const isImageField = (column) => {
  const imageFieldNames = [
    'image_url',
    'background_image_url',
    'profile_picture',
    'avatar',
    'photo',
    'thumbnail'
  ];

  // Check if column name exactly matches or contains image-related terms
  const isImage = imageFieldNames.some(fieldName =>
    column.name === fieldName ||
    column.name.includes('image') ||
    column.name.includes('photo') ||
    column.name.includes('picture') ||
    column.name.includes('avatar')
  );

  console.log('Checking field:', column.name, 'isImage:', isImage);
  return isImage;
};

const isTextInput = (column) => {
  // Pastikan version pada tabel products selalu dianggap text input
  if (props.tableName === 'products' && column.name === 'version') return true;
  return column.type.includes('varchar') && !isSelect(column) && column.name !== 'password' && !isImageField(column);
};

const isTextarea = (column) => {
  return column.type.includes('text') ||
         ['description', 'content'].includes(column.name);
};

const isSelect = (column) => {
  return column.type.includes('enum') ||
         ['status', 'account_type', 'payment_method', 'license_type', 'category_id', 'product_id', 'product_name', 'product_version'].includes(column.name);
};

const isBoolean = (column) => {
  return column.type.includes('tinyint(1)') || column.name.startsWith('is_');
};

const isNumber = (column) => {
  return column.type.includes('int') || column.type.includes('decimal');
};

const isDate = (column) => {
  return column.type.includes('timestamp') || column.type.includes('datetime');
};

const getInputType = (column) => {
  if (column.name === 'email') return 'email';
  if (column.name === 'password') return 'password';
  if (column.name.includes('url')) return 'url';
  return 'text';
};

const getPlaceholder = (column) => {
  if (isCurrencyColumn(column)) {
    return 'Contoh: 50000';
  }
  
  return `Masukkan ${formatColumnName(column.name)}`;
};

const getSelectOptions = (column) => {
  // Handle API-driven fields by checking cache
  const apiDrivenFields = ['product_id', 'user_id', 'product_name'];
  if (column.name === 'category_id') {
    if (props.relations && props.relations.categories) {
      return props.relations.categories.map(cat => ({ value: cat.id, label: cat.name }));
    }
    return [{ value: '', label: 'Loading categories...' }];
  }

  if (apiDrivenFields.includes(column.name)) {
    console.log(`Getting select options for ${column.name}`, {
      isLoading: isFieldLoading(column),
      cachedOptions: getCachedOptions(column.name)
    });
    
    const cachedOptions = getCachedOptions(column.name);
    
    // If loading, return loading state
    if (isFieldLoading(column)) {
      return [{ value: '', label: 'Loading...' }];
    }
    
    // If cache is empty but not loading, trigger fetch and return loading state
    if (cachedOptions.length === 0) {
      getFieldOptions(column.name);
      return [{ value: '', label: 'Loading...' }];
    }
    
    return cachedOptions;
  }

  // Handle product_version which depends on product_name
  if (column.name === 'product_version') {
    const selectedProductName = formData.value.product_name;
    if (!selectedProductName) {
      return [{ value: '', label: 'Select product name first' }];
    }
    
    // If loading, return loading state
    if (isFieldLoading(column)) {
      return [{ value: '', label: 'Loading versions...' }];
    }
    
    const cachedOptions = getCachedOptions(column.name);
    if (cachedOptions.length === 0) {
      getFieldOptions(column.name, { product_name: selectedProductName });
      return [{ value: '', label: 'Loading versions...' }];
    }
    
    return cachedOptions;
  }

  // Handle local, static options (enums, status, etc.)
  const options = {
    'status': [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    'account_type': [
      { value: 'user', label: 'Regular User' },
      { value: 'admin', label: 'Administrator' }
    ],
    'payment_method': [
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'e_wallet', label: 'E-Wallet' }
    ],
    'license_type': [
      { value: 'product_key', label: 'Product Key' },
      { value: 'email_password', label: 'Email & Password' },
      { value: 'access_code', label: 'Access Code' },
      { value: 'download_link', label: 'Download Link' }
    ]
  };

  if (column.name === 'status') {
    if (props.tableName === 'product_licenses') {
      return [
        { value: 'available', label: 'Available' },
        { value: 'partially_used', label: 'Partially Used' },
        { value: 'used', label: 'Fully Used' },
        { value: 'expired', label: 'Expired' },
        { value: 'reserved', label: 'Reserved' }
      ];
    } else if (props.tableName === 'products') {
      return [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'out_of_stock', label: 'Out of Stock' }
      ];
    } else if (props.tableName === 'deals') {
      return [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'expired', label: 'Expired' }
      ];
    }
  }

  if (column.type.includes('enum')) {
    const enumValues = column.type.match(/enum\(([^)]+)\)/)?.[1];
    if (enumValues) {
      return enumValues.split(',').map(value => {
        const cleanValue = value.replace(/'/g, '');
        return {
          value: cleanValue,
          label: cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1)
        };
      });
    }
  }

  return options[column.name] || [];
};

const getSelectOptionsForCustomComponent = (column) => {
  const options = getSelectOptions(column);
  if (!options || !Array.isArray(options)) {
    console.warn(`Tidak ada opsi valid untuk kolom: ${column.name}`);
    return []; // Kembalikan array kosong jika tidak ada opsi
  }
  return options.map(opt => ({ value: opt.value, label: opt.label }));
};

const getCheckboxLabel = (column) => {
  const labels = {
    'is_new': 'Mark as new',
    'is_featured': 'Featured item',
    'is_trending': 'Trending item'
  };
  return labels[column.name] || `Enable ${formatColumnName(column.name).toLowerCase()}`;
};

const getNumberStep = (column) => {
  return column.type.includes('decimal') ? '0.01' : '1';
};

const getNumberMin = (column) => {
  if (column.name.includes('price') || column.name.includes('amount')) {
    return '0';
  }
  return null;
};

const getHelpText = (column) => {
  // Special help text for slug in products table
  if (column.name === 'slug' && props.tableName === 'products') {
    if (!formData.value.category_id) {
      return '💡 Tip: Select a Category first to auto-generate the slug (recommended), or enter manually using lowercase letters, numbers, and hyphens only.';
    } else {
      return 'Auto-generated from category. You can edit manually if needed. Use lowercase letters, numbers, and hyphens only.';
    }
  }
  
  const helpTexts = {
    'password': 'Password must be at least 6 characters long',
    'email': 'Enter a valid email address',
    'slug': 'URL-friendly identifier. Use lowercase letters, numbers, and hyphens only (e.g., microsoft-office).',
    'price': 'Enter the price in the specified currency',
    'discount_percentage': 'Discount percentage (0-100)',
    'category_id': props.tableName === 'products' 
      ? 'Select the product category. This will auto-generate the slug for you.' 
      : 'Select the product category',
    'image_url': 'Upload or enter the image URL',
    'short_description': 'Brief description for product listings',
    'description': 'Detailed product description',
    'version': 'Product version (e.g., 2023, v1.0)',
    'currency': 'Currency code (e.g., IDR, USD)',
    'period': 'Billing period (e.g., /month, /year) or leave empty for one-time',
    'time_left': 'Time remaining for deals (e.g., 5d, 2h)',
    'product_key': 'Enter the product activation key (e.g., XXXXX-XXXXX-XXXXX-XXXXX-XXXXX). Can be used up to 5 times.',
    'license_type': 'Select the type of license/access method for this product. This will show/hide relevant fields.',
    'access_code': 'Enter access code or activation code. Can be used only once.',
    'download_link': 'Enter the download URL for the product. Can be used multiple times.',
    'product_id': 'Select the product - this will auto-fill product name and version',
    'product_name': 'Product name (auto-filled when product is selected)',
    'product_version': 'Product version (auto-filled when product is selected)',
    'usage_count': 'Number of times this license has been used (auto-managed)',
    'max_usage': 'Maximum number of times this license can be used (auto-set based on license type)',
    'notes': 'Internal notes about this license (not visible to customers)',
    // Announcements specific
    'title': 'Announcement title (minimum 2 characters)',
    'content': 'Full announcement content (optional)',
    'is_new': 'Mark as new announcement to highlight it',
    'status': 'Publication status - active announcements are visible to users',
    // Deals specific
    'old_price': 'Original price before discount (optional)',
    'new_price': 'Current discounted price (required, must be positive)',
    'badge': 'Deal badge text (e.g., "Hot Deal", "Limited Time")',
    'background_image_url': 'Background image for the deal card',
    'is_featured': 'Mark as featured deal to highlight it'
  };
  
  // Add license type specific help text
  if (props.tableName === 'product_licenses') {
    const licenseType = formData.value.license_type;
    if (licenseType) {
      const typeSpecificHelp = {
        'product_key': {
          'product_key': 'Product activation key (e.g., XXXXX-XXXXX-XXXXX-XXXXX-XXXXX). Can be used up to 5 times.',
          'max_usage': 'Auto-set to 5 for product keys (can be used multiple times)'
        },
        'email_password': {
          'email': 'Email address for the account (required for email/password licenses)',
          'password': 'Password for the account (minimum 6 characters, required for email/password licenses)',
          'max_usage': 'Auto-set to 1 for email/password (single use only)'
        },
        'access_code': {
          'access_code': 'Access or activation code (minimum 3 characters). Can be used only once.',
          'max_usage': 'Auto-set to 1 for access codes (single use only)'
        },
        'download_link': {
          'download_link': 'Direct download URL for the product. Can be used multiple times.',
          'max_usage': 'Auto-set to 999 for download links (unlimited use)'
        }
      };
      
      if (typeSpecificHelp[licenseType]?.[column.name]) {
        return typeSpecificHelp[licenseType][column.name];
      }
    }
  }
  
  return helpTexts[column.name];
};

const getFieldClass = (column) => {
  const baseClass = 'form-group';
  if (['notes', 'description', 'content', 'image_url', 'tags'].includes(column.name)) {
    return `${baseClass} full-width`;
  }
  return baseClass;
};

const getLicenseTypeForField = (column) => {
  if (props.tableName !== 'product_licenses') return '';
  
  const fieldToType = {
    'product_key': 'product_key',
    'email': 'email_password',
    'password': 'email_password',
    'access_code': 'access_code',
    'download_link': 'download_link'
  };
  
  return fieldToType[column.name] || '';
};

const formatLicenseTypeName = (licenseType) => {
  const names = {
    'product_key': 'Product Key',
    'email_password': 'Email & Password',
    'access_code': 'Access Code',
    'download_link': 'Download Link'
  };
  return names[licenseType] || licenseType;
};

const initializeForm = () => {
  console.log('Initializing form for table:', props.tableName);
  console.log('Mode:', props.mode);
  console.log('Record:', props.record);
  console.log('Columns:', props.columns);
  
  if (props.mode === 'edit' && props.record) {
    // Edit mode: populate with existing record data
    formData.value = { ...props.record };
    console.log('Form initialized with record data:', formData.value);
  } else {
    // Create mode: initialize with empty values
    formData.value = {};
    editableColumns.value.forEach(column => {
      // Set default values for certain fields
      if (column.name === 'status' && props.tableName === 'product_licenses') {
        formData.value[column.name] = 'available';
      } else if (column.name === 'usage_count' && props.tableName === 'product_licenses') {
        formData.value[column.name] = 0;
      } else if (column.name === 'max_usage' && props.tableName === 'product_licenses') {
        formData.value[column.name] = 1;
      } else if (column.name === 'created_at' || column.name === 'updated_at') {
        // Skip system fields
      } else {
        formData.value[column.name] = '';
      }
    });
    console.log('Form initialized with default values:', formData.value);
  }
};

// Method to manually trigger auto-fill for product fields
const triggerAutoFill = async () => {
  if (props.tableName === 'product_licenses' && formData.value.product_id) {
    console.log('Manually triggering auto-fill for product_id:', formData.value.product_id);

    // Force re-fetch products
    try {
      await getFieldOptions('product_id');

      // Get product details
      const productDetails = getProductById(formData.value.product_id);

      if (productDetails) {
        formData.value.product_name = productDetails.name || '';
        formData.value.product_version = productDetails.version || '';
        console.log('Manual auto-fill successful:', productDetails);
      } else {
        console.warn('Manual auto-fill failed: product not found');
      }
    } catch (error) {
      console.error('Manual auto-fill error:', error);
    }
  }
};

// Method to manually reload product options
const reloadProductOptions = async () => {
  try {
    console.log('Manually reloading product options');
    // Force re-fetch products
    const options = await getFieldOptions('product_id');
    console.log('Reloaded product options:', options);
    
    // Show success message
    if (typeof window !== 'undefined' && window.$toast) {
      window.$toast.success('Product list reloaded successfully');
    }
  } catch (error) {
    console.error('Error reloading product options:', error);
    // Show error message
    if (typeof window !== 'undefined' && window.$toast) {
      window.$toast.error('Failed to reload product list');
    }
  }
};

const handleOverlayClick = () => {
  emit('close');
};

const handleSubmit = async () => {
  loading.value = true;
  const dataToSend = {};

  // Only include fields that have a value
  for (const key in formData.value) {
    const value = formData.value[key];
    
    // For edit mode, we want to allow sending null to clear a field.
    // For create mode, we only send non-empty values.
    if (props.mode === 'edit') {
        // Always include all fields in edit mode to allow clearing them
        dataToSend[key] = value === '' ? null : value;
    } else { // Create mode
        if (value !== null && value !== undefined && value !== '') {
            dataToSend[key] = value;
        }
    }
  }

  // Remove password if it's empty during creation
  if (props.mode === 'create' && !dataToSend.password) {
    delete dataToSend.password;
  }
  
  // Make sure boolean 'false' values are included
  props.columns.forEach(col => {
    if (isBoolean(col) && formData.value[col.name] === false) {
      dataToSend[col.name] = false;
    }
  });

  try {
    await emit('save', {
      id: props.record ? props.record.id : null,
      record: dataToSend
    });
  } catch (error) {
    console.error('Error saving record:', error);
    // Optionally, display an error message to the user
    if (typeof window !== 'undefined' && window.$toast) {
      window.$toast.error(error.message || 'Failed to save record.');
    }
  } finally {
    loading.value = false;
  }
};

  // Keep loading state until parent confirms
  // loading.value = false; // Parent component will handle this

// Watch for prop changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    initializeForm();
    // Pre-fetch data for all API-driven select fields when the modal opens.
    editableColumns.value.forEach(column => {
      if (isSelect(column)) {
        const apiDrivenFields = ['category_id', 'product_id', 'user_id', 'product_name'];
        if (apiDrivenFields.includes(column.name)) {
          console.log(`Pre-fetching options for ${column.name}`);
          getFieldOptions(column.name).then(options => {
            console.log(`Fetched options for ${column.name}:`, options);
          }).catch(err => {
            console.error(`Error fetching options for ${column.name}:`, err);
          });
        }
      }
    });
  }
});

watch(() => props.record, () => {
  if (props.show) {
    initializeForm();
  }
});

// Watch for product name changes to reload versions
watch(() => formData.value.product_name, async (newProductName, oldProductName) => {
  if (newProductName && newProductName !== oldProductName && props.tableName === 'product_licenses') {
    // Clear current version selection
    formData.value.product_version = '';

    // Fetch new versions for the selected product name
    try {
      await fetchProductVersions(newProductName);
    } catch (error) {
      console.error('Failed to fetch product versions:', error);
    }
  }
});

// Watch for product_id changes to auto-fill product_name and product_version
watch(() => formData.value.product_id, async (newProductId, oldProductId) => {
  if (newProductId && newProductId !== oldProductId && props.tableName === 'product_licenses') {
    console.log('Product ID changed:', newProductId);

    try {
      // First try to get from cached products
      let productDetails = getProductById(newProductId);
      console.log('Product details from cache:', productDetails);

      // If not found in cache, fetch products first
      if (!productDetails) {
        console.log('Product not in cache, fetching products...');
        await getFieldOptions('product_id');
        // Try again after fetching
        productDetails = getProductById(newProductId);
        console.log('Product details after fetch:', productDetails);
      }

      if (productDetails) {
        // Auto-fill product_name and product_version
        formData.value.product_name = productDetails.name || '';
        formData.value.product_version = productDetails.version || '';

        console.log('Auto-filled successfully:', {
          product_name: productDetails.name,
          product_version: productDetails.version || '(no version)'
        });
      } else {
        console.warn('Could not find product details for ID:', newProductId);
        // Clear the fields if product not found
        formData.value.product_name = '';
        formData.value.product_version = '';
        
        // Show error message
        if (typeof window !== 'undefined' && window.$toast) {
          window.$toast.error('Product not found. Please select a valid product.');
        }
      }
    } catch (error) {
      console.error('Error auto-filling product details:', error);
      // Clear the fields on error
      formData.value.product_name = '';
      formData.value.product_version = '';
      
      // Show error message
      if (typeof window !== 'undefined' && window.$toast) {
        window.$toast.error('Failed to load product details. Please try again.');
      }
    }
  }
});

// Watch for name changes to auto-generate slug if empty
watch(() => formData.value.name, (newName) => {
  if (props.tableName === 'products' && newName && (!formData.value.slug || props.mode === 'create')) {
    // Buat slug dari nama produk yang lebih SEO-friendly
    let productType = newName
      .toLowerCase()
      .replace(/microsoft\s+/i, '') // Hapus kata "Microsoft"
      .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung
      .replace(/[^a-z0-9-]/g, ''); // Hapus karakter yang tidak diizinkan dalam slug
    
    // Jika nama mengandung Office, Project, atau Visio, gunakan category slug
    if (newName.toLowerCase().includes('office')) {
      productType = 'office';
    } else if (newName.toLowerCase().includes('project')) {
      productType = 'project';
    } else if (newName.toLowerCase().includes('visio')) {
      productType = 'visio';
    }
    
    formData.value.slug = productType;
    console.log('Auto-generated slug from product name:', formData.value.slug);
  }
});

// Watch for category_id changes to auto-fill slug
watch(() => formData.value.category_id, (newCategoryId) => {
  if (props.tableName === 'products' && newCategoryId) {
    const category = props.relations.categories.find(c => c.id === newCategoryId);
    if (category) {
      // Buat slug dari category slug yang konsisten
      // Format: 'office', 'project', 'visio'
      let productType = '';
      
      if (category.name.toLowerCase().includes('office')) {
        productType = 'office';
      } else if (category.name.toLowerCase().includes('project')) {
        productType = 'project';
      } else if (category.name.toLowerCase().includes('visio')) {
        productType = 'visio';
      } else {
        // Fallback: gunakan nama produk yang sudah ada di form jika ada
        if (formData.value.name) {
          productType = formData.value.name
            .toLowerCase()
            .replace(/microsoft\s+/i, '') // Hapus kata "Microsoft"
            .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung
            .replace(/[^a-z0-9-]/g, ''); // Hapus karakter yang tidak diizinkan dalam slug
        } else {
          // Jika tidak ada nama produk, gunakan nama kategori yang disederhanakan
          productType = category.name
            .toLowerCase()
            .replace(/microsoft\s+/i, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }
      }
      
      formData.value.slug = productType;
      console.log('Auto-filled slug from product type:', formData.value.slug);
    } else {
      console.warn('Category not found:', newCategoryId);
    }
  }
});
watch(() => formData.value.license_type, (newLicenseType, oldLicenseType) => {
  if (newLicenseType && newLicenseType !== oldLicenseType && props.tableName === 'product_licenses') {
    console.log('License type changed from', oldLicenseType, 'to', newLicenseType);
    
    // Clear fields that are not relevant to the new license type
    const fieldsToClear = {
      'product_key': ['email', 'password', 'access_code', 'download_link'],
      'email_password': ['product_key', 'access_code', 'download_link'],
      'access_code': ['product_key', 'email', 'password', 'download_link'],
      'download_link': ['product_key', 'email', 'password', 'access_code']
    };
    
    const fieldsToClearForNewType = fieldsToClear[newLicenseType] || [];
    fieldsToClearForNewType.forEach(field => {
      if (formData.value[field] !== undefined) {
        console.log('Clearing field:', field);
        formData.value[field] = '';
      }
    });
    
    // Set default max_usage based on license type
    const maxUsageByType = {
      'product_key': 5,
      'email_password': 1,
      'access_code': 1,
      'download_link': 999
    };
    
    if (maxUsageByType[newLicenseType]) {
      formData.value.max_usage = maxUsageByType[newLicenseType];
      console.log('Set max_usage to:', maxUsageByType[newLicenseType]);
    }
  }
});

const isFieldDisabled = (column) => {
  if (props.tableName === 'products' && column.name === 'slug') {
    // Slug otomatis digenerate saat pembuatan, tetapi dapat diedit manual setelahnya
    return false; // Selalu aktif, baik mode create maupun edit
  }

  if (props.tableName !== 'product_licenses') return false;
  
  const licenseType = formData.value.license_type;
  if (!licenseType) return false;
  
  // Fields yang selalu enabled
  const alwaysEnabled = [
    'product_id', 'product_name', 'product_version', 'license_type', 
    'status', 'usage_count', 'max_usage', 'notes'
  ];
  
  if (alwaysEnabled.includes(column.name)) return false;
  
  // Fields yang spesifik untuk setiap license type
  const typeSpecificFields = {
    'product_key': ['product_key'],
    'email_password': ['email', 'password'],
    'access_code': ['access_code'],
    'download_link': ['download_link']
  };
  
  // Disable field jika tidak sesuai dengan license type yang dipilih
  return !typeSpecificFields[licenseType]?.includes(column.name);
};

const isFieldLoading = (column) => {
  console.log(`Checking loading state for ${column.name}:`, loadingStates.value);
  
  if (column.name === 'product_id') {
    return loadingStates.value.products || false;
  }
  
  if (column.name === 'category_id') {
    return loadingStates.value.categories || false;
  }
  
  if (column.name === 'user_id') {
    return loadingStates.value.users || false;
  }
  
  if (column.name === 'product_name') {
    return loadingStates.value.productNames || false;
  }
  
  if (column.name === 'product_version') {
    return loadingStates.value.productVersions || false;
  }
  
  return false;
};

// Initialize on mount
onMounted(() => {
  if (props.show) {
    initializeForm();
  }
});

// Format status helper
const formatStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    'completed': 'Selesai',
    'pending': 'Menunggu',
    'failed': 'Gagal',
    'available': 'Tersedia',
    'used': 'Digunakan',
    'expired': 'Kedaluwarsa',
    'reserved': 'Dipesan',
    'active': 'Aktif',
    'inactive': 'Tidak Aktif',
    'out_of_stock': 'Stok Habis'
  };
  
  return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
};

// Get status icon helper
const getStatusIcon = (status) => {
  const iconMap = {
    'completed': 'fas fa-check-circle',
    'pending': 'fas fa-clock',
    'failed': 'fas fa-times-circle',
    'available': 'fas fa-check',
    'used': 'fas fa-user-check',
    'expired': 'fas fa-calendar-times',
    'reserved': 'fas fa-bookmark'
  };
  
  return iconMap[status.toLowerCase()] || 'fas fa-circle';
};

// Format currency helper for display
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Check if column is a currency field
const isCurrencyColumn = (column) => {
  return column.name === 'price' || 
         column.name === 'amount' || 
         column.name.includes('_price') ||
         column.name === 'old_price' || 
         column.name === 'new_price';
};
</script>

<style scoped>
@import '~/assets/css/components/admin-modals.css';

.readonly-field {
  margin-top: 0.5rem;
}

.readonly-value {
  padding: 0.75rem;
  background-color: var(--galaxy-bg-secondary);
  border: 1px solid var(--galaxy-border);
  border-radius: var(--galaxy-radius);
  color: var(--galaxy-text-secondary);
  font-style: italic;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
}

.field-note {
  display: block;
  margin-top: 0.25rem;
  color: var(--galaxy-text-muted);
  font-size: 0.875rem;
}

.auto-filled {
  background-color: var(--galaxy-bg-tertiary) !important;
  border-color: var(--galaxy-border-muted) !important;
  color: var(--galaxy-text-secondary) !important;
  font-style: italic;
}

.auto-filled:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.auto-filled-note {
  display: block;
  margin-top: 0.25rem;
  color: var(--galaxy-accent);
  font-size: 0.75rem;
  font-weight: 500;
}

.select-group {
  display: flex;
  align-items: stretch;
  gap: 0;
  position: relative;
}

.select-group .form-select {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
  margin: 0;
}

.auto-fill-btn {
  background: var(--galaxy-accent);
  border: 1px solid var(--galaxy-accent);
  border-left: 1px solid var(--galaxy-accent);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--galaxy-radius);
  border-bottom-right-radius: var(--galaxy-radius);
  padding: 0;
  margin: 0;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  width: 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.auto-fill-btn:hover {
  background: var(--galaxy-accent-hover);
  border-color: var(--galaxy-accent-hover);
}

.auto-fill-btn:active {
  transform: scale(0.95);
}

.select-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.reload-btn {
  background: var(--galaxy-accent);
  border: 1px solid var(--galaxy-accent);
  border-left: 1px solid var(--galaxy-accent);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--galaxy-radius);
  border-bottom-right-radius: var(--galaxy-radius);
  padding: 0;
  margin: 0;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  width: 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.reload-btn:hover {
  background: var(--galaxy-accent-hover);
  border-color: var(--galaxy-accent-hover);
}

.reload-btn:active {
  transform: scale(0.95);
}
</style>
