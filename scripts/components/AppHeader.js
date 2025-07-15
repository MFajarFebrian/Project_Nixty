import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter, useRoute } from '#app';

export const useAppHeader = (emit) => {
  const { user, initUser, logout } = useAuth();
  const router = useRouter();
  const route = useRoute();

  // Dropdown state
  const isUserDropdownOpen = ref(false);
  const isGuestDropdownOpen = ref(false);
  const userDropdownRef = ref(null);
  const guestDropdownRef = ref(null);

  // Search animation state
  const isSearchExpanded = ref(false);

  // Active route detection
  const currentRoute = computed(() => route.path);

  // Helper function to check if a route is active
  const isActiveRoute = (path) => {
    // Exact match
    if (currentRoute.value === path) {
      return true;
    }

    // Home page special case
    if (path === '/home' && currentRoute.value === '/') {
      return true;
    }

    // Admin routes special handling
    if (path === '/admin' && currentRoute.value.startsWith('/admin')) {
      return true;
    }

    // General sub-route matching (but not for admin to avoid conflicts)
    if (path !== '/admin' && currentRoute.value.startsWith(path + '/')) {
      return true;
    }

    return false;
  };

  // Dropdown toggle methods
  const toggleUserDropdown = () => {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
    isGuestDropdownOpen.value = false; // Close other dropdown
  };

  const toggleGuestDropdown = () => {
    isGuestDropdownOpen.value = !isGuestDropdownOpen.value;
    isUserDropdownOpen.value = false; // Close other dropdown
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    // Add a small delay to ensure the click event has been processed
    setTimeout(() => {
      if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
        isUserDropdownOpen.value = false;
      }
      if (guestDropdownRef.value && !guestDropdownRef.value.contains(event.target)) {
        isGuestDropdownOpen.value = false;
      }
    }, 10);
  };

  // Override navigation methods to close dropdown
  const navigateToProfile = () => {
    router.push('/profile');
    isUserDropdownOpen.value = false;
  };

  const navigateToOrders = () => {
    router.push('/profile/history_order');
    isUserDropdownOpen.value = false;
  };

  const navigateToSettings = () => {
    router.push('/profile/settings');
    isUserDropdownOpen.value = false;
  };

  // Admin navigation methods
  const navigateToAdminDashboard = () => {
    router.push('/admin');
    isUserDropdownOpen.value = false;
  };


  const openAuthModal = (tab = 'login') => {
    if (emit) {
      emit('open-auth-modal', tab);
      isGuestDropdownOpen.value = false;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    isUserDropdownOpen.value = false;
  };

  // Search handlers
  const handleSearch = (searchData) => {
    console.log('Search performed:', searchData);
    // You can implement search navigation logic here
    // For example: router.push(`/search?q=${searchData.query}&filter=${searchData.filter}`);
  };

  const handleSuggestionSelected = (data) => {
    console.log('Suggestion selected:', data);
    // You can implement suggestion navigation logic here
    // For example: router.push(`/${data.filter.toLowerCase()}/${data.suggestion.id}`);
  };

  // Search animation handlers
  const handleSearchExpanded = () => {
    isSearchExpanded.value = true;
    console.log('Navigation sliding for search expansion');
  };

  const handleSearchCollapsed = () => {
    isSearchExpanded.value = false;
    console.log('Navigation sliding back to normal');
  };

  // Lifecycle methods
  const initializeComponent = () => {
    initUser();
    document.addEventListener('click', handleClickOutside);
  };

  const cleanupComponent = () => {
    document.removeEventListener('click', handleClickOutside);
  };

  return {
    // State
    user,
    isUserDropdownOpen,
    isGuestDropdownOpen,
    userDropdownRef,
    guestDropdownRef,
    isSearchExpanded,
    currentRoute,

    // Methods
    toggleUserDropdown,
    toggleGuestDropdown,
    navigateToProfile,
    navigateToOrders,
    navigateToSettings,
    navigateToAdminDashboard,
    openAuthModal,
    handleLogout,
    handleSearch,
    handleSuggestionSelected,
    handleSearchExpanded,
    handleSearchCollapsed,
    initializeComponent,
    cleanupComponent,
    isActiveRoute
  };
};
