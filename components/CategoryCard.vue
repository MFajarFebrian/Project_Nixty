<template>
  <div class="category-card" @click="navigateToCategory">
    <!-- Category Icon -->
    <div class="category-icon">
      <div class="icon-container">
        <span v-if="categoryIcon" class="category-icon-emoji">{{ categoryIcon }}</span>
        <span v-else class="category-icon-fallback">{{ nameInitial }}</span>
      </div>
    </div>

    <!-- Category Info -->
    <div class="category-content">
      <h3 class="category-name">{{ category.name }}</h3>
      <p class="product-count">{{ category.productCount }} Products</p>
    </div>

    <!-- Arrow Icon -->
    <div class="card-arrow">
      <span>&#8594;</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  category: {
    type: Object,
    required: true,
    default: () => ({
      id: 0,
      name: 'Unnamed Category',
      slug: '',
      productCount: 0,
      mainProductSlug: null,
    })
  }
});

// Extract initial for fallback icon
const nameInitial = computed(() => {
  return props.category.name ? props.category.name.charAt(0).toUpperCase() : 'C';
});

// Map category names to icons
const categoryIcon = computed(() => {
  const iconMap = {
    'Microsoft Office': '📊',
    'Microsoft Project': '📝',
    'Microsoft Visio': '📈',
    'Windows': '🪟',
    'Microsoft 365': '☁️',
    'Autodesk': '🏗️',
    'Adobe': '🎨',
    'Antivirus': '🛡️',
    'Games': '🎮',
  };

  return iconMap[props.category.name] || null;
});

const navigateToCategory = () => {
  // Gunakan slug dari category props untuk navigasi ke halaman products dengan filter kategori
  const categorySlug = props.category.slug || '';
  
  if (categorySlug) {
    // Navigasi ke halaman products dengan filter kategori berdasarkan slug
    router.push(`/products?category=${categorySlug}`);
  } else {
    console.warn('Category slug tidak tersedia:', props.category);
    // Fallback ke halaman products umum
    router.push('/products');
  }
};
</script>

<style scoped>
.category-card {
  display: flex;
  align-items: center;
  background: var(--galaxy-card-gradient, linear-gradient(145deg, #16213e, #1a1a2e));
  border: 1px solid var(--galaxy-asteroid-gray, #2c2c54);
  border-radius: var(--galaxy-radius-lg, 12px);
  padding: 1.25rem;
  transition: all var(--galaxy-transition-normal, 0.3s ease);
  box-shadow: var(--galaxy-shadow-medium, 0 4px 16px rgba(0,0,0,0.4));
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background-image: radial-gradient(circle, rgba(77, 208, 225, 0.1) 1px, transparent 1px);
  background-size: 15px 15px;
  opacity: 0.2;
  transition: opacity 0.5s ease;
  animation: backgroundFloat 120s linear infinite;
  pointer-events: none;
}

@keyframes backgroundFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50%, -50%); }
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: var(--galaxy-aurora-cyan, #4dd0e1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), var(--galaxy-glow-cyan, 0 0 20px rgba(77,208,225,0.3));
}

.category-card:hover::before {
  opacity: 0.4;
}

.category-icon {
  margin-right: 1.25rem;
  flex-shrink: 0;
}

.icon-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(77, 208, 225, 0.3), rgba(77, 208, 225, 0.1));
  font-size: 1.75rem;
  color: var(--galaxy-starlight, #e8f4f8);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(77, 208, 225, 0.2);
}

.icon-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.category-icon-emoji, .category-icon-fallback {
  position: relative;
  z-index: 1;
}

.category-content {
  flex-grow: 1;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--galaxy-starlight, #e8f4f8);
}

.product-count {
  font-size: 0.9rem;
  color: var(--galaxy-cloud-gray, #b8b8d4);
  margin: 0;
}

.card-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(77, 208, 225, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--galaxy-aurora-cyan, #4dd0e1);
  font-size: 1.25rem;
  margin-left: auto;
  transition: all var(--galaxy-transition-normal, 0.3s ease);
  opacity: 0.7;
}

.category-card:hover .card-arrow {
  background: rgba(77, 208, 225, 0.2);
  transform: translateX(3px);
  opacity: 1;
}
</style> 