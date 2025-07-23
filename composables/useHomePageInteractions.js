import debounce from 'lodash-es/debounce';

export const useHomePageInteractions = (stateAndData) => {
  // Extract reactive state object and data
  const { homePageState, heroSlides, announcements } = stateAndData;
  
  // Destructure the reactive state
  const { 
    currentSlide, 
    currentAnnouncementSlide, 
    activeRecommendationTab, 
    recommendedProductsCurrentPage
  } = homePageState;

  // Carousel methods
  const nextSlide = () => {
    if (heroSlides.value.length > 0) {
      homePageState.currentSlide = (homePageState.currentSlide + 1) % heroSlides.value.length;
    }
  };

  const previousSlide = () => {
    if (heroSlides.value.length > 0) {
      homePageState.currentSlide = (homePageState.currentSlide - 1 + heroSlides.value.length) % heroSlides.value.length;
    }
  };

  const goToSlide = (index) => {
    homePageState.currentSlide = index;
  };

  const nextAnnouncement = () => {
    if (announcements.value.length > 0) {
      homePageState.currentAnnouncementSlide = (homePageState.currentAnnouncementSlide + 1) % announcements.value.length;
    }
  };

  const previousAnnouncement = () => {
    if (announcements.value.length > 0) {
      homePageState.currentAnnouncementSlide = (homePageState.currentAnnouncementSlide - 1 + announcements.value.length) % announcements.value.length;
    }
  };

  const goToAnnouncement = (index) => {
    homePageState.currentAnnouncementSlide = index;
  };

  // Debounced Recommendation Tab Method
  const setActiveRecommendationTab = debounce((tabId) => {
    homePageState.activeRecommendationTab = tabId;
    homePageState.recommendedProductsCurrentPage = 1; // Reset page
  }, 300);

  // Debounced Pagination Method
  const setRecommendedProductsPage = debounce((page) => {
    homePageState.recommendedProductsCurrentPage = page;
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
