export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (process.server) return

  const TRANSACTION_SESSION_KEY = 'nixty_transaction_session'
  const CHECKOUT_STATE_KEY = 'nixty_checkout_state'
  const USER_SESSION_KEY = 'nixty_user_session'
  
  // Enhanced mobile detection
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           window.innerWidth <= 768
  }

  // Prevent browser from refreshing or closing during transaction
  const preventNavigation = (enable) => {
    if (enable) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('pagehide', handlePageHide)
      window.addEventListener('visibilitychange', handleVisibilityChange)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  const handleBeforeUnload = (e) => {
    const transactionState = getTransactionState()
    if (transactionState.active) {
      e.preventDefault()
      e.returnValue = 'You have an active transaction. Are you sure you want to leave?'
      return e.returnValue
    }
  }

  const handlePageHide = () => {
    const transactionState = getTransactionState()
    if (transactionState.active) {
      // Save current state before page hides
      saveTransactionState({
        ...transactionState,
        lastActivity: Date.now(),
        pageHidden: true
      })
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handlePageHide()
    } else {
      // Page is visible again, check for active transactions
      const transactionState = getTransactionState()
      if (transactionState.active && transactionState.pageHidden) {
        // Show notification that transaction is still active
        showTransactionResumeNotification()
      }
    }
  }

  // Save transaction state to localStorage
  const saveTransactionState = (state) => {
    try {
      localStorage.setItem(TRANSACTION_SESSION_KEY, JSON.stringify(state))
      // Also save to sessionStorage for current tab
      sessionStorage.setItem(TRANSACTION_SESSION_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save transaction state:', e)
    }
  }

  // Get transaction state from storage
  const getTransactionState = () => {
    try {
      // Try sessionStorage first, then localStorage
      const sessionState = sessionStorage.getItem(TRANSACTION_SESSION_KEY)
      const localState = localStorage.getItem(TRANSACTION_SESSION_KEY)
      
      const state = sessionState ? JSON.parse(sessionState) : 
                   localState ? JSON.parse(localState) : 
                   { active: false }
      
      return state
    } catch (e) {
      console.warn('Failed to get transaction state:', e)
      return { active: false }
    }
  }

  // Clear transaction state
  const clearTransactionState = () => {
    try {
      localStorage.removeItem(TRANSACTION_SESSION_KEY)
      sessionStorage.removeItem(TRANSACTION_SESSION_KEY)
      localStorage.removeItem(CHECKOUT_STATE_KEY)
      sessionStorage.removeItem(CHECKOUT_STATE_KEY)
      preventNavigation(false)
    } catch (e) {
      console.warn('Failed to clear transaction state:', e)
    }
  }

  // Save checkout form data
  const saveCheckoutState = (checkoutData) => {
    try {
      const state = {
        ...checkoutData,
        timestamp: Date.now(),
        isMobile: isMobile()
      }
      localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(state))
      sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save checkout state:', e)
    }
  }

  // Get saved checkout state
  const getCheckoutState = () => {
    try {
      const sessionState = sessionStorage.getItem(CHECKOUT_STATE_KEY)
      const localState = localStorage.getItem(CHECKOUT_STATE_KEY)
      
      const state = sessionState ? JSON.parse(sessionState) : 
                   localState ? JSON.parse(localState) : null
      
      // Check if state is not too old (1 hour)
      if (state && (Date.now() - state.timestamp) > 3600000) {
        clearCheckoutState()
        return null
      }
      
      return state
    } catch (e) {
      console.warn('Failed to get checkout state:', e)
      return null
    }
  }

  // Clear checkout state
  const clearCheckoutState = () => {
    try {
      localStorage.removeItem(CHECKOUT_STATE_KEY)
      sessionStorage.removeItem(CHECKOUT_STATE_KEY)
    } catch (e) {
      console.warn('Failed to clear checkout state:', e)
    }
  }

  // Show notification when transaction can be resumed
  const showTransactionResumeNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Transaction Active', {
        body: 'You have an active transaction that can be completed.',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: 'transaction-resume'
      })
    }
  }

  // Request notification permission for mobile
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (e) {
        console.warn('Failed to request notification permission:', e)
        return false
      }
    }
    return Notification.permission === 'granted'
  }

  // Wake lock API for keeping screen active during transaction
  let wakeLock = null
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && isMobile()) {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
        wakeLock.addEventListener('release', () => {
          console.log('Screen Wake Lock was released')
        })
        console.log('Screen Wake Lock is active')
        return true
      } catch (e) {
        console.warn('Failed to request wake lock:', e)
        return false
      }
    }
    return false
  }

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
      wakeLock = null
    }
  }

  // Auto-save form data on mobile
  const setupAutoSave = (formData, interval = 5000) => {
    const autoSaveInterval = setInterval(() => {
      if (typeof formData === 'function') {
        const data = formData()
        if (data) {
          saveCheckoutState(data)
        }
      }
    }, interval)

    return () => clearInterval(autoSaveInterval)
  }

  // Handle app state changes (mobile focus/blur)
  const handleAppStateChange = () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background, save state
        const transactionState = getTransactionState()
        if (transactionState.active) {
          saveTransactionState({
            ...transactionState,
            backgroundTime: Date.now()
          })
        }
      } else {
        // App came to foreground, check if we need to resume
        const transactionState = getTransactionState()
        if (transactionState.active && transactionState.backgroundTime) {
          const backgroundDuration = Date.now() - transactionState.backgroundTime
          // If was in background for more than 1 minute, show resume option
          if (backgroundDuration > 60000) {
            showTransactionResumeNotification()
          }
        }
      }
    })
  }

  // Initialize mobile optimizations
  const initializeMobileFeatures = async () => {
    if (isMobile()) {
      console.log('Mobile device detected, initializing mobile features...')
      
      // Request notification permission
      await requestNotificationPermission()
      
      // Setup app state change handling
      handleAppStateChange()
      
      // Add touch feedback for better UX
      document.addEventListener('touchstart', (e) => {
        if (e.target.matches('button, .btn, .clickable')) {
          e.target.style.transform = 'scale(0.95)'
          e.target.style.opacity = '0.8'
        }
      })
      
      document.addEventListener('touchend', (e) => {
        if (e.target.matches('button, .btn, .clickable')) {
          setTimeout(() => {
            e.target.style.transform = ''
            e.target.style.opacity = ''
          }, 150)
        }
      })

      // Prevent zoom on input focus
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
          }
        })
        
        input.addEventListener('blur', () => {
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
          }
        })
      })
    }
  }

  // Expose methods globally
  return {
    provide: {
      mobileSession: {
        isMobile,
        saveTransactionState,
        getTransactionState,
        clearTransactionState,
        saveCheckoutState,
        getCheckoutState,
        clearCheckoutState,
        preventNavigation,
        requestWakeLock,
        releaseWakeLock,
        setupAutoSave,
        initializeMobileFeatures
      }
    }
  }
})
