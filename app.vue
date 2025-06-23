<template>
  <div>
    <AppHeader @open-auth-modal="openAuthModal" />
    <NuxtRouteAnnouncer />
    <main class="main-content">
      <NuxtPage />
    </main>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="isAuthModalOpen"
      :default-tab="authModalTab"
      @close="closeAuthModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '~/assets/css/global/main.css';

// Auth modal state
const isAuthModalOpen = ref(false);
const authModalTab = ref('login');

// Methods
const openAuthModal = (tab = 'login') => {
  authModalTab.value = tab;
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;
};


useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    }
  ]
});
</script>


