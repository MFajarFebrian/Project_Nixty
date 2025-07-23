<template>
  <ClientOnly>
    <AppHeaderCore @open-auth-modal="$emit('open-auth-modal')" />
    <template #fallback>
      <header class="app-header">
        <div class="logo">
          <NuxtLink v-if="user?.account_type !== 'admin'" to="/">Nixty</NuxtLink>
        </div>
        <!-- Navigation hidden in fallback as it will be handled by AppHeaderCore -->
        <div class="header-actions">
          <div class="auth-actions">
            <div class="guest-account-dropdown">
              <button class="account-icon-btn login-btn" title="Login / Register">
                <i class="fas fa-user-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </template>
  </ClientOnly>
</template>

<script setup>
// Re-export the emits from the core component
const emit = defineEmits(['open-auth-modal'])
</script>

<style>
@import '~/assets/css/components/AppHeader.css';
</style>
