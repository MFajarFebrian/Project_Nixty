import { ref, computed, nextTick } from 'vue';

export const useHomePage = () => {
  // Carousel state
  const currentSlide = ref(0);
  const currentAnnouncementSlide = ref(0);

  // Category state
  const activeCategory = ref('');
  const activeRecommendationTab = ref('all');

  // Loading states
  const isLoadingHeroSlides = ref(true);
  const isLoadingAnnouncements = ref(true);
  const isLoadingProducts = ref(true);
  const isLoadingCategories = ref(true);
  const isLoadingDeals = ref(true);

  // Cache flags to prevent duplicate API calls
  const cacheFlags = ref({
    heroSlides: false,
    announcements: false,
    products: false,
    categories: false,
    deals: false,
    recommendedProducts: false
  });

  // Data from database
  const heroSlides = ref([]);
  const announcements = ref([]);
  const products = ref([]);
  const productCategories = ref([]);
  const featuredDeal = ref(null);
  const sideDeals = ref([]);
  const recommendedProducts = ref([]);

  // Static data that doesn't need database
  const productListTabs = ref([
    { id: 'all', name: 'All' },
    { id: 'popular', name: 'Popular' },
    { id: 'new', name: 'New' }
  ]);

  // API data fetching functions
  const fetchHeroSlides = async () => {
    if (cacheFlags.value.heroSlides) return;

    try {
      isLoadingHeroSlides.value = true;
      console.log('🔄 Fetching hero slides from /api/hero-slides...');
      const response = await $fetch('/api/hero-slides');

      if (response.success) {
        heroSlides.value = response.data.map(slide => ({
          id: slide.id,
          title: slide.title,
          description: slide.description,
          categories: slide.categories || [],
          isNew: slide.isNew,
          backgroundImage: slide.background_image_url || '/api/placeholder/hero-image'
        }));
        cacheFlags.value.heroSlides = true;
        console.log('✅ Hero slides loaded and cached');
      }
    } catch (error) {
      console.error('❌ Error fetching hero slides:', error);
      heroSlides.value = [];
    } finally {
      isLoadingHeroSlides.value = false;
    }
  };

  const fetchAnnouncements = async () => {
    try {
      isLoadingAnnouncements.value = true;
      // Fetch only 3 announcements for faster loading
      const response = await $fetch('/api/announcements?limit=3');
      if (response.success) {
        announcements.value = response.data.map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          date: announcement.date,
          isNew: announcement.isNew,
          image: announcement.image_url || '/api/placeholder/announcement-image'
        }));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      announcements.value = [];
    } finally {
      isLoadingAnnouncements.value = false;
    }
  };

  const fetchProducts = async () => {
    try {
      isLoadingProducts.value = true;
      // Fetch all products to show in categories
      const response = await $fetch('/api/products');
      if (response.success) {
        products.value = response.data.map(product => ({
          id: product.id,
          name: `${product.name} ${product.version}`,
          description: product.shortDescription,
          price: `Rp${Math.floor(product.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          period: product.period,
          image: product.image_url,
          category: product.category,
          isNew: product.isNew,
          discount: product.discount,
          timeLeft: product.timeLeft
        }));
        console.log('Products loaded:', products.value.length, 'products');
        console.log('Categories found:', [...new Set(products.value.map(p => p.category))]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
    } finally {
      // Reduced delay for better performance
      setTimeout(() => {
        isLoadingProducts.value = false;
      }, 100);
    }
  };

  const fetchCategories = async () => {
    try {
      isLoadingCategories.value = true;
      const response = await $fetch('/api/categories');
      if (response.success) {
        productCategories.value = response.data.map(cat => ({
          id: cat.slug,
          name: cat.name
        }));
        // Set first category as active if none selected
        if (productCategories.value.length > 0 && !activeCategory.value) {
          activeCategory.value = productCategories.value[0].id;
          console.log('Categories loaded:', productCategories.value);
          console.log('Active category set to:', activeCategory.value);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      productCategories.value = [];
    } finally {
      isLoadingCategories.value = false;
    }
  };

  const fetchDeals = async () => {
    try {
      isLoadingDeals.value = true;
      const response = await $fetch('/api/deals');
      if (response.success) {
        const deals = response.data;

        // Map featured deal
        if (deals.featured && deals.featured.length > 0) {
          const deal = deals.featured[0];
          featuredDeal.value = {
            id: deal.id,
            title: deal.title,
            description: deal.description,
            oldPrice: deal.oldPrice,
            newPrice: deal.newPrice,
            discount: deal.discount,
            badge: deal.badge,
            backgroundImage: deal.backgroundImage || '/api/placeholder/deal-image'
          };
        }

        // Map side deals
        sideDeals.value = deals.side.slice(0, 2).map(deal => ({
          id: deal.id,
          title: deal.title,
          price: deal.price,
          discount: deal.discount,
          image: deal.image || '/api/placeholder/deal-image',
          badge: deal.badge
        }));
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      featuredDeal.value = null;
      sideDeals.value = [];
    } finally {
      isLoadingDeals.value = false;
    }
  };

  const fetchRecommendedProducts = async () => {
    if (cacheFlags.value.recommendedProducts) return;

    try {
      const response = await $fetch('/api/products');
      if (response.success) {
        recommendedProducts.value = response.data.map(product => ({
          id: product.id,
          name: `${product.name} ${product.version}`,
          shortDescription: product.shortDescription,
          price: `Rp${Math.floor(product.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          period: product.period,
          image: product.image_url,
          isTrending: product.isTrending,
          recentlyUpdated: product.isNew,
          soldCount: product.soldCount || 0
        }));
        cacheFlags.value.recommendedProducts = true;
        console.log('Product list loaded and cached');

        // Reduced delay for better performance
        setTimeout(() => {
          // This will trigger the computed property to re-evaluate
          console.log('Product list ready for display');
        }, 50);
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
      recommendedProducts.value = [];
    }
  };

  // Computed properties
  const filteredProducts = computed(() => {
    const filtered = products.value.filter(product => product.category === activeCategory.value);
    console.log('🔍 Filtering products:', {
      totalProducts: products.value.length,
      activeCategory: activeCategory.value,
      filteredCount: filtered.length,
      availableCategories: [...new Set(products.value.map(p => p.category))]
    });
    return filtered;
  });

  const filteredRecommendedProducts = computed(() => {
    if (activeRecommendationTab.value === 'all') {
      return recommendedProducts.value;
    } else if (activeRecommendationTab.value === 'popular') {
      // Sort by sold count for popular products
      return recommendedProducts.value
        .slice()
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 8);
    } else if (activeRecommendationTab.value === 'new') {
      // Filter for new products
      return recommendedProducts.value.filter(product => product.recentlyUpdated);
    }
    return recommendedProducts.value;
  });

  return {
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
    cacheFlags,
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
  };
};
