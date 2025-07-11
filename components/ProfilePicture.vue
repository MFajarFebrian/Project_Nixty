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
  
  // Jika URL Google, optimasi untuk ukuran dan parameter
  if (url.includes('googleusercontent.com')) {
    // Remove existing size parameter
    url = url.replace(/[?&]s=\d+/, '');
    url = url.replace(/[?&]sz=\d+/, '');
    
    // Add size parameter yang tepat
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}sz=200`;
    
    console.log('ProfilePicture: Google URL processed:', url);
  }
  
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
  
  // Coba alternatif URL untuk Google jika ada
  if (props.src && props.src.includes('googleusercontent.com')) {
    console.log('ProfilePicture: Trying alternative Google URL approaches...');
    
    // Coba dengan parameter yang berbeda
    const baseUrl = props.src.split('?')[0].split('=s')[0];
    const alternativeUrls = [
      `${baseUrl}=s200-c`,
      `${baseUrl}=s96-c`, 
      `${baseUrl}?sz=200`,
      baseUrl // URL asli tanpa parameter
    ];
    
    console.log('ProfilePicture: Available alternatives:', alternativeUrls);
  }
  
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
