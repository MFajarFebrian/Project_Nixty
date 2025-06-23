<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="confirm-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          {{ title }}
        </h3>
      </div>

      <div class="modal-body">
        <p class="confirm-message">{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button @click="$emit('cancel')" class="cancel-btn">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button 
          @click="$emit('confirm')" 
          class="confirm-btn"
          :class="confirmClass"
        >
          <i :class="confirmIcon"></i>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed } from 'vue';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  confirmClass: {
    type: String,
    default: 'danger' // 'danger', 'warning', 'primary'
  }
});

// Emits
const emit = defineEmits(['confirm', 'cancel']);

// Computed
const confirmIcon = computed(() => {
  const icons = {
    'danger': 'fas fa-trash',
    'warning': 'fas fa-exclamation-triangle',
    'primary': 'fas fa-check'
  };
  return icons[props.confirmClass] || 'fas fa-check';
});

// Methods
const handleOverlayClick = () => {
  emit('cancel');
};
</script>

<style scoped>
@import '~/assets/css/components/admin-modals.css';
</style>
