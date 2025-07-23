<template>
  <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
    <h1 style="color: #333;">🎉 Nixty is Working!</h1>
    <p style="color: #666; margin: 1rem 0;">Deployment successful on Vercel</p>
    <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
      <h3>Environment Check:</h3>
      <p><strong>Node ENV:</strong> {{ nodeEnv }}</p>
      <p><strong>Base URL:</strong> {{ baseUrl }}</p>
      <p><strong>Timestamp:</strong> {{ currentTime }}</p>
    </div>
    <div style="margin-top: 2rem;">
      <NuxtLink to="/home" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Go to Home Page
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const nodeEnv = config.public.nodeEnv || 'unknown'
const baseUrl = config.public.baseUrl || 'unknown'
const currentTime = new Date().toISOString()

useHead({
  title: 'Nixty Test Page'
})
</script>
