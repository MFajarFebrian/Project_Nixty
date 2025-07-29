import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

/**
 * Middleware untuk melindungi halaman admin
 * Memastikan hanya user dengan role admin yang bisa mengakses
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on client-side if we're just doing a page reload
  if (process.client) {
    const { user, isReady, initUser } = useAuth()
    const { error } = useToast()

    console.log('Admin middleware: Checking access...', {
      isReady: isReady.value,
      hasUser: !!user.value,
      userType: user.value?.account_type
    })

    // Initialize user if not ready
    if (!isReady.value) {
      initUser()
      // Wait longer for initialization
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log('Admin middleware: After init check...', {
      isReady: isReady.value,
      hasUser: !!user.value,
      userType: user.value?.account_type
    })

    // Jika user belum login, redirect ke halaman login admin
    if (!user.value) {
      console.log('Admin middleware: No user found, redirecting to admin login')
      error('Please login first to access admin dashboard')
      return navigateTo('/admin')
    }

    // Jika user sudah login tapi bukan admin, redirect ke home
    if (user.value.account_type !== 'admin') {
      console.log('Admin middleware: User is not admin, redirecting to home')
      error('Access denied. Admin privileges required.')
      return navigateTo('/home')
    }

    console.log('Admin middleware: Access granted for admin user')
  }
  
  // Jika user adalah admin, izinkan akses
  return
})
