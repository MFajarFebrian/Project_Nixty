import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { initUser, isReady } = useAuth()
  
  // Initialize user from localStorage on app start
  if (process.client && !isReady.value) {
    initUser()
    console.log('Auth plugin: User initialized from localStorage')
  }
})
