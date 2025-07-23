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
  
  // Mobile menu state
  const isMobileMenuOpen = ref(false);


  // Active route detection
  const currentRoute = computed(() => route.path);

  // Helper function to check if a route is active
  const isActiveRoute = (path) => {
    // Exact match
  if (currentRoute.value === '/' && !user.value?.account_type === 'admin') {
      return true;
    }

    // Home page special case
    if (path === '/home' && currentRoute.value === '/') {
      return true;
    }

    // Dashboard routes special handling
    if (path === '/dashboard' && currentRoute.value.startsWith('/dashboard')) {
      return true;
    }

    // General sub-route matching (but not for dashboard to avoid conflicts)
    if (path !== '/dashboard' && currentRoute.value.startsWith(path + '/')) {
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
  
  // Mobile menu toggle methods
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    // Close dropdowns when opening mobile menu
    if (isMobileMenuOpen.value) {
      isUserDropdownOpen.value = false;
      isGuestDropdownOpen.value = false;
    }
    // Toggle body scroll lock
    if (isMobileMenuOpen.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
    document.body.style.overflow = '';
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
    router.push('/orders');
    isUserDropdownOpen.value = false;
  };


  // Admin navigation methods
  const navigateToDashboard = () => {
    router.push('/dashboard');
    isUserDropdownOpen.value = false;
  };


  const openAuthModal = (tab = 'login') => {
    if (emit) {
      emit('open-auth-modal', tab);
      // Close any open dropdowns
      isGuestDropdownOpen.value = false;
      isUserDropdownOpen.value = false;
    }
  };

  const handleLogout = () => {
    const isAdmin = user.value?.account_type === 'admin';
    logout();
    
    // Redirect admin to home with login modal, regular users to home
    if (isAdmin) {
      router.push('/?modal=login');
    } else {
      router.push('/');
    }
    
    isUserDropdownOpen.value = false;
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
    currentRoute,
    isMobileMenuOpen,

    // Methods
    toggleUserDropdown,
    toggleGuestDropdown,
    toggleMobileMenu,
    closeMobileMenu,
    navigateToProfile,
    navigateToOrders,
    navigateToDashboard,
    openAuthModal,
    handleLogout,
    initializeComponent,
    cleanupComponent,
    isActiveRoute
  };
};
