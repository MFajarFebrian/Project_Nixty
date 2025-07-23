<template>
  <div class="info-section">
    <h2 class="section-title stellar-shimmer">{{ title }}</h2>
    <div class="info-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.info-section {
  margin-top: var(--galaxy-space-3xl);
  padding-top: var(--galaxy-space-2xl);
  border-top: 1px solid rgba(var(--galaxy-moonbeam-rgb, 255, 255, 255), 0.1);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--galaxy-space-lg);
  color: var(--galaxy-starlight);
}

.info-content {
  background: var(--galaxy-card-gradient);
  padding: var(--galaxy-space-xl);
  border-radius: var(--galaxy-radius-lg);
  border: 1px solid rgba(var(--galaxy-moonbeam-rgb, 255, 255, 255), 0.1);
  box-shadow: var(--galaxy-shadow-medium);
}
</style>
