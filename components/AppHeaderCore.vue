<template>
  <header class="app-header">
    <div class="logo">
      <NuxtLink v-if="!user || user.account_type !== 'admin'" to="/">Nixty</NuxtLink>
      <span v-else class="logo-text">Nixty</span>
    </div>

    <!-- Desktop Navigation Links -->
    <div class="desktop-nav-links" v-if="!user || user.account_type !== 'admin'">
      <NuxtLink to="/home" :class="{ 'active': isActiveRoute('/home') }">Home</NuxtLink>
      <NuxtLink to="/products" :class="{ 'active': isActiveRoute('/products') }">Products</NuxtLink>
    </div>

    <!-- Account Actions -->
    <div class="header-actions">
      <!-- Account Actions -->
      <div class="auth-actions">
        <!-- User account dropdown (when logged in) -->
        <div v-if="user" class="user-account-dropdown" ref="userDropdownRef">
          <button class="account-icon-btn profile-btn" title="Account" @click="toggleUserDropdown" aria-label="Open user account menu">
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

  // Methods
  toggleUserDropdown,
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

