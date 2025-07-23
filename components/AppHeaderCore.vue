<template>
  <header class="app-header">
    <div class="logo">
      <NuxtLink to="/">Nixty</NuxtLink>
    </div>
    
    <!-- Mobile Menu Toggle Button -->
    <button 
      class="mobile-menu-toggle" 
      @click="toggleMobileMenu"
      :class="{ 'active': isMobileMenuOpen }"
      v-if="!user || user.account_type !== 'admin'"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <!-- Navigation Links - Hidden for admin users -->
    <nav class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }" v-if="!user || user.account_type !== 'admin'">
      <div class="nav-overlay" @click="closeMobileMenu"></div>
      <div class="nav-container">
        <div class="nav-header">
          <span class="nav-title">Navigation</span>
          <button class="nav-close" @click="closeMobileMenu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="nav-items">
          <NuxtLink to="/home" :class="{ 'active': isActiveRoute('/home') }" @click="closeMobileMenu">Home</NuxtLink>
          <NuxtLink to="/products" :class="{ 'active': isActiveRoute('/products') }" @click="closeMobileMenu">Products</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Account Actions -->
    <div class="header-actions">
      <!-- Account Actions -->
      <div class="auth-actions">
        <!-- User account dropdown (when logged in) -->
        <div v-if="user" class="user-account-dropdown" ref="userDropdownRef">
          <button class="account-icon-btn profile-btn" title="Account" @click="toggleUserDropdown">
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
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToDashboard">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
              <div class="dropdown-divider"></div>
            </template>

            <!-- Regular user items (only for non-admin users) -->
            <template v-else>
              <a href="#" class="dropdown-item" @click.prevent="navigateToProfile">
                <i class="fas fa-user-circle"></i>
                <span>Profile</span>
              </a>
              <a href="#" class="dropdown-item" @click.prevent="navigateToOrders">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </a>
              <div class="dropdown-divider"></div>
            </template>
            <a href="#" class="dropdown-item logout-item" @click.prevent="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </div>
        </div>

        <!-- Guest account dropdown (when not logged in) -->
        <div v-else class="guest-account-dropdown" ref="guestDropdownRef">
          <button class="account-icon-btn login-btn" title="Login / Register" @click="openAuthModal('login')">
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
} = useAppHeader(emit);

// Lifecycle hooks
onMounted(() => {
  initializeComponent();
});

onUnmounted(() => {
  cleanupComponent();
});
</script>

