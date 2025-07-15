/**
 * Admin API validation utilities
 */

// Allowed tables for admin operations
export const ALLOWED_TABLES = [
  'users',
  'products',
  'categories',
  'announcements',
  'deals',
  'hero_slides',
  'transactions',
  'product_licenses'
];

// Table-specific validation rules
export const TABLE_VALIDATION_RULES = {
  users: {
    required: ['email'],
    email: ['email'],
    minLength: {
      password: 6,
      name: 2
    },
    maxLength: {
      email: 255,
      name: 100,
      password: 255
    },
    enum: {
      account_type: ['user', 'admin']
    }
  },
  products: {
    required: ['name', 'price'],
    minLength: {
      name: 2
    },
    maxLength: {
      name: 50,
      version: 50,
      short_description: 50,
      currency: 5,
      period: 50,
      slug: 100,
      description: 1000
    },
    slug: ['slug'],
    numeric: ['price', 'discount_percentage', 'sold_count', 'view_count', 'category_id', 'min_stock_threshold'],
    positiveNumber: ['price'],
    enum: {
      status: ['active', 'inactive', 'out_of_stock']
    }
  },
  categories: {
    required: ['name', 'slug'],
    minLength: {
      name: 2,
      slug: 2
    },
    maxLength: {
      name: 255,
      slug: 255
    },
    slug: ['slug']
  },
  announcements: {
    required: ['title'],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      image_url: 500
    },
    enum: {
      status: ['active', 'inactive']
    }
  },
  deals: {
    required: ['title', 'new_price'],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      badge: 100,
      background_image_url: 500
    },
    numeric: ['old_price', 'new_price', 'discount_percentage'],
    positiveNumber: ['new_price'],
    enum: {
      status: ['active', 'inactive', 'expired']
    }
  },
  hero_slides: {
    required: ['title'],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      background_image_url: 500
    },
    numeric: ['sort_order'],
    enum: {
      status: ['active', 'inactive']
    }
  },
  transactions: {
    required: ['order_id', 'product_name', 'amount', 'status'],
    minLength: {
      order_id: 2,
      product_name: 2
    },
    maxLength: {
      order_id: 100,
      product_name: 255,
      email: 255,
      payment_method: 50,
      va_number: 50,
      status: 20
    },
    numeric: ['amount'],
    positiveNumber: ['amount'],
    email: ['email']
  },
  product_licenses: {
    required: ['product_id', 'license_type'],
    minLength: {
      product_key: 5,
      email: 5,
      password: 6,
      product_name: 2
    },
    maxLength: {
      product_key: 500,
      email: 255,
      password: 255,
      product_name: 255,
      product_version: 50,
      notes: 1000
    },
    numeric: ['product_id', 'used_by_transaction_id', 'usage_count', 'max_usage'],
    positiveNumber: ['product_id'],
    email: ['email'],
    enum: {
      license_type: ['product_key', 'email_password'],
      status: ['available', 'used', 'expired', 'reserved']
    }
  }
};

/**
 * Validate table name
 */
export function validateTableName(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Table name is required');
  }
  
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error('Invalid table name');
  }
  
  return true;
}

/**
 * Sanitize string input
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  
  // Remove potentially dangerous characters
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slug format
 */
export function validateSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Generates a valid product slug from name and version
 * @param {string} name - Product name
 * @param {string} version - Product version
 * @returns {string} - Generated slug
 */
