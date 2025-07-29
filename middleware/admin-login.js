import { useAuth } from '~/composables/useAuth'

/**
 * Middleware untuk halaman login admin
 * Redirect admin yang sudah login ke dashboard
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side to prevent hydration issues
  if (process.server) return

  const { user, isReady, initUser } = useAuth()

  console.log('Admin login middleware: Checking user status...', {
    isReady: isReady.value,
    hasUser: !!user.value,
    userType: user.value?.account_type
  })

  // Initialize user if not ready
  if (!isReady.value) {
    initUser()
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('Admin login middleware: After init check...', {
    isReady: isReady.value,
    hasUser: !!user.value,
    userType: user.value?.account_type
  })

  // Jika user sudah login sebagai admin, redirect ke dashboard
  if (user.value && user.value.account_type === 'admin') {
    console.log('Admin login middleware: Admin already logged in, redirecting to dashboard')
    return navigateTo('/dashboard')
  }

  // Jika user login tapi bukan admin, tetap biarkan akses halaman login admin
  // mereka bisa logout dan login sebagai admin
  console.log('Admin login middleware: User not admin or not logged in, allowing access to login page')
  return
})
