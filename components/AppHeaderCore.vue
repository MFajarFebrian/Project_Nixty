<template>
  <header class="app-header" :class="{ 'mobile-nav-open': isMobileMenuOpen }">
    <div class="logo">
      <span class="logo-text">Nixty</span>
    </div>

    <!-- Mobile Menu Toggle Button -->
    <button 
      class="mobile-menu-toggle" 
      @click="toggleMobileMenu"
      :class="{ 'mobile-menu-toggle--active': isMobileMenuOpen }"
      v-if="!isAdminRoute && (!user || user.account_type !== 'admin')"
      aria-label="Toggle navigation menu"
      :aria-expanded="isMobileMenuOpen"
    >
      <span class="mobile-menu-toggle__line"></span>
      <span class="mobile-menu-toggle__line"></span>
      <span class="mobile-menu-toggle__line"></span>
    </button>

    <!-- Mobile Navigation Panel -->
    <nav class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }" v-if="!isAdminRoute && (!user || user.account_type !== 'admin')">
      <div class="nav-overlay" @click="closeMobileMenu"></div>
      <div class="nav-container">
        <div class="nav-header">
          <span class="nav-title">Navigation</span>
          <button 
            class="mobile-menu-close" 
            @click="closeMobileMenu"
            :class="{ 'mobile-menu-close--active': isMobileMenuOpen }"
            aria-label="Close navigation menu"
          >
            <span class="mobile-menu-close__line"></span>
            <span class="mobile-menu-close__line"></span>
            <span class="mobile-menu-close__line"></span>
          </button>
        </div>
        <div class="nav-items">
          <NuxtLink to="/home" class="nav-items__link" :class="{ 'nav-items__link--active': isActiveRoute('/home') }" @click="closeMobileMenu" aria-label="Go to Home page">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </NuxtLink>
          <NuxtLink to="/products" class="nav-items__link" :class="{ 'nav-items__link--active': isActiveRoute('/products') }" @click="closeMobileMenu" aria-label="Browse Products">
            <i class="fas fa-shopping-bag"></i>
            <span>Products</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Desktop Navigation Links -->
    <div class="desktop-nav-links" v-if="!isAdminRoute && (!user || user.account_type !== 'admin')">
      <NuxtLink to="/home" :class="{ 'active': isActiveRoute('/home') }">Home</NuxtLink>
      <NuxtLink to="/products" :class="{ 'active': isActiveRoute('/products') }">Products</NuxtLink>
    </div>

    <!-- Account Actions -->
    <div class="header-actions" v-if="!isAdminRoute">
      <!-- Account Actions -->
      <div class="auth-actions">
        <!-- User account dropdown (when logged in) -->
        <div v-if="user" class="user-account-dropdown" ref="userDropdownRef">
          <button class="account-icon-btn profile-btn" title="Account" @click="toggleUserDropdown" aria-label="Open user account menu">
            <div class="profile-picture-container">
              <ProfilePicture
                :src="null"
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
                  :src="null"
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
              <a href="#" class="dropdown-item admin-item" @click.prevent="navigateToDashboard" aria-label="Go to admin dashboard">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
              <div class="dropdown-divider"></div>
            </template>

            <!-- Regular user items (only for non-admin users) -->
            <template v-else>
              <a href="#" class="dropdown-item" @click.prevent="navigateToProfile" aria-label="View user profile">
                <i class="fas fa-user-circle"></i>
                <span>Profile</span>
              </a>
              <a href="#" class="dropdown-item" @click.prevent="navigateToOrders" aria-label="View order history">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </a>
              <div class="dropdown-divider"></div>
            </template>
            <a href="#" class="dropdown-item logout-item" @click.prevent="handleLogout" aria-label="Log out of account">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </div>
        </div>

        <!-- Guest account button (when not logged in) -->
        <div v-else class="guest-account">
          <button class="account-icon-btn login-btn" title="Login / Register" @click="openAuthModal('login')" aria-label="Open login and registration options">
            <i class="fas fa-user-circle"></i>
          </button>
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
  userDropdownRef,
  currentRoute,
  isMobileMenuOpen,
  isAdminRoute,

  // Methods
  toggleUserDropdown,
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

