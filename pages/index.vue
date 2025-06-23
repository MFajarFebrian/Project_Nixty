<template>
  <div>
    <!-- This page will redirect to /login or /dashboard, so we don't need content here -->
  </div>
</template>

<script setup lang="js">
// Use Nuxt's built-in navigation utilities
const router = useRouter();

// Redirect to home page
onMounted(() => {
  router.push('/home');
});
</script> 