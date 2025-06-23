<template>
  <div class="home-page">
    <div class="hero-announcements-container">
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
            <img :src="slide.backgroundImage" :alt="slide.title" class="slide-bg-image" loading="lazy" decoding="async" />
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
                <button class="btn secondary-btn">Download Trial</button>
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
            <img :src="announcement.image" :alt="announcement.title" class="announcement-image" loading="lazy" decoding="async" />
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
        <div v-if="isLoadingProducts || filteredRecommendedProducts.length === 0" class="product-list-skeleton">
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
          <div
            v-for="product in filteredRecommendedProducts"
            :key="product.id"
            class="recommendation-card"
          >
            <div class="recommendation-image">
              <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" decoding="async" />
              <div class="recommendation-badges">
                <span class="badge trending" v-if="product.isTrending">Trending</span>
                <span class="badge updated" v-if="product.recentlyUpdated">New</span>
              </div>
            </div>
            <div class="recommendation-info">
              <h4 class="recommendation-title">{{ product.name }}</h4>
              <p class="recommendation-description">{{ product.shortDescription }}</p>
              <div class="recommendation-price">
                <span class="price">{{ product.price }}</span>
                <span class="period" v-if="product.period">{{ product.period }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="categories-section">
      <h2 class="section-title stellar-shimmer">Software Categories</h2>
      <div class="category-tabs">
        <button
          v-for="category in productCategories"
          :key="category.id"
          class="category-tab"
          :class="{ active: activeCategory === category.id }"
          @click="setActiveCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <div class="products-showcase">
        <div v-if="isLoadingProducts || filteredProducts.length === 0" class="products-skeleton">
          <div class="skeleton-product-card" v-for="n in 6" :key="n">
            <div class="skeleton-product-image"></div>
            <div class="skeleton-product-content">
              <div class="skeleton-product-title"></div>
              <div class="skeleton-product-description"></div>
              <div class="skeleton-product-price"></div>
            </div>
          </div>
        </div>
        <div v-else class="products-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image-container">
              <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" />
              <div class="product-badges">
                <span class="badge new" v-if="product.isNew">NEW</span>
                <span class="badge discount" v-if="product.discount">{{ product.discount }}% OFF</span>
                <div class="product-timer" v-if="product.timeLeft">
                  ⏰ <span>{{ product.timeLeft }}</span>
                </div>
              </div>
              <div class="product-overlay">
                <button class="btn quick-view-btn">Quick View</button>
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-title">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">
                <span class="price">{{ product.price }}</span>
                <span class="period" v-if="product.period">{{ product.period }}</span>
              </div>
              <button class="btn buy-btn cosmic-button">Add to Cart</button>
            </div>
          </div>
        </div>
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
            <img :src="featuredDeal.backgroundImage" :alt="featuredDeal.title" class="deal-bg-image" />
            <div class="deal-overlay"></div>
          </div>
          <div class="deal-content">
            <span class="deal-badge">{{ featuredDeal.badge }}</span>
            <h3 class="deal-title">{{ featuredDeal.title }}</h3>
            <p class="deal-description">{{ featuredDeal.description }}</p>
            <div class="deal-price">
              <span class="old-price">{{ featuredDeal.oldPrice }}</span>
              <span class="new-price">{{ featuredDeal.newPrice }}</span>
              <span class="discount">{{ featuredDeal.discount }}</span>
            </div>
            <button class="btn deal-btn cosmic-button">Get Deal Now</button>
          </div>
        </div>

        <div class="deals-sidebar">
          <div class="deal-card small-deal" v-for="deal in sideDeals" :key="deal.id">
            <img :src="deal.image" :alt="deal.title" class="small-deal-image" />
            <div class="small-deal-content">
              <span class="deal-badge" v-if="deal.badge">{{ deal.badge }}</span>
              <h4 class="small-deal-title">{{ deal.title }}</h4>
              <div class="small-deal-price">
                <span class="new-price">{{ deal.price }}</span>
                <span class="discount" v-if="deal.discount">{{ deal.discount }}</span>
              </div>
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
</template>

<script setup lang="js">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useHomePage } from '../composables/useHomePage';
import { useHomePageInteractions } from '../composables/useHomePageInteractions';
import '~/assets/css/pages/home.css';

const router = useRouter();
const { user, initUser } = useAuth();

// Use home page composables
const homePageState = useHomePage();
const {
  // State
  currentSlide,
  currentAnnouncementSlide,
  activeCategory,
  activeRecommendationTab,
  isLoadingHeroSlides,
  isLoadingAnnouncements,
  isLoadingProducts,
  isLoadingCategories,
  isLoadingDeals,
  heroSlides,
  announcements,
  products,
  productCategories,
  featuredDeal,
  sideDeals,
  recommendedProducts,
  productListTabs,

  // Computed
  filteredProducts,
  filteredRecommendedProducts,

  // Methods
  fetchHeroSlides,
  fetchAnnouncements,
  fetchProducts,
  fetchCategories,
  fetchDeals,
  fetchRecommendedProducts
} = homePageState;

// Use interaction composable
const {
  nextSlide,
  previousSlide,
  goToSlide,
  nextAnnouncement,
  previousAnnouncement,
  goToAnnouncement,
  setActiveCategory,
  setActiveRecommendationTab,
  loadCriticalContent,
  loadSecondaryContent,
  setupIntersectionObserver
} = useHomePageInteractions(homePageState);



onMounted(async () => {
  console.log('🚀 Home page mounted, starting optimized data fetch...');

  // Initialize user from session storage
  initUser();
  currentSlide.value = 0;

  // Priority 1: Load critical above-the-fold content first
  await loadCriticalContent(fetchHeroSlides, fetchCategories);

  // Priority 2: Load secondary content with delay for better UX
  setTimeout(() => {
    loadSecondaryContent(fetchAnnouncements, fetchProducts);
  }, 100);

  // Priority 3: Setup intersection observer for lazy loading
  setTimeout(() => {
    setupIntersectionObserver();
  }, 1000);
});
</script>


