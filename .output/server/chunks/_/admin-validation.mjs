const ALLOWED_TABLES = [
  "users",
  "products",
  "categories",
  "announcements",
  "deals",
  "hero_slides",
  "transactions",
  "product_licenses"
];
const TABLE_VALIDATION_RULES = {
  users: {
    required: ["email"],
    email: ["email"],
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
      account_type: ["user", "admin"]
    }
  },
  products: {
    required: ["name", "price"],
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
      description: 1e3
    },
    slug: ["slug"],
    numeric: ["price", "discount_percentage", "sold_count", "view_count", "category_id", "min_stock_threshold"],
    positiveNumber: ["price"],
    enum: {
      status: ["active", "inactive", "out_of_stock"]
    }
  },
  categories: {
    required: ["name", "slug"],
    minLength: {
      name: 2,
      slug: 2
    },
    maxLength: {
      name: 255,
      slug: 255
    },
    slug: ["slug"]
  },
  announcements: {
    required: ["title"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      image_url: 500
    },
    enum: {
      status: ["active", "inactive"]
    }
  },
  deals: {
    required: ["title", "new_price"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      badge: 100,
      background_image_url: 500
    },
    numeric: ["old_price", "new_price", "discount_percentage"],
    positiveNumber: ["new_price"],
    enum: {
      status: ["active", "inactive", "expired"]
    }
  },
  hero_slides: {
    required: ["title"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      background_image_url: 500
    },
    numeric: ["sort_order"],
    enum: {
      status: ["active", "inactive"]
    }
  },
  transactions: {
    required: ["order_id", "product_name", "amount", "status"],
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
    numeric: ["amount"],
    positiveNumber: ["amount"],
    email: ["email"]
  },
  product_licenses: {
    required: ["product_id", "license_type"],
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
      notes: 1e3
    },
    numeric: ["product_id", "used_by_transaction_id", "usage_count", "max_usage"],
    positiveNumber: ["product_id"],
    email: ["email"],
    enum: {
      license_type: ["product_key", "email_password"],
      status: ["available", "used", "expired", "reserved"]
    }
  }
};
function validateTableName(tableName) {
  if (!tableName || typeof tableName !== "string") {
    throw new Error("Table name is required");
  }
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error("Invalid table name");
  }
  return true;
}
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "").trim();
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function validateSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
function generateProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function validateRecordData(tableName, data, isUpdate = false) {
  validateTableName(tableName);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data provided");
  }
  const systemFields = ["id", "created_at", "updated_at"];
  systemFields.forEach((field) => {
    if (data.hasOwnProperty(field)) {
      console.log(`Removing system field '${field}' from user input`);
      delete data[field];
    }
  });
  const rules = TABLE_VALIDATION_RULES[tableName];
  if (!rules) {
    return data;
  }
  const errors = [];
  const sanitizedData = {};
  if (!isUpdate && rules.required) {
    for (const field of rules.required) {
      if (!data[field] || typeof data[field] === "string" && data[field].trim() === "") {
        errors.push(`Field '${field}' is required`);
      }
    }
  }
  for (const [field, value] of Object.entries(data)) {
    if (value === null || value === void 0 || value === "") {
      sanitizedData[field] = value;
      continue;
    }
    if (typeof value === "string") {
      sanitizedData[field] = sanitizeString(value);
    } else {
      sanitizedData[field] = value;
    }
    if (rules.email && rules.email.includes(field)) {
      if (!validateEmail(sanitizedData[field])) {
        errors.push(`Field '${field}' must be a valid email address`);
      }
    }
    if (rules.slug && rules.slug.includes(field)) {
      if (!validateSlug(sanitizedData[field])) {
        const errorMessage = `Field '${field}' must be a valid slug (lowercase, alphanumeric, hyphens only). Value: '${sanitizedData[field]}'`;
        console.error("Slug validation error:", errorMessage);
        errors.push(errorMessage);
      }
    }
    if (field.includes("url") && sanitizedData[field]) {
      if (field.includes("image")) {
        try {
          validateImageUrl(sanitizedData[field]);
        } catch (error) {
          errors.push(`Field '${field}': ${error.message}`);
        }
      } else {
        if (!validateUrl(sanitizedData[field])) {
          errors.push(`Field '${field}' must be a valid URL`);
        }
      }
    }
    if (rules.minLength && rules.minLength[field]) {
      if (typeof sanitizedData[field] === "string" && sanitizedData[field].length < rules.minLength[field]) {
        errors.push(`Field '${field}' must be at least ${rules.minLength[field]} characters long`);
      }
    }
    if (rules.maxLength && rules.maxLength[field]) {
      if (typeof sanitizedData[field] === "string" && sanitizedData[field].length > rules.maxLength[field]) {
        errors.push(`Field '${field}' must be no more than ${rules.maxLength[field]} characters long`);
      }
    }
    if (rules.numeric && rules.numeric.includes(field)) {
      if (sanitizedData[field] !== "" && sanitizedData[field] !== null && sanitizedData[field] !== void 0) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue)) {
          errors.push(`Field '${field}' must be a valid number`);
        } else {
          sanitizedData[field] = numValue;
        }
      }
    }
    if (rules.positiveNumber && rules.positiveNumber.includes(field)) {
      if (sanitizedData[field] !== "" && sanitizedData[field] !== null && sanitizedData[field] !== void 0) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`Field '${field}' must be a positive number`);
        }
      }
    }
    if (rules.enum && rules.enum[field]) {
      if (!rules.enum[field].includes(sanitizedData[field])) {
        errors.push(`Field '${field}' must be one of: ${rules.enum[field].join(", ")}`);
      }
    }
  }
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.validationErrors = errors;
    throw error;
  }
  return sanitizedData;
}
function validateRecordId(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid record ID");
  }
  return numId;
}
function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return true;
  }
  if (url.startsWith("/uploads/admin/")) {
    return true;
  }
  try {
    new URL(url);
    return true;
  } catch {
    throw new Error("Invalid image URL format");
  }
}

export { validateRecordData as a, validateRecordId as b, generateProductSlug as g, validateTableName as v };
//# sourceMappingURL=admin-validation.mjs.map
