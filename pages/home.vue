<template>
  <div class="home-page">
    <div class="hero-announcements-container">
      <!-- Hero Carousel -->
      <div class="hero-carousel-container">
        <div class="hero-carousel">
          <div v-if="isLoadingHeroSlides" class="hero-skeleton">
            <div class="skeleton-slide">
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-description"></div>
                <div class="skeleton-buttons"></div>
              </div>
            </div>
          </div>
          <div v-else-if="heroSlides.length === 0" class="no-data-message">No hero slides available</div>
          <div v-else class="carousel-slide" v-for="(slide, index) in heroSlides" :key="index" :class="{ active: currentSlide === index }">
            <div class="slide-background">
              <img :src="getImageUrl(slide.backgroundImage)" :alt="slide.title" class="slide-bg-image" loading="lazy" decoding="async" @error="handleImageError($event, slide.backgroundImage)" />
              <div class="slide-overlay"></div>
            </div>
            <div class="slide-content">
              <div class="slide-info">
                <h1 class="slide-title">{{ slide.title }}</h1>
                <div class="slide-badges">
                  <span class="badge new" v-if="slide.isNew">NEW</span>
                  <span class="badge category" v-for="category in slide.categories" :key="category">
                    {{ category }}
                  </span>
                </div>
                <p class="slide-description">{{ slide.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Controls -->
        <div class="carousel-controls">
          <button class="carousel-btn prev" @click="previousSlide">&lt;</button>
          <div class="carousel-dots">
            <button
              v-for="(slide, index) in heroSlides"
              :key="index"
              class="dot"
              :class="{ active: currentSlide === index }"
              @click="goToSlide(index)"
            ></button>
          </div>
          <button class="carousel-btn next" @click="nextSlide">&gt;</button>
        </div>
      </div>

      <!-- Announcements Section (40% right) -->
      <div class="announcements-section">
        <div class="section-header">
          <h2 class="section-title">Latest Updates</h2>
          <a href="/announcements" class="view-all-link">All</a>
        </div>

        <div class="announcements-carousel">
          <div class="announcements-slides">
            <div v-if="isLoadingAnnouncements" class="announcements-skeleton">
              <div class="skeleton-announcement" v-for="n in 3" :key="n">
                <div class="skeleton-announcement-image"></div>
                <div class="skeleton-announcement-content">
                  <div class="skeleton-announcement-title"></div>
                  <div class="skeleton-announcement-date"></div>
                </div>
              </div>
            </div>
            <div v-else-if="announcements.length === 0" class="no-data-message">No announcements available</div>
            <div v-else class="announcement-slide" v-for="(announcement, index) in announcements" :key="announcement.id" :class="{ active: currentAnnouncementSlide === index }">
              <img :src="getImageUrl(announcement.image)" :alt="announcement.title" class="announcement-image" loading="lazy" decoding="async" @error="handleImageError($event, announcement.image)" />
              <div class="announcement-content">
                <span class="announcement-badge" v-if="announcement.isNew">NEW</span>
                <h3 class="announcement-title">{{ announcement.title }}</h3>
                <p class="announcement-date">{{ announcement.date }}</p>
              </div>
            </div>
          </div>

          <!-- Announcement Carousel Controls -->
          <div class="announcement-controls">
            <button class="announcement-btn prev" @click="previousAnnouncement">&lt;</button>
            <div class="announcement-dots">
              <button
                v-for="(announcement, index) in announcements"
                :key="index"
                class="dot"
                :class="{ active: currentAnnouncementSlide === index }"
                @click="goToAnnouncement(index)"
              ></button>
            </div>
            <button class="announcement-btn next" @click="nextAnnouncement">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product List Section -->
    <div class="product-list-section" data-section="recommendations">
      <h2 class="section-title stellar-shimmer">Product List</h2>
      <div class="product-list-tabs">
        <button
          v-for="tab in productListTabs"
          :key="tab.id"
          class="recommendation-tab"
          :class="{ active: activeRecommendationTab === tab.id }"
          @click="setActiveRecommendationTab(tab.id)"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="product-list-carousel">
        <div v-if="isLoadingProducts || paginatedRecommendedProducts.length === 0" class="product-list-skeleton">
          <div class="skeleton-product-card" v-for="n in 8" :key="n">
            <div class="skeleton-product-image"></div>
            <div class="skeleton-product-content">
              <div class="skeleton-product-title"></div>
              <div class="skeleton-product-description"></div>
              <div class="skeleton-product-price"></div>
            </div>
          </div>
        </div>
        <div v-else class="product-list-grid">
          <ProductCard
            v-for="product in paginatedRecommendedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
      <!-- Pagination for Product List -->
      <div v-if="recommendedProductsTotalPages > 1" class="pagination-controls">
        <button
          v-for="page in recommendedProductsTotalPages"
          :key="page"
          class="pagination-btn"
          :class="{ active: recommendedProductsCurrentPage === page }"
          @click="setRecommendedProductsPage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>


  </div>
  <WhatsAppChat phone-number="1234567890" />
</template>

<script setup>
import { onMounted } from 'vue';
import { useHomePage } from '~/composables/useHomePage';
import { useHomePageInteractions } from '~/composables/useHomePageInteractions';
import { useImageLoader } from '~/composables/useImageLoader';
import ProductCard from '~/components/ProductCard.vue';
import WhatsAppChat from '~/components/WhatsAppChat.vue';

// Initialize home page state and data
const {
  homePageState,
  fetchHomePageData,
  heroSlides,
  announcements,
  products,
  productCategories,
  featuredDeal,
  sideDeals,
  productListTabs,
  isLoadingHeroSlides,
  isLoadingAnnouncements,
  isLoadingProducts,
  isLoadingCategories,
  isLoadingDeals,
  paginatedRecommendedProducts,
  recommendedProductsTotalPages,
} = useHomePage();

// Pass the complete state object to interactions
const {
  currentSlide,
  currentAnnouncementSlide,
  activeRecommendationTab,
  recommendedProductsCurrentPage,
  nextSlide,
  previousSlide,
  goToSlide,
  handleSlideInteraction,
  nextAnnouncement,
  previousAnnouncement,
  goToAnnouncement,
  setActiveRecommendationTab,
  setRecommendedProductsPage,
  formatCurrency
} = useHomePageInteractions({
  homePageState,
  heroSlides,
  announcements
});

const { getImageUrl, handleImageError } = useImageLoader();

// Set page title
useHead({
  title: 'Home'
});

// Fetch data on mount
onMounted(async () => {
  await fetchHomePageData();
});
</script>

<style scoped>
@import '~/assets/css/pages/home.css';

</style>


