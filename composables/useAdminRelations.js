import { ref } from 'vue';
import { useAdminAuth } from './useAdminAuth';

/**
 * Composable for handling admin table relationships
 */
export function useAdminRelations() {
  const { getAdminHeaders, checkAdminAccess } = useAdminAuth();
  
  // State
  const loading = ref(false); // General loading state
  const loadingStates = ref({
    categories: false,
    products: false,
    users: false,
    productNames: false,
    productVersions: false,
  });
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
    if (loadingStates.value.categories) return;
    try {
      checkAdminAccess();
      loadingStates.value.categories = true;
      clearError();
      
      const response = await $fetch('/api/admin/tables/categories', {
        headers: getAdminHeaders(),
        query: { pageSize: 100 } // Get all categories
      });
      
      console.log('Categories response:', response);
      
      if (response.success) {
        categories.value = response.data.map(cat => ({
          value: cat.id,
          label: cat.name,
          slug: cat.slug // Simpan slug kategori untuk digunakan nanti
        }));
        console.log('Processed categories:', categories.value);
        return categories.value;
      } else {
        setError('Failed to fetch categories');
        return [];
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      return [];
    } finally {
      loadingStates.value.categories = false;
    }
  };
  
  /**
   * Fetch products for dropdowns
   */
  const fetchProducts = async () => {
    if (loadingStates.value.products) return;
    try {
      checkAdminAccess();
      loadingStates.value.products = true;
      clearError();

      const response = await $fetch('/api/admin/tables/products', {
        headers: getAdminHeaders(),
        query: { pageSize: 100 } // Get all products
      });

      console.log('Products response:', response);

      if (response.success) {
        // Data produk ada di response.data, bukan response.data.records
        products.value = response.data.map(product => ({
          value: product.id,
          label: `${product.name}${product.version ? ` (${product.version})` : ''}`,
          name: product.name,
          version: product.version
        }));
        console.log('Processed products:', products.value);
        return products.value;
      } else {
        setError('Failed to fetch products');
        return [];
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      return [];
    } finally {
      loadingStates.value.products = false;
    }
  };
  
  /**
   * Fetch users for dropdowns
   */
  const fetchUsers = async () => {
    if (loadingStates.value.users) return;
    try {
      checkAdminAccess();
      loadingStates.value.users = true;
      clearError();
      
      const response = await $fetch('/api/admin/tables/users', {
        headers: getAdminHeaders(),
        query: { pageSize: 100 } // Get all users
      });
      
      console.log('Users response:', response);
      
      if (response.success) {
        users.value = response.data.map(user => ({
          value: user.id,
          label: `${user.name || user.email} (${user.email})`
        }));
        console.log('Processed users:', users.value);
        return users.value;
      } else {
        setError('Failed to fetch users');
        return [];
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      return [];
    } finally {
      loadingStates.value.users = false;
    }
  };
  
  /**
   * Fetch product names for dropdowns
   */
  const fetchProductNames = async () => {
    if (loadingStates.value.productNames) return;
    try {
      checkAdminAccess();
      loadingStates.value.productNames = true;
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
      loadingStates.value.productNames = false;
    }
  };

  /**
   * Fetch product versions for a specific product name
   */
  const fetchProductVersions = async (productName) => {
    if (loadingStates.value.productVersions) return;
    try {
      checkAdminAccess();
      loadingStates.value.productVersions = true;
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
      loadingStates.value.productVersions = false;
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
    loadingStates,
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
