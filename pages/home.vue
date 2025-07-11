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
                <div class="slide-actions">
                  <button class="btn primary-btn cosmic-button">Learn More</button>
                </div>
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
          <a href="/announcements" class="view-all-link">View All</a>
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

    <!-- Software Categories Section -->
    <div class="categories-section">
      <h2 class="section-title stellar-shimmer">Software Categories</h2>
      <p class="section-subtitle">Explore products based on their category.</p>
      
      <div v-if="isLoadingCategories" class="categories-skeleton">
        <div class="skeleton-category-card" v-for="n in 4" :key="n"></div>
      </div>
      <div v-else-if="productCategories.length === 0" class="no-data-message">
        No categories found.
      </div>
      <div v-else class="category-grid">
        <CategoryCard
          v-for="category in productCategories"
          :key="category.id"
          :category="category"
        />
      </div>
    </div>

    <!-- Featured Deals Section -->
    <div class="featured-deals-section alt-bg" data-section="deals">
      <h2 class="section-title stellar-shimmer">Featured Deals</h2>
      <div class="deals-grid">
        <div v-if="isLoadingDeals" class="deals-skeleton">
          <div class="skeleton-featured-deal">
            <div class="skeleton-deal-content">
              <div class="skeleton-deal-badge"></div>
              <div class="skeleton-deal-title"></div>
              <div class="skeleton-deal-description"></div>
              <div class="skeleton-deal-price"></div>
              <div class="skeleton-deal-button"></div>
            </div>
          </div>
          <div class="skeleton-side-deals">
            <div class="skeleton-side-deal" v-for="n in 2" :key="n">
              <div class="skeleton-side-deal-image"></div>
              <div class="skeleton-side-deal-content">
                <div class="skeleton-side-deal-title"></div>
                <div class="skeleton-side-deal-price"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!featuredDeal" class="no-data-message">No featured deals available</div>
        <div v-else class="deal-card large-deal">
          <div class="deal-background">
            <img :src="getImageUrl(featuredDeal.backgroundImage)" :alt="featuredDeal.title" class="deal-bg-image" @error="handleImageError($event, featuredDeal.backgroundImage)" />
            <div class="deal-overlay"></div>
          </div>
          <div class="deal-content">
            <span class="deal-badge">{{ featuredDeal.badge }}</span>
            <h3 class="deal-title">{{ featuredDeal.title }}</h3>
            <p class="deal-description">{{ featuredDeal.description }}</p>
            <div class="deal-pricing">
              <span class="old-price">{{ formatCurrency(featuredDeal.oldPrice) }}</span>
              <span class="new-price">{{ formatCurrency(featuredDeal.newPrice) }}</span>
            </div>
            <button class="btn primary-btn cosmic-button">Shop Now</button>
          </div>
        </div>
        <div class="side-deals">
          <div class="deal-card side-deal" v-for="deal in sideDeals" :key="deal.id">
            <img :src="getImageUrl(deal.image)" :alt="deal.title" class="deal-image" @error="handleImageError($event, deal.image)" />
            <div class="side-deal-content">
              <h4 class="deal-title">{{ deal.title }}</h4>
              <p class="deal-price">{{ formatCurrency(deal.price) }}</p>
              <span class="deal-badge">{{ deal.badge }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Newsletter Section -->
    <div class="newsletter-section cosmic-overlay">
      <div class="newsletter-content">
        <h2 class="section-title stellar-shimmer">Stay Updated</h2>
        <p>Get the latest software deals and updates delivered to your inbox</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Enter your email address" class="newsletter-input" />
          <button class="btn newsletter-btn cosmic-button">Subscribe</button>
        </div>
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
import CategoryCard from '~/components/CategoryCard.vue';
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
  ...homePageState,
  heroSlides,
  announcements
});

const { getImageUrl, handleImageError } = useImageLoader();

// Fetch data on mount
onMounted(async () => {
  await fetchHomePageData();
});
</script>

<style scoped>
@import '~/assets/css/pages/home.css';

.categories-section {
  padding: var(--galaxy-space-2xl) var(--galaxy-space-lg);
  text-align: center;
}

.section-subtitle {
  max-width: 600px;
  margin: 0 auto var(--galaxy-space-xl) auto;
  color: var(--galaxy-cloud-gray);
  font-size: 1.1rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--galaxy-space-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.categories-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--galaxy-space-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.skeleton-category-card {
  height: 110px;
  background-color: var(--galaxy-dark-matter-deep);
  border-radius: var(--galaxy-radius-lg);
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { background-color: var(--galaxy-dark-matter-deep); }
  50% { background-color: var(--galaxy-asteroid-gray); }
  100% { background-color: var(--galaxy-dark-matter-deep); }
}
</style>


