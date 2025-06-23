<template>
  <nav class="admin-breadcrumb">
    <div class="breadcrumb-container">
      <NuxtLink to="/" class="breadcrumb-item home">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </NuxtLink>
      
      <i class="fas fa-chevron-right breadcrumb-separator"></i>
      
      <NuxtLink to="/admin" class="breadcrumb-item admin">
        <i class="fas fa-tachometer-alt"></i>
        <span>Admin</span>
      </NuxtLink>
      
      <template v-if="currentTable">
        <i class="fas fa-chevron-right breadcrumb-separator"></i>
        <span class="breadcrumb-item current">
          <i :class="getTableIcon(currentTable)"></i>
          <span>{{ getTableDisplayName(currentTable) }}</span>
        </span>
      </template>
      
      <template v-if="customItems && customItems.length > 0">
        <template v-for="item in customItems" :key="item.name">
          <i class="fas fa-chevron-right breadcrumb-separator"></i>
          <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-item">
            <i v-if="item.icon" :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </NuxtLink>
          <span v-else class="breadcrumb-item current">
            <i v-if="item.icon" :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </span>
        </template>
      </template>
    </div>
  </nav>
</template>

<script setup lang="js">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Props
const props = defineProps({
  currentTable: {
    type: String,
    default: null
  },
  customItems: {
    type: Array,
    default: () => []
  }
});

// Get current route
const route = useRoute();

// Helper functions
const getTableDisplayName = (tableName) => {
  const displayNames = {
    'users': 'Users',
    'products': 'Products',
    'categories': 'Categories',
    'announcements': 'Announcements',
    'deals': 'Deals',
    'hero_slides': 'Hero Slides',
    'transactions': 'Transactions'
  };
  return displayNames[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1);
};

const getTableIcon = (tableName) => {
  const icons = {
    'users': 'fas fa-users',
    'products': 'fas fa-box',
    'categories': 'fas fa-tags',
    'announcements': 'fas fa-bullhorn',
    'deals': 'fas fa-percent',
    'hero_slides': 'fas fa-images',
    'transactions': 'fas fa-credit-card'
  };
  return icons[tableName] || 'fas fa-table';
};
</script>

<style scoped>
.admin-breadcrumb {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  margin-bottom: var(--galaxy-space-lg);
  backdrop-filter: blur(10px);
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  color: var(--galaxy-cloud-gray);
  text-decoration: none;
  font-size: 0.875rem;
  transition: var(--galaxy-transition-fast);
  padding: var(--galaxy-space-xs) var(--galaxy-space-sm);
  border-radius: var(--galaxy-radius-sm);
}

.breadcrumb-item:hover {
  color: var(--galaxy-aurora-cyan);
  background: rgba(77, 208, 225, 0.1);
}

.breadcrumb-item.home {
  color: var(--galaxy-starlight);
}

.breadcrumb-item.admin {
  color: var(--galaxy-nova-gold);
}

.breadcrumb-item.admin:hover {
  background: rgba(255, 215, 0, 0.1);
}

.breadcrumb-item.current {
  color: var(--galaxy-starlight);
  font-weight: 500;
  cursor: default;
}

.breadcrumb-item.current:hover {
  background: transparent;
}

.breadcrumb-separator {
  color: var(--galaxy-satellite-gray);
  font-size: 0.75rem;
}

.breadcrumb-item i {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-breadcrumb {
    padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  }
  
  .breadcrumb-container {
    gap: var(--galaxy-space-xs);
  }
  
  .breadcrumb-item {
    font-size: 0.8rem;
    padding: var(--galaxy-space-xs);
  }
  
  .breadcrumb-item span {
    display: none;
  }
  
  .breadcrumb-item.current span {
    display: inline;
  }
}
</style>
