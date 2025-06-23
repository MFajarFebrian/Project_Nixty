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
                :class="['form-input', { 'auto-filled': isAutoFilled(column) }]"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="isTextarea(column)"
                :id="column.name"
                v-model="formData[column.name]"
                :placeholder="getPlaceholder(column)"
                :required="isRequired(column)"
                rows="4"
                class="form-textarea"
              ></textarea>

              <!-- Select -->
              <div v-else-if="isSelect(column)" class="select-group">
                <select
                  :id="column.name"
                  v-model="formData[column.name]"
                  :required="isRequired(column)"
                  :disabled="isAutoFilled(column)"
                  :class="['form-select', { 'auto-filled': isAutoFilled(column) }]"
                >
                  <option value="">Select {{ formatColumnName(column.name) }}</option>
                  <option
                    v-for="option in getSelectOptions(column)"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

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

              <!-- Boolean Checkbox -->
              <div v-else-if="isBoolean(column)" class="checkbox-wrapper">
                <input
                  :id="column.name"
                  v-model="formData[column.name]"
                  type="checkbox"
                  class="form-checkbox"
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
                class="form-input"
              />

              <!-- Date Input -->
              <input
                v-else-if="isDate(column)"
                :id="column.name"
                v-model="formData[column.name]"
                type="datetime-local"
                :required="isRequired(column)"
                class="form-input"
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
                class="form-input"
              />

              <!-- Field Help Text -->
              <p v-if="getHelpText(column)" class="field-help">
                {{ getHelpText(column) }}
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
  }
});

// Emits
const emit = defineEmits(['close', 'save']);

// State
const loading = ref(false);
const formData = ref({});

// Relations composable
const { getFieldOptions, getCachedOptions, fetchProductVersions, getProductById } = useAdminRelations();

// Computed
const editableColumns = computed(() => {
  return props.columns.filter(column => {
    // Skip auto-increment primary keys
    if (column.extra.includes('auto_increment')) {
      return false;
    }
    // Skip timestamp system columns (they're automated)
    if (['created_at', 'updated_at'].includes(column.name)) {
      return false;
    }
    return true;
  });
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
    'product_licenses': 'Product License'
  };
  return displayNames[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1);
};

