<template>
  <div class="dashboard-page">
    <h1>Dashboard</h1>
    
    <div v-if="!user" class="loading-message">
      Loading user information...
    </div>
    
    <template v-else>
      <DashboardAdmin v-if="user.account_type === 'admin'" :user="user" />
      <div v-else class="redirecting-message">
        Redirecting to home...
      </div>
    </template>
  </div>
</template>

<script setup lang="js">
</script>

