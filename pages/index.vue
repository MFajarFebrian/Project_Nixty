<template>
  <div>
    <!-- This page redirects to /home. It acts as the root entry point. -->
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