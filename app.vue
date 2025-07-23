<template>
  <div>
    <AppHeader @open-auth-modal="openAuthModal" />
    <NuxtRouteAnnouncer />
    <main class="main-content">
      <NuxtPage />
    </main>

    <!-- Auth Modal -->
    <AuthModal
      v-if="isAuthModalOpen"
      :is-open="isAuthModalOpen"
      :default-tab="authModalTab"
      @close="closeAuthModal"
    />
    
    <!-- Global Toast Notifications -->
    <ToastNotifications />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import '~/assets/css/global/main.css';
import { useAuth } from '~/composables/useAuth';
import { useRoute, useRouter } from '#app';
import ToastNotifications from '~/components/ToastNotifications.vue';

// Auth modal state
const isAuthModalOpen = ref(false);
const authModalTab = ref('login');

// Use auth composable
const { user, initUser } = useAuth();
const route = useRoute();
const router = useRouter();

// Computed property to check if user is admin
const isAdmin = computed(() => {
  return user.value && user.value.account_type === 'admin';
});

// Methods
const openAuthModal = (tab = 'login') => {
  console.log('Opening auth modal with tab:', tab);
  authModalTab.value = tab;
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  console.log('Closing auth modal');
  isAuthModalOpen.value = false;
  
  // Remove modal query parameter if it exists
  if (route.query.modal) {
    const newQuery = { ...route.query };
    delete newQuery.modal;
    router.replace({ query: newQuery });
  }
};

// Watch for modal query parameter
watch(() => route.query.modal, (modalType) => {
  if (modalType === 'login' || modalType === 'register') {
    openAuthModal(modalType);
  }
}, { immediate: true });

// Initialize user on mount
onMounted(() => {
  initUser();
});

// Use Nuxt's useHead correctly
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Nixty Demo` : 'Nixty Demo';
  },
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    }
  ]
});
</script>


