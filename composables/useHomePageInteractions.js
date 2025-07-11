import { toRefs } from 'vue';
import { debounce } from 'lodash-es';

export const useHomePageInteractions = (homePageState) => {
  // Destructure reactive state from the homePageState object
  const { 
    currentSlide, 
    currentAnnouncementSlide, 
    activeRecommendationTab, 
    recommendedProductsCurrentPage 
  } = toRefs(homePageState);

  // Get static data from the homePageState object for use in logic
  const { heroSlides, announcements } = homePageState;

  // Carousel methods
  const nextSlide = () => {
    if (heroSlides.value.length > 0) {
      currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length;
    }
  };

  const previousSlide = () => {
    if (heroSlides.value.length > 0) {
      currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length;
    }
  };

  const goToSlide = (index) => {
    currentSlide.value = index;
  };

  const nextAnnouncement = () => {
    if (announcements.value.length > 0) {
      currentAnnouncementSlide.value = (currentAnnouncementSlide.value + 1) % announcements.value.length;
    }
  };

  const previousAnnouncement = () => {
    if (announcements.value.length > 0) {
      currentAnnouncementSlide.value = (currentAnnouncementSlide.value - 1 + announcements.value.length) % announcements.value.length;
    }
  };

  const goToAnnouncement = (index) => {
    currentAnnouncementSlide.value = index;
  };

  // Debounced Recommendation Tab Method
  const setActiveRecommendationTab = debounce((tabId) => {
    activeRecommendationTab.value = tabId;
    recommendedProductsCurrentPage.value = 1; // Reset page
  }, 300);

  // Debounced Pagination Method
  const setRecommendedProductsPage = debounce((page) => {
    recommendedProductsCurrentPage.value = page;
  }, 300);
  
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      return value;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return {
    // Reactive State
    currentSlide,
    currentAnnouncementSlide,
    activeRecommendationTab,
    recommendedProductsCurrentPage,
    // Carousel Methods
    nextSlide,
    previousSlide,
    goToSlide,
    nextAnnouncement,
    previousAnnouncement,
    goToAnnouncement,
    // Tab and Pagination Methods
    setActiveRecommendationTab,
    setRecommendedProductsPage,
    // Utilities
    formatCurrency
  };
};
