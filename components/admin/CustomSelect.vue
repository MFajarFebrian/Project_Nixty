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
.custom-select-wrapper {
  position: relative;
  width: auto; /* Allow it to size to content */
}

.selected-option {
  padding: var(--galaxy-space-sm) var(--galaxy-space-md);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--galaxy-radius-md);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--galaxy-transition-fast);
  color: var(--galaxy-cloud-gray);
  gap: var(--galaxy-space-md);
  min-width: 150px;
}

.selected-option.open,
.selected-option:hover {
  border-color: var(--galaxy-aurora-cyan);
  color: var(--galaxy-starlight);
}

.selected-option.open {
  box-shadow: 0 0 0 2px rgba(77, 208, 225, 0.2);
}

.selected-option i {
  transition: transform 0.2s ease-in-out;
}

.selected-option.open i {
  transform: rotate(180deg);
}

.options-list {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: #2a314b;
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-md);
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1010;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.options-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--galaxy-starlight);
}

.options-list li:hover {
  background-color: rgba(77, 208, 225, 0.2);
}

.options-list li.selected {
  background-color: var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
  font-weight: bold;
}
</style> 