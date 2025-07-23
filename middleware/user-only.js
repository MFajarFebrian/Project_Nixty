import { useAuth } from '~/composables/useAuth'

/**
 * Middleware untuk mencegah admin mengakses halaman user biasa
 * Admin akan diarahkan ke dashboard
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  // Jika user adalah admin, redirect ke dashboard
  if (user.value && user.value.account_type === 'admin') {
    return navigateTo('/dashboard')
  }

  // Jika bukan admin, izinkan akses
  return
})
