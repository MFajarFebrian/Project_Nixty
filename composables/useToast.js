/**
 * Toast notification composable
 * Provides a simple toast notification system for user feedback
 */

import { ref, readonly } from 'vue';

// Global toast state
const toasts = ref([]);
let toastId = 0;

export function useToast() {
  
  /**
   * Add a new toast notification
   */
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      timestamp: Date.now()
    };
    
    toasts.value.push(toast);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };
  
  /**
   * Remove a toast by ID
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  /**
   * Clear all toasts
   */
  const clearToasts = () => {
    toasts.value = [];
  };
  
  /**
   * Convenience methods for different toast types
   */
  const success = (message, duration = 4000) => {
    return addToast(message, 'success', duration);
  };
  
  const error = (message, duration = 6000) => {
    return addToast(message, 'error', duration);
  };
  
  const warning = (message, duration = 5000) => {
    return addToast(message, 'warning', duration);
  };
  
  const info = (message, duration = 4000) => {
    return addToast(message, 'info', duration);
  };
  
  return {
    // State
    toasts: readonly(toasts),
    
    // Methods
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
}
