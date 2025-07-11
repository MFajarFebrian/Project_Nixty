import { ref, computed, nextTick } from 'vue';

export const useHomePage = () => {
  // State to be managed by useHomePageInteractions
  const homePageState = {
    currentSlide: ref(0),
    currentAnnouncementSlide: ref(0),
    activeRecommendationTab: ref('all'),
    recommendedProductsCurrentPage: ref(1),
  };

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
          isNew: slide.isNew,
          backgroundImage: slide.background_image_url
        }));

        // 2. Populate Announcements
        announcements.value = (data.announcements || []).map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          date: new Date(announcement.created_at).toLocaleDateString(),
          isNew: true, // Placeholder
          image: announcement.image_url
        }));

        // Log category data
        console.log('Received categories:', data.categories);
        
        // 3. Populate Categories - Pass the full object
        productCategories.value = data.categories || [];
        console.log('Set productCategories to:', productCategories.value);
        
        const mapProduct = p => ({
          id: p.id,
          name: p.name,
          version: p.version,
          short_description: p.short_description,
          price: p.price,
          original_price: p.discount_percentage > 0 ? p.price / (1 - p.discount_percentage / 100) : p.price,
          period: p.period,
          image_url: p.image_url,
          is_new: !!p.is_new,
          discount_percentage: p.discount_percentage,
          isTrending: !!p.is_trending,
          recentlyUpdated: !!p.is_new,
          soldCount: p.sold_count || 0,
          category: p.category_slug,
          slug: p.slug
        });

        // 4. Populate All Products and Recommendations
        // Use the new allProducts list from the API as the main source of truth
        products.value = (data.allProducts || []).map(mapProduct);
        
        // Let's simplify this. `recommendedProducts` will be an object of arrays.
        recommendedProducts.value = {
          new: (data.newProducts || []).map(mapProduct),
          featured: (data.featuredProducts || []).map(mapProduct),
          trending: (data.trendingProducts || []).map(mapProduct),
        };

        // 5. Populate Deals
        const allDeals = (data.deals || []);
        if (allDeals.length > 0) {
            const mainDeal = allDeals[0];
            featuredDeal.value = {
                id: mainDeal.id,
                title: mainDeal.name,
                description: 'Special offer, big discount!',
                oldPrice: mainDeal.price * 1.5,
                newPrice: mainDeal.price,
                discount: `${mainDeal.discount_percentage}% OFF`,
                badge: 'Hot Deal',
                backgroundImage: mainDeal.image_url
            };
        }
        sideDeals.value = allDeals.slice(1, 3).map(deal => ({
             id: deal.id,
             title: deal.name,
             price: deal.price,
             discount: `${deal.discount_percentage}% OFF`,
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
    if (!homePageState.activeRecommendationTab.value) return [];
    
    switch(homePageState.activeRecommendationTab.value) {
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
    const start = (homePageState.recommendedProductsCurrentPage.value - 1) * recommendedProductsPerPage;
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
    recommendedProductsCurrentPage: homePageState.recommendedProductsCurrentPage,
    activeRecommendationTab: homePageState.activeRecommendationTab
  };
}; 