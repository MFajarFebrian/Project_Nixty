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
    <WhatsAppChat phone-number="1234567890" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '~/assets/css/global/main.css';
import { useAuth } from '~/composables/useAuth';

// Auth modal state
const isAuthModalOpen = ref(false);
const authModalTab = ref('login');

// Use auth composable
const { initUser } = useAuth();

// Methods
const openAuthModal = (tab = 'login') => {
  console.log('Opening auth modal with tab:', tab);
  authModalTab.value = tab;
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  console.log('Closing auth modal');
  isAuthModalOpen.value = false;
};

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


