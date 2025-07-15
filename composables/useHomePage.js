import { ref, computed, nextTick, reactive } from 'vue';

export const useHomePage = () => {
  // State to be managed by useHomePageInteractions
  const homePageState = reactive({
    currentSlide: 0,
    currentAnnouncementSlide: 0,
    activeRecommendationTab: 'all',
    recommendedProductsCurrentPage: 1,
  });

  // Loading states
  const isLoadingHeroSlides = ref(true);
  const isLoadingAnnouncements = ref(true);
  const isLoadingProducts = ref(true);
  const isLoadingCategories = ref(true);
  const isLoadingDeals = ref(true);

  // Cache flags to prevent duplicate API calls
  const cacheFlags = ref({
    homePage: false
  });

  // Data from database
  const heroSlides = ref([]);
  const announcements = ref([]);
  const products = ref([]);
  const productCategories = ref([]);
  const featuredDeal = ref(null);
  const sideDeals = ref([]);
  const recommendedProducts = ref([]);

  // Pagination state
  const recommendedProductsPerPage = 12;

  // Static data that doesn't need database
  const productListTabs = ref([
    { id: 'all', name: 'All' },
    { id: 'popular', name: 'Popular' },
    { id: 'new', name: 'New' }
  ]);

  const fetchHomePageData = async () => {
    // Clear cache flags to ensure fresh data load
    cacheFlags.value.homePage = false;
    
    // Prevent re-fetching if data is already loaded
    if (cacheFlags.value.homePage) return;

    try {
      isLoadingHeroSlides.value = true;
      isLoadingAnnouncements.value = true;
      isLoadingProducts.value = true;
      isLoadingCategories.value = true;
      isLoadingDeals.value = true;

      console.log('🔄 Fetching all home page data from /api/home-page...');
      const response = await $fetch('/api/home-page');

      if (response.success) {
        const data = response.data;

        // 1. Populate Hero Slides
        heroSlides.value = (data.heroSlides || []).map(slide => ({
          id: slide.id,
          title: slide.title,
          description: slide.description,
          categories: slide.categories || [],
          isNew: slide.is_new || false,
          backgroundImage: slide.background_image_url
        }));

        // 2. Populate Announcements
        console.log('Raw announcements data received:', data.announcements?.length || 0, 'announcements');
        if (data.announcements?.length > 0) {
          console.log('First announcement sample:', data.announcements[0]);
        }
        
        announcements.value = (data.announcements || []).map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          date: new Date(announcement.created_at).toLocaleDateString(),
          isNew: announcement.is_new || false,
          image: announcement.image_url
        }));
        
        console.log('Announcements mapped:', announcements.value.length, 'announcements');
        if (announcements.value.length > 0) {
          console.log('First mapped announcement:', announcements.value[0]);
        }

        // Log category data
        console.log('Received categories:', data.categories);
        
        // 3. Populate Categories - Pass the full object
        productCategories.value = data.categories || [];
        console.log('Set productCategories to:', productCategories.value);
        
        // 4. Populate All Products and Recommendations
        // Log the raw products data for debugging
        console.log('Raw allProducts data received:', data.allProducts?.length || 0, 'products');
        if (data.allProducts?.length > 0) {
          console.log('First product sample:', data.allProducts[0]);
        }
        
        // The products are already processed by the API with discount_percentage calculated
        products.value = data.allProducts || [];
        
        // Log the mapped products
        console.log('Products loaded:', products.value.length, 'products');
        if (products.value.length > 0) {
          console.log('First product:', products.value[0]);
        }
        
        // Let's simplify this. `recommendedProducts` will be an object of arrays.
        recommendedProducts.value = {
          new: data.newProducts || [],
          featured: data.featuredProducts || [],
          trending: data.trendingProducts || [],
        };

        // 5. Populate Deals
        const allDeals = (data.deals || []);
        if (allDeals.length > 0) {
            const mainDeal = allDeals[0];
            featuredDeal.value = {
                id: mainDeal.id,
                title: mainDeal.name,
                description: 'Special offer, big discount!',
                oldPrice: parseFloat(mainDeal.price),
                newPrice: parseFloat(mainDeal.discount_price || mainDeal.price),
                discount: `${mainDeal.discount_percentage || 0}% OFF`,
                badge: 'Hot Deal',
                backgroundImage: mainDeal.image_url
            };
        }
        sideDeals.value = allDeals.slice(1, 3).map(deal => ({
             id: deal.id,
             title: deal.name,
             price: parseFloat(deal.price),
             discount: `${deal.discount_percentage || 0}% OFF`,
             image: deal.image_url,
             badge: 'Deal'
        }));


        cacheFlags.value.homePage = true;
        console.log('✅ All home page data loaded and cached');
      }
    } catch (error) {
      console.error('❌ Error fetching home page data:', error);
    } finally {
      isLoadingHeroSlides.value = false;
      isLoadingAnnouncements.value = false;
      isLoadingProducts.value = false;
      isLoadingCategories.value = false;
      isLoadingDeals.value = false;
    }
  };

  // Computed properties
  const filteredRecommendedProducts = computed(() => {
    if (!homePageState.activeRecommendationTab) return [];
    
    switch(homePageState.activeRecommendationTab) {
      case 'new':
        return recommendedProducts.value.new || [];
      case 'popular':
        return recommendedProducts.value.trending || [];
      case 'all':
      default:
        return products.value;
    }
  });

  // New paginated computed properties
  const paginatedRecommendedProducts = computed(() => {
    const start = (homePageState.recommendedProductsCurrentPage - 1) * recommendedProductsPerPage;
    const end = start + recommendedProductsPerPage;
    return filteredRecommendedProducts.value.slice(start, end);
  });

  const recommendedProductsTotalPages = computed(() => {
    return Math.ceil(filteredRecommendedProducts.value.length / recommendedProductsPerPage);
  });

  return {
    homePageState, // Pass the reactive state object
    // Methods
    fetchHomePageData,
    // Data
    heroSlides,
    announcements,
    products,
    productCategories,
    featuredDeal,
    sideDeals,
    recommendedProducts,
    productListTabs,
    // Loading States
    isLoadingHeroSlides,
    isLoadingAnnouncements,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingDeals,
    // Computed for template
    paginatedRecommendedProducts,
    recommendedProductsTotalPages,
    // Pass reactive state for interactions
    recommendedProductsCurrentPage: computed(() => homePageState.recommendedProductsCurrentPage),
    activeRecommendationTab: computed(() => homePageState.activeRecommendationTab),
    currentSlide: computed(() => homePageState.currentSlide),
    currentAnnouncementSlide: computed(() => homePageState.currentAnnouncementSlide)
  };
}; 