import { nextTick } from 'vue';

export const useHomePageInteractions = (homePageState) => {
  const {
    currentSlide,
    currentAnnouncementSlide,
    heroSlides,
    announcements,
    activeCategory,
    activeRecommendationTab,
    cacheFlags,
    fetchDeals,
    fetchRecommendedProducts
  } = homePageState;

  // Performance optimization: Throttle carousel functions
  let carouselThrottle = false;

  // Carousel methods with throttling for better performance
  const nextSlide = () => {
    if (carouselThrottle) return;
    carouselThrottle = true;

    currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length;
    console.log('Next slide:', currentSlide.value);

    setTimeout(() => {
      carouselThrottle = false;
    }, 300); // Prevent rapid clicking
  };

  const previousSlide = () => {
    if (carouselThrottle) return;
    carouselThrottle = true;

    currentSlide.value = currentSlide.value === 0 ? heroSlides.value.length - 1 : currentSlide.value - 1;
    console.log('Previous slide:', currentSlide.value);

    setTimeout(() => {
      carouselThrottle = false;
    }, 300);
  };

  const goToSlide = (index) => {
    if (carouselThrottle) return;
    carouselThrottle = true;

    currentSlide.value = index;
    console.log('Go to slide:', currentSlide.value);

    setTimeout(() => {
      carouselThrottle = false;
    }, 300);
  };

  // Announcement carousel methods
  const nextAnnouncement = () => {
    currentAnnouncementSlide.value = (currentAnnouncementSlide.value + 1) % announcements.value.length;
  };

  const previousAnnouncement = () => {
    currentAnnouncementSlide.value = currentAnnouncementSlide.value === 0 ? announcements.value.length - 1 : currentAnnouncementSlide.value - 1;
  };

  const goToAnnouncement = (index) => {
    currentAnnouncementSlide.value = index;
  };

  // Category methods
  const setActiveCategory = (categoryId) => {
    activeCategory.value = categoryId;
  };

  const setActiveRecommendationTab = (tabId) => {
    activeRecommendationTab.value = tabId;
  };

  // Content loading functions
  const loadCriticalContent = async (fetchHeroSlides, fetchCategories) => {
    try {
      // Load hero slides and categories in parallel (most important)
      await Promise.all([
        fetchHeroSlides(),
        fetchCategories()
      ]);
      console.log('✅ Critical content loaded');
    } catch (error) {
      console.error('❌ Error loading critical content:', error);
    }
  };

  const loadSecondaryContent = async (fetchAnnouncements, fetchProducts) => {
    try {
      // Load announcements and initial products
      await Promise.all([
        fetchAnnouncements(),
        fetchProducts()
      ]);
      console.log('✅ Secondary content loaded');
    } catch (error) {
      console.error('❌ Error loading secondary content:', error);
    }
  };

  const loadBackgroundContent = async () => {
    try {
      // Load deals and recommendations last
      await Promise.all([
        fetchDeals(),
        fetchRecommendedProducts()
      ]);
      console.log('✅ Background content loaded');
    } catch (error) {
      console.error('❌ Error loading background content:', error);
    }
  };

  // Intersection Observer for lazy loading sections - Optimized
  const setupIntersectionObserver = () => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.dataset.section;

          // Use requestIdleCallback for better performance
          if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
              loadSectionContent(section);
            });
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              loadSectionContent(section);
            }, 0);
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px', // Reduced from 100px for better performance
      threshold: 0.1 // Only trigger when 10% visible
    });

    // Helper function to load section content
    const loadSectionContent = (section) => {
      switch (section) {
        case 'deals':
          if (!cacheFlags.value.deals) {
            fetchDeals();
          }
          break;
        case 'recommendations':
          if (!cacheFlags.value.recommendedProducts) {
            fetchRecommendedProducts();
          }
          break;
      }
    };

    // Use nextTick to ensure DOM is ready
    nextTick(() => {
      const dealsSection = document.querySelector('[data-section="deals"]');
      const recommendationsSection = document.querySelector('[data-section="recommendations"]');

      if (dealsSection) observer.observe(dealsSection);
      if (recommendationsSection) observer.observe(recommendationsSection);
    });
  };

  return {
    // Carousel methods
    nextSlide,
    previousSlide,
    goToSlide,
    nextAnnouncement,
    previousAnnouncement,
    goToAnnouncement,
    
    // Category methods
    setActiveCategory,
    setActiveRecommendationTab,
    
    // Content loading methods
    loadCriticalContent,
    loadSecondaryContent,
    loadBackgroundContent,
    setupIntersectionObserver
  };
};
