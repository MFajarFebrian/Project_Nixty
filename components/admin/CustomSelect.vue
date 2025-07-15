<template>
  <div class="custom-select-wrapper" ref="selectRef">
    <div class="selected-option" @click="toggleDropdown" :class="{ open: isOpen }">
      <span>{{ selectedLabel }}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <ul v-if="isOpen" class="options-list">
      <li 
        v-for="option in options" 
        :key="option.value" 
        @click="selectOption(option)"
        :class="{ selected: modelValue === option.value }"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    default: () => [], // { value: 'product_key', label: 'Product Key' }
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.custom-select-wrapper {
  position: relative;
  width: auto;
  min-width: 150px;
}

.selected-option {
  padding: 10px 40px 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--galaxy-transition-fast);
  color: var(--galaxy-starlight);
  gap: var(--galaxy-space-md);
  min-width: 150px;
  font-size: 14px;
  font-family: var(--galaxy-font-primary);
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.selected-option:hover {
  border-color: var(--galaxy-aurora-cyan);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 0 15px rgba(77, 208, 225, 0.2);
}

.selected-option.open {
  border-color: var(--galaxy-aurora-cyan);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 15px rgba(77, 208, 225, 0.3);
}

.selected-option i {
  position: absolute;
  right: 12px;
  color: var(--galaxy-cloud-gray);
  font-size: 12px;
  transition: transform 0.2s ease-in-out, color 0.2s ease-in-out;
}

.selected-option:hover i {
  color: var(--galaxy-aurora-cyan);
}

.selected-option.open i {
  transform: rotate(180deg);
  color: var(--galaxy-aurora-cyan);
}

.options-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--galaxy-card-gradient);
  border: 2px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-md);
  list-style: none;
  margin: 0;
  padding: 8px 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: var(--galaxy-z-dropdown);
  box-shadow: var(--galaxy-shadow-large), 0 0 20px rgba(77, 208, 225, 0.3);
  backdrop-filter: blur(10px);
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.options-list li {
  padding: 10px 16px;
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
  color: var(--galaxy-starlight);
  font-size: 14px;
  font-family: var(--galaxy-font-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.options-list li:last-child {
  border-bottom: none;
}

.options-list li:hover {
  background: rgba(77, 208, 225, 0.2);
  color: var(--galaxy-starlight);
  transform: translateX(4px);
}

.options-list li.selected {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  font-weight: 600;
  position: relative;
}

.options-list li.selected::before {
  content: '✓';
  position: absolute;
  right: 12px;
  color: var(--galaxy-starlight);
  font-weight: bold;
}

/* Custom scrollbar */
.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-sm);
}

.options-list::-webkit-scrollbar-thumb {
  background: var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: var(--galaxy-stellar-blue);
}
</style> 