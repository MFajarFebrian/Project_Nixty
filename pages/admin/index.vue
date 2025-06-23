<template>
  <div class="admin-dashboard">
    <!-- Breadcrumb Navigation -->
    <AdminBreadcrumb />

    <!-- Header Section -->
    <div class="admin-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fas fa-tachometer-alt"></i>
          Admin Dashboard
        </h1>
        <p class="dashboard-subtitle">Manage your database and system settings</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Dashboard</h3>
        <p>{{ error }}</p>
        <button @click="fetchOverview" class="retry-btn">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Quick Stats Cards -->
      <div class="stats-grid">
        <div 
          v-for="stat in getQuickStats" 
          :key="stat.title"
          class="stat-card"
          :class="`stat-${stat.color}`"
        >
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-title">{{ stat.title }}</p>
            <p v-if="stat.change" class="stat-change">{{ stat.change }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Tables Overview -->
        <div class="tables-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-table"></i>
              Database Tables
            </h2>
            <p>Click on a table to manage its data</p>
          </div>
          
          <div class="tables-grid">
            <NuxtLink
              v-for="(tableInfo, tableName) in tablesInfo"
              :key="tableName"
              :to="`/admin/tables/${tableName}`"
              class="table-card"
            >
              <div class="table-icon">
                <i :class="getTableIcon(tableName)"></i>
              </div>
              <div class="table-info">
                <h3>{{ tableInfo.displayName }}</h3>
                <p class="table-count">{{ tableInfo.recordCount }} records</p>
                <p class="table-columns">{{ tableInfo.columnCount }} columns</p>
              </div>
              <div class="table-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-clock"></i>
              Recent Activity
            </h2>
            <p>Latest transactions and changes</p>
          </div>
          
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="activity-content">
                <h4>{{ activity.product_name }}</h4>
                <p class="activity-details">
                  Order: {{ activity.order_id }} • 
                  {{ formatCurrency(activity.amount) }}
                </p>
                <p class="activity-time">{{ formatDate(activity.created_at) }}</p>
              </div>
              <div class="activity-status">
                <span 
                  class="status-badge"
                  :class="`status-${getStatusBadgeClass(activity.status)}`"
                >
                  {{ activity.status }}
                </span>
              </div>
            </div>
            
            <div v-if="recentActivity.length === 0" class="no-activity">
              <i class="fas fa-inbox"></i>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<script setup lang="js">
import { onMounted } from 'vue';
import AdminBreadcrumb from '~/components/admin/AdminBreadcrumb.vue';
import ToastNotifications from '~/components/admin/ToastNotifications.vue';
import { useAdminAuth } from '~/composables/useAdminAuth';
import { useAdminOverview } from '~/composables/useAdminOverview';

// Set page meta
definePageMeta({
  layout: 'default'
});

// Admin authentication
const { requireAdmin } = useAdminAuth();

// Admin overview composable
const {
  loading,
  error,
  statistics,
  recentActivity,
  tablesInfo,
  getQuickStats,
  fetchOverview,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  getTableIcon
} = useAdminOverview();

// Check admin access on mount
onMounted(async () => {
  if (!requireAdmin()) {
    return;
  }
  
  await fetchOverview();
});
</script>

<style scoped>
@import '~/assets/css/pages/admin-dashboard.css';
</style>
