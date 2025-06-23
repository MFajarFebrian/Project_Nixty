import { ref } from 'vue';
import { useAdminAuth } from './useAdminAuth';

/**
 * Composable for handling admin table relationships
 */
export function useAdminRelations() {
  const { getAdminHeaders, checkAdminAccess } = useAdminAuth();
  
  // State
  const loading = ref(false);
  const error = ref(null);
  const categories = ref([]);
  const products = ref([]);
  const users = ref([]);
  const productNames = ref([]);
  const productVersions = ref([]);
  
  // Methods
  const setError = (message) => {
    error.value = message;
    console.error('Admin Relations Error:', message);
  };
  
  const clearError = () => {
    error.value = null;
  };
  
  /**
   * Fetch categories for dropdowns
   */
  const fetchCategories = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();
      
      const response = await $fetch('/api/admin/tables/categories', {
        headers: getAdminHeaders(),
        query: { limit: 100 } // Get all categories
      });
      
      if (response.success) {
        categories.value = response.data.records.map(cat => ({
          value: cat.id,
          label: cat.name
        }));
        return categories.value;
      } else {
        setError('Failed to fetch categories');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch products for dropdowns
   */
  const fetchProducts = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch('/api/admin/tables/products', {
        headers: getAdminHeaders(),
        query: { limit: 100 } // Get all products
      });

      if (response.success) {
        products.value = response.data.records.map(product => ({
          value: product.id,
          label: `${product.name}${product.version ? ` (${product.version})` : ''}`,
          name: product.name,
          version: product.version
        }));
        return products.value;
      } else {
        setError('Failed to fetch products');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch users for dropdowns
   */
  const fetchUsers = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();
      
      const response = await $fetch('/api/admin/tables/users', {
        headers: getAdminHeaders(),
        query: { limit: 100 } // Get all users
      });
      
      if (response.success) {
        users.value = response.data.records.map(user => ({
          value: user.id,
          label: `${user.name || user.email} (${user.email})`
        }));
        return users.value;
      } else {
        setError('Failed to fetch users');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch product names for dropdowns
   */
  const fetchProductNames = async () => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch('/api/admin/product-names-versions', {
        headers: getAdminHeaders(),
        query: { type: 'names' }
      });

      if (response.success) {
        productNames.value = response.data;
        return productNames.value;
      } else {
        setError('Failed to fetch product names');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product names');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch product versions for a specific product name
   */
  const fetchProductVersions = async (productName) => {
    try {
      checkAdminAccess();
      loading.value = true;
      clearError();

      const response = await $fetch('/api/admin/product-names-versions', {
        headers: getAdminHeaders(),
        query: { type: 'versions', product_name: productName }
      });

      if (response.success) {
        productVersions.value = response.data;
        return productVersions.value;
      } else {
        setError('Failed to fetch product versions');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product versions');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get options for a specific field
   */
  const getFieldOptions = async (fieldName, additionalParams = {}) => {
    switch (fieldName) {
      case 'category_id':
        return await fetchCategories();
      case 'product_id':
        return await fetchProducts();
      case 'user_id':
        return await fetchUsers();
      case 'product_name':
        return await fetchProductNames();
      case 'product_version':
        return await fetchProductVersions(additionalParams.product_name);
      default:
        return [];
    }
  };
  
  /**
   * Get cached options for a field (without fetching)
   */
  const getCachedOptions = (fieldName) => {
    switch (fieldName) {
      case 'category_id':
        return categories.value;
      case 'product_id':
        return products.value;
      case 'user_id':
        return users.value;
      case 'product_name':
        return productNames.value;
      case 'product_version':
        return productVersions.value;
      default:
        return [];
    }
  };

  /**
   * Get product details by ID from cached products
   */
  const getProductById = (productId) => {
    console.log('Looking for product ID:', productId, 'in', products.value.length, 'cached products');
    const product = products.value.find(p => p.value == productId);

    if (product) {
      const result = {
        id: product.value,
        name: product.name || '',
        version: product.version || ''
      };
      console.log('Found product:', result);
      return result;
    }

    console.log('Product not found in cache');
    return null;
  };
  
  return {
    // State
    loading,
    error,
    categories,
    products,
    users,
    productNames,
    productVersions,

    // Methods
    clearError,
    fetchCategories,
    fetchProducts,
    fetchUsers,
    fetchProductNames,
    fetchProductVersions,
    getFieldOptions,
    getCachedOptions,
    getProductById
  };
}
