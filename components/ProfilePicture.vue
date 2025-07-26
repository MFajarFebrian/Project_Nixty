<template>
  <div class="profile-picture-wrapper">
    <!-- Always show something -->
    <div v-if="processedSrc && !imageError" class="profile-picture-container">
      <img 
        :src="processedSrc"
        :alt="altText"
        class="profile-picture-img"
        @error="handleImageError"
        @load="handleImageLoad"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
    </div>
    
    <!-- Fallback -->
    <div v-else class="profile-picture-fallback">
      <i v-if="!customFallback" class="fas fa-user-circle"></i>
      <span v-else class="fallback-initial">{{ userInitial }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Profile picture'
  },
  userName: {
    type: String,
    default: ''
  },
  userId: {
    type: [String, Number],
    default: null
  },
  customFallback: {
    type: Boolean,
    default: false
  }
});

const imageError = ref(false);

// Computed properties
const processedSrc = computed(() => {
  if (!props.src) return '';
  
  let url = props.src;
  console.log('ProfilePicture: Processing URL:', url);
  
  // Process any custom profile picture URLs here if needed in the future
  
  return url;
});

const altText = computed(() => props.alt || 'Profile picture');

const userInitial = computed(() => {
  if (props.userName) {
    return props.userName.charAt(0).toUpperCase();
  }
  return 'U';
});

// Methods
const handleImageError = () => {
  console.warn('ProfilePicture: Image failed to load:', processedSrc.value);
  imageError.value = true;
};

const handleImageLoad = () => {
  console.log('ProfilePicture: Image loaded successfully:', processedSrc.value);
  imageError.value = false;
};
</script>

<style scoped>
.profile-picture-wrapper {
  display: inline-block;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}

.profile-picture-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.profile-picture-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.profile-picture-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--galaxy-asteroid-gray, #2c2c54);
  color: var(--galaxy-starlight, #e8f4f8);
}

.profile-picture-fallback i {
  font-size: inherit;
}

.fallback-initial {
  font-size: 1.5em;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
