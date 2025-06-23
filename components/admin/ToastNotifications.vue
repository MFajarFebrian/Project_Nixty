<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          <i :class="getToastIcon(toast.type)" class="toast-icon"></i>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click.stop="removeToast(toast.id)" class="toast-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="js">
import { useToast } from '~/composables/useToast';

// Use toast composable
const { toasts, removeToast } = useToast();

// Get appropriate icon for toast type
const getToastIcon = (type) => {
  const icons = {
    'success': 'fas fa-check-circle',
    'error': 'fas fa-exclamation-circle',
    'warning': 'fas fa-exclamation-triangle',
    'info': 'fas fa-info-circle'
  };
  return icons[type] || icons.info;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 100px;
  right: var(--galaxy-space-xl);
  z-index: var(--galaxy-z-toast, 9999);
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
  max-width: 400px;
  pointer-events: none;
}

.toast {
  background: rgba(15, 15, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--galaxy-radius-md);
  padding: var(--galaxy-space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--galaxy-space-sm);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  pointer-events: auto;
  min-width: 300px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  flex: 1;
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.4;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: var(--galaxy-space-xs);
  border-radius: var(--galaxy-radius-sm);
  transition: var(--galaxy-transition-fast);
  flex-shrink: 0;
}

.toast-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

/* Toast type styles */
.toast-success {
  border-left: 4px solid #4caf50;
  background: rgba(15, 25, 15, 0.95);
}

.toast-success .toast-icon {
  color: #4caf50;
}

.toast-error {
  border-left: 4px solid #f44336;
  background: rgba(25, 15, 15, 0.95);
}

.toast-error .toast-icon {
  color: #f44336;
}

.toast-warning {
  border-left: 4px solid #ff9800;
  background: rgba(25, 20, 15, 0.95);
}

.toast-warning .toast-icon {
  color: #ff9800;
}

.toast-info {
  border-left: 4px solid #2196f3;
  background: rgba(15, 20, 25, 0.95);
}

.toast-info .toast-icon {
  color: #2196f3;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 80px;
    right: var(--galaxy-space-md);
    left: var(--galaxy-space-md);
    max-width: none;
  }

  .toast {
    min-width: auto;
  }
}
</style>