const formatColumnName = (name) => {
  return name.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const isRequired = (column) => {
  return column.nullable === false && !column.default && !column.extra.includes('auto_increment');
};

const isAutoFilled = (column) => {
  // For product_licenses, product_name and product_version are auto-filled when product_id is selected
  if (props.tableName === 'product_licenses') {
    return ['product_name', 'product_version'].includes(column.name) && formData.value.product_id;
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
  const placeholders = {
    'email': 'Enter email address',
    'password': 'Enter password (min 6 characters)',
    'name': 'Enter name',
    'title': 'Enter title',
    'description': 'Enter description',
    'price': 'Enter price',
    'amount': 'Enter amount',
    'slug': 'Enter URL-friendly slug (lowercase, hyphens only)',
    'content': 'Enter announcement content (optional)',
    'image_url': 'Upload image or enter URL',
    'old_price': 'Enter original price (e.g., 150000)',
    'new_price': 'Enter discounted price (e.g., 120000)',
    'discount_percentage': 'Enter discount % (e.g., 20)',
    'badge': 'Enter badge text (e.g., Hot Deal)',
    'background_image_url': 'Upload background image or enter URL',
    'expires_at': 'Select expiration date (optional)'
  };
  return placeholders[column.name] || `Enter ${formatColumnName(column.name).toLowerCase()}`;
};

const getSelectOptions = (column) => {
  // Check for foreign key relationships first
  if (['category_id', 'product_id', 'user_id', 'product_name'].includes(column.name)) {
    const cachedOptions = getCachedOptions(column.name);
    if (cachedOptions.length > 0) {
      console.log(`Found ${cachedOptions.length} cached options for ${column.name}`);
      return cachedOptions;
    }
    // If no cached options, fetch them
    console.log(`No cached options for ${column.name}, fetching...`);
    getFieldOptions(column.name);
    return [{ value: '', label: 'Loading...' }];
  }

  // Special handling for product_version - depends on selected product_name
  if (column.name === 'product_version') {
    const selectedProductName = formData.value.product_name;
    if (!selectedProductName) {
      return [{ value: '', label: 'Select product name first' }];
    }

    const cachedOptions = getCachedOptions(column.name);
    if (cachedOptions.length > 0) {
      return cachedOptions;
    }

    // Fetch versions for selected product name
    getFieldOptions(column.name, { product_name: selectedProductName });
    return [{ value: '', label: 'Loading versions...' }];
  }

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

  // Special handling for different table status fields
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

  // Handle enum types
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
  const helpTexts = {
    'password': 'Password must be at least 6 characters long',
    'email': 'Enter a valid email address',
    'slug': 'URL-friendly identifier. Use lowercase letters, numbers, and hyphens only (e.g., microsoft-office).',
    'price': 'Enter the price in the specified currency',
    'discount_percentage': 'Discount percentage (0-100)',
    'category_id': 'Select the product category',
    'image_url': 'Upload or enter the image URL',
    'short_description': 'Brief description for product listings',
    'description': 'Detailed product description',
    'version': 'Product version (e.g., 2023, v1.0)',
    'currency': 'Currency code (e.g., IDR, USD)',
    'period': 'Billing period (e.g., /month, /year) or leave empty for one-time',
    'time_left': 'Time remaining for deals (e.g., 5d, 2h)',
    'product_key': 'Enter the product activation key (e.g., XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)',
    'license_type': 'Select the type of license/access method for this product',
    'access_code': 'Enter access code or activation code',
    'download_link': 'Enter the download URL for the product',
    'product_id': 'Select the product - this will auto-fill product name and version',
    'product_name': 'Product name (auto-filled when product is selected)',
    'product_version': 'Product version (auto-filled when product is selected)',
    'usage_count': 'Number of times this license has been used',
    'max_usage': 'Maximum number of times this license can be used (Product Keys: 5, Others: 1)',
    'expires_at': 'Leave empty for permanent licenses',
    'notes': 'Internal notes about this license (not visible to customers)',
    // Announcements specific
    'title': 'Announcement title (minimum 2 characters)',
    'content': 'Full announcement content (optional)',
    'is_new': 'Mark as new announcement to highlight it',
    'status': 'Publication status - active announcements are visible to users',
    // Deals specific
    'old_price': 'Original price before discount (optional)',
    'new_price': 'Current discounted price (required, must be positive)',
    'discount_percentage': 'Discount percentage (0-100, optional)',
    'badge': 'Deal badge text (e.g., "Hot Deal", "Limited Time")',
    'background_image_url': 'Background image for the deal card',
    'is_featured': 'Mark as featured deal to highlight it',
    'expires_at': 'Deal expiration date and time (optional - leave empty for permanent deals)',
    'product_id': 'Link this deal to a specific product (optional - enables product integration)'
  };
  return helpTexts[column.name];
};

const getFieldClass = (column) => {
  if (isTextarea(column)) return 'full-width';
  if (column.name === 'description' || column.name === 'content') return 'full-width';
  return '';
};

const initializeForm = () => {
  const data = {};

  editableColumns.value.forEach(column => {
    if (props.mode === 'edit' && props.record) {
      let value = props.record[column.name];

      // Convert database boolean values (0/1) to JavaScript boolean (true/false)
      if (isBoolean(column)) {
        const originalValue = value;
        value = Boolean(value) && value !== 0;
        console.log(`Boolean conversion for ${column.name}: ${originalValue} -> ${value}`);
      }

      data[column.name] = value;
    } else {
      // Set default values for new records
      if (isBoolean(column)) {
        data[column.name] = false;
      } else {
        data[column.name] = column.default || '';
      }
    }
  });

  formData.value = data;
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



const handleOverlayClick = () => {
  emit('close');
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    // Special handling for categories - ensure slug is generated if empty
    if (props.tableName === 'categories' && formData.value.name && !formData.value.slug) {
      formData.value.slug = generateSlug(formData.value.name);
      console.log('Auto-generated slug for categories:', formData.value.slug);
    }

    // Clean up form data
    const cleanData = {};
    Object.keys(formData.value).forEach(key => {
      const value = formData.value[key];

      // For image fields, include empty strings to allow clearing
      const isImageField = key.includes('image') || key.includes('picture') || key.includes('photo') || key.includes('avatar');

      if (value !== null && value !== undefined) {
        if (value !== '' || isImageField) {
          // Find the column to check if it's a boolean field
          const column = editableColumns.value.find(col => col.name === key);

          // Convert boolean values to integers for database storage
          if (column && isBoolean(column)) {
            const convertedValue = value ? 1 : 0;
            console.log(`Boolean submission for ${key}: ${value} -> ${convertedValue}`);
            cleanData[key] = convertedValue;
          } else {
            cleanData[key] = value;
          }
        }
      }
    });

    console.log('Raw form data:', formData.value);
    console.log('Cleaned form data being submitted:', cleanData);

    // Additional validation for categories
    if (props.tableName === 'categories') {
      if (!cleanData.name || cleanData.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters long');
      }
      if (!cleanData.slug || cleanData.slug.trim().length < 2) {
        throw new Error('Category slug must be at least 2 characters long');
      }
      console.log('Categories validation passed:', { name: cleanData.name, slug: cleanData.slug });
    }
    emit('save', cleanData);
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for prop changes
watch(() => props.show, async (newValue) => {
  if (newValue) {
    initializeForm();

    // Pre-fetch products for product_licenses table to ensure auto-fill works
    if (props.tableName === 'product_licenses') {
      try {
        await getFieldOptions('product_id');
        console.log('Products pre-fetched for product_licenses');
      } catch (error) {
        console.error('Failed to pre-fetch products:', error);
      }
    }
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

    // First try to get from cached products
    let productDetails = getProductById(newProductId);
    console.log('Product details from cache:', productDetails);

    // If not found in cache, fetch products first
    if (!productDetails) {
      console.log('Product not in cache, fetching products...');
      try {
        await getFieldOptions('product_id');
        // Try again after fetching
        productDetails = getProductById(newProductId);
        console.log('Product details after fetch:', productDetails);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
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
    }
  }
});

// Initialize on mount
onMounted(() => {
  if (props.show) {
    initializeForm();
  }
});
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
</style>
