<template>
  <header class="app-header">
    <div class="logo">
      <NuxtLink to="/">Nixty</NuxtLink>
    </div>
    
    <!-- Navigation Links - Always visible -->
    <nav class="nav-links" :class="{ 'nav-slide': isSearchExpanded }">
      <!-- Basic navigation for all users -->
      <NuxtLink to="/home" :class="{ 'active': isActiveRoute('/home') }">Home</NuxtLink>
      <NuxtLink to="/products" :class="{ 'active': isActiveRoute('/products') }">Products</NuxtLink>

      <!-- Admin-only links -->
      <template v-if="user && user.account_type === 'admin'">
        <NuxtLink to="/admin" :class="{ 'active': isActiveRoute('/admin') }">Admin Panel</NuxtLink>
      </template>
    </nav>

    <!-- Search and Account Actions -->
    <div class="header-actions">
      <!-- Search Bar -->
      <SearchBar
        @search="handleSearch"
        @suggestion-selected="handleSuggestionSelected"
        @search-expanded="handleSearchExpanded"
        @search-collapsed="handleSearchCollapsed"
      />

      <!-- Account Actions -->
      <div class="auth-actions">
        <!-- User account dropdown (when logged in) -->
        <div v-if="user" class="user-account-dropdown" ref="userDropdownRef">
          <button class="account-icon-btn profile-btn" title="Account" @click="toggleUserDropdown">
            <!-- Debug: Show user data -->
            <!-- <div style="position: absolute; top: -30px; left: 0; background: yellow; padding: 2px; font-size: 10px; z-index: 2000;">
              User: {{ user.name }}<br>
              PP: {{ user.profile_picture }}
            </div> -->
            
            <div class="profile-picture-container">
              <ProfilePicture
                :src="user.profile_picture"
                :alt="user.name"
                :userName="user.name"
                :userId="user.id"
                :customFallback="true"
              />
            </div>
          </button>
          <div class="account-dropdown-content" :class="{ 'show': isUserDropdownOpen }">
            <!-- User info section -->
            <div class="user-info-section">
              <div class="user-avatar">
                <ProfilePicture
                  :src="user.profile_picture"
                  :alt="user.name"
                  :userName="user.name"
                  :userId="user.id"
                  :customFallback="true"
                  class="user-avatar-img"
                />
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            
            <!-- Admin-specific items -->
            <template v-if="user.account_type === 'admin'">
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToAdminDashboard">
                <i class="fas fa-tachometer-alt"></i>
                <span>Admin Dashboard</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToUserManagement">
                <i class="fas fa-users-cog"></i>
                <span>Manage Users</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToProductManagement">
                <i class="fas fa-boxes"></i>
                <span>Manage Products</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToTransactionManagement">
                <i class="fas fa-credit-card"></i>
                <span>Manage Transactions</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToAnnouncementManagement">
                <i class="fas fa-bullhorn"></i>
                <span>Manage Announcements</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToLicenseManagement">
                <i class="fas fa-key"></i>
                <span>Manage Licenses</span>
              </a>
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToStockManagement">
                <i class="fas fa-boxes"></i>
                <span>Stock Management</span>
              </a>
              <div class="dropdown-divider"></div>
            </template>

            <!-- Regular user items -->
            <a href="#" class="dropdown-item" @click.prevent="navigateToProfile">
              <i class="fas fa-user-circle"></i>
              <span>My Profile</span>
            </a>
            <a href="#" class="dropdown-item" @click.prevent="navigateToOrders">
              <i class="fas fa-shopping-bag"></i>
              <span>My Orders</span>
            </a>
            <a href="#" class="dropdown-item" @click.prevent="navigateToSettings">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item logout-item" @click.prevent="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </div>
        </div>

        <!-- Guest account dropdown (when not logged in) -->
        <div v-else class="guest-account-dropdown" ref="guestDropdownRef">
          <button class="account-icon-btn login-btn" title="Login / Register" @click="toggleGuestDropdown">
            <i class="fas fa-user-circle"></i>
          </button>
          <div class="account-dropdown-content" :class="{ 'show': isGuestDropdownOpen }">
            <a href="#" class="dropdown-item" @click.prevent="openAuthModal('login')">
              <i class="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </a>
            <a href="#" class="dropdown-item" @click.prevent="openAuthModal('register')">
              <i class="fas fa-user-plus"></i>
              <span>Register</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="js">
import { onMounted, onUnmounted } from 'vue';
import SearchBar from '~/components/SearchBar.vue';
import ProfilePicture from '~/components/ProfilePicture.vue';
import { useAppHeader } from '~/scripts/components/AppHeader.js';
import '~/assets/css/components/AppHeader.css';

// Define emits
const emit = defineEmits(['open-auth-modal']);

// Use the separated script logic
const {
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
  navigateToUserManagement,
  navigateToProductManagement,
  navigateToTransactionManagement,
  navigateToAnnouncementManagement,
  navigateToLicenseManagement,
  navigateToStockManagement,
  openAuthModal,
  handleLogout,
  handleSearch,
  handleSuggestionSelected,
  handleSearchExpanded,
  handleSearchCollapsed,
  initializeComponent,
  cleanupComponent,
  isActiveRoute
} = useAppHeader(emit);

// Lifecycle hooks
onMounted(() => {
  initializeComponent();
});

onUnmounted(() => {
  cleanupComponent();
});
</script>