export function generateProductSlug(name) {
  // Convert to lowercase and replace spaces/special chars with hyphens
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates a product slug
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether the slug is valid
 */
export function validateProductSlug(slug) {
  // Slug should be lowercase, contain only letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validate record data for a specific table
 */
export function validateRecordData(tableName, data, isUpdate = false) {
  validateTableName(tableName);
  
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data provided');
  }
  
  // Remove system fields that shouldn't be set by users
  const systemFields = ['id', 'created_at', 'updated_at'];
  systemFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      console.log(`Removing system field '${field}' from user input`);
      delete data[field];
    }
  });

  const rules = TABLE_VALIDATION_RULES[tableName];
  if (!rules) {
    return data; // No specific rules, return as-is
  }

  const errors = [];
  const sanitizedData = {};
  
  // Check required fields (only for create operations)
  if (!isUpdate && rules.required) {
    for (const field of rules.required) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`Field '${field}' is required`);
      }
    }
  }
  
  // Validate each field
  for (const [field, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') {
      sanitizedData[field] = value;
      continue;
    }
    
    // Sanitize string values
    if (typeof value === 'string') {
      sanitizedData[field] = sanitizeString(value);
    } else {
      sanitizedData[field] = value;
    }
    
    // Email validation
    if (rules.email && rules.email.includes(field)) {
      if (!validateEmail(sanitizedData[field])) {
        errors.push(`Field '${field}' must be a valid email address`);
      }
    }
    
    // Slug validation
    if (rules.slug && rules.slug.includes(field)) {
      if (!validateSlug(sanitizedData[field])) {
        const errorMessage = `Field '${field}' must be a valid slug (lowercase, alphanumeric, hyphens only). Value: '${sanitizedData[field]}'`;
        console.error('Slug validation error:', errorMessage);
        errors.push(errorMessage);
      }
    }
    
    // URL validation
    if (field.includes('url') && sanitizedData[field]) {
      if (field.includes('image')) {
        // Special validation for image URLs
        try {
          validateImageUrl(sanitizedData[field]);
        } catch (error) {
          errors.push(`Field '${field}': ${error.message}`);
        }
      } else {
        // Regular URL validation
        if (!validateUrl(sanitizedData[field])) {
          errors.push(`Field '${field}' must be a valid URL`);
        }
      }
    }
    
    // Min length validation
    if (rules.minLength && rules.minLength[field]) {
      if (typeof sanitizedData[field] === 'string' && sanitizedData[field].length < rules.minLength[field]) {
        errors.push(`Field '${field}' must be at least ${rules.minLength[field]} characters long`);
      }
    }
    
    // Max length validation
    if (rules.maxLength && rules.maxLength[field]) {
      if (typeof sanitizedData[field] === 'string' && sanitizedData[field].length > rules.maxLength[field]) {
        errors.push(`Field '${field}' must be no more than ${rules.maxLength[field]} characters long`);
      }
    }
    
    // Numeric validation
    if (rules.numeric && rules.numeric.includes(field)) {
      // Skip validation for empty values (they'll be handled as NULL)
      if (sanitizedData[field] !== '' && sanitizedData[field] !== null && sanitizedData[field] !== undefined) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue)) {
          errors.push(`Field '${field}' must be a valid number`);
        } else {
          sanitizedData[field] = numValue;
        }
      }
    }

    // Positive number validation
    if (rules.positiveNumber && rules.positiveNumber.includes(field)) {
      // Skip validation for empty values, but validate if value is provided
      if (sanitizedData[field] !== '' && sanitizedData[field] !== null && sanitizedData[field] !== undefined) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`Field '${field}' must be a positive number`);
        }
      }
    }
    
    // Enum validation
    if (rules.enum && rules.enum[field]) {
      if (!rules.enum[field].includes(sanitizedData[field])) {
        errors.push(`Field '${field}' must be one of: ${rules.enum[field].join(', ')}`);
      }
    }
  }
  
  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.validationErrors = errors;
    throw error;
  }
  
  return sanitizedData;
}

/**
 * Validate record ID
 */
export function validateRecordId(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid record ID');
  }
  return numId;
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit) || 20), 100);
  const search = typeof query.search === 'string' ? sanitizeString(query.search) : '';
  const sortBy = typeof query.sortBy === 'string' ? sanitizeString(query.sortBy) : 'id';
  const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search,
    sortBy,
    sortOrder
  };
}

/**
 * Validate file upload for images
 */
export function validateFileUpload(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/jfif',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Max file size (5MB)
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type?.toLowerCase())) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  return true;
}

/**
 * Validate image URL (uploaded or external)
 */
export function validateImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return true; // Allow empty URLs
  }

  // Allow uploaded admin images
  if (url.startsWith('/uploads/admin/')) {
    return true;
  }

  // Allow external URLs
  try {
    new URL(url);
    return true;
  } catch {
    throw new Error('Invalid image URL format');
  }
}
