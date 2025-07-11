import { ref, computed } from 'vue';

export const useSearchBar = (emit) => {
  // Reactive data
  const selectedFilter = ref('Product');
  const searchQuery = ref('');
  const dropdownOpen = ref(false);
  const suggestionsVisible = ref(false);
  const loading = ref(false);
  const isExpanded = ref(false);
  const searchInput = ref(null);
  const searchContainer = ref(null);
  const filterDropdown = ref(null);
  const dropdownContent = ref(null);
  const isDropdownInteracting = ref(false);
  const justToggledDropdown = ref(false);
  const closeDropdownTimeout = ref(null);
  const isIntentionalInteraction = ref(false);

  // Reactive data for search results
  const searchResults = ref([]);
  const searchError = ref(null);

  // Computed
  const filteredSuggestions = computed(() => {
    return searchResults.value || [];
  });

  // Function to highlight matching text
  const highlightText = (text, searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) return text;

    // Clean the text first to avoid double highlighting
    let cleanText = text.toString();

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);

    // Create a single regex pattern for all terms
    const escapedTerms = searchTerms.map(term =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    // Join terms with OR operator and create case-insensitive regex
    const combinedPattern = escapedTerms.join('|');
    const regex = new RegExp(`(${combinedPattern})`, 'gi');

    // Apply highlighting in one pass
    const highlightedText = cleanText.replace(regex, '<mark style="background-color: #4ecdc4; color: #1a1a2e; padding: 1px 2px; border-radius: 2px;">$1</mark>');

    return highlightedText;
  };

  // Dropdown methods
  const toggleDropdown = (event) => {
    console.log('toggleDropdown called, current state:', dropdownOpen.value);

    // Prevent event from bubbling up
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Only open dropdown, don't close it on click
    if (!dropdownOpen.value) {
      // Set flags to prevent immediate click outside detection
      isDropdownInteracting.value = true;
      justToggledDropdown.value = true;

      dropdownOpen.value = true;
      console.log('Dropdown opened');

      // Close suggestions when opening dropdown
      suggestionsVisible.value = false;
      console.log('Suggestions closed, dropdown opened');

      // Reset interaction flags after delays
      setTimeout(() => {
        isDropdownInteracting.value = false;
      }, 300);

      setTimeout(() => {
        justToggledDropdown.value = false;
      }, 100);
    }
  };

  const selectFilter = (filter) => {
    isDropdownInteracting.value = true;
    console.log('Filter selected:', filter);
    selectedFilter.value = filter;
    dropdownOpen.value = false;
    searchQuery.value = '';
    suggestionsVisible.value = false;
    searchResults.value = [];
    searchError.value = null;

    // Reset interaction flag after a short delay
    setTimeout(() => {
      isDropdownInteracting.value = false;
    }, 100);
  };

  const closeDropdown = () => {
    // Clear any existing timeout
    if (closeDropdownTimeout.value) {
      clearTimeout(closeDropdownTimeout.value);
    }

    // Add a small delay to prevent accidental closing when moving between filter button and dropdown
    closeDropdownTimeout.value = setTimeout(() => {
      dropdownOpen.value = false;
      console.log('Dropdown closed on mouse leave');
      closeDropdownTimeout.value = null;
    }, 150);
  };

  const onDropdownMouseLeave = () => {
    console.log('Mouse left dropdown area');
    closeDropdown();
  };

  const onFilterHover = () => {
    console.log('Mouse entered filter button');
    // Cancel any pending close operation
    if (closeDropdownTimeout.value) {
      clearTimeout(closeDropdownTimeout.value);
      closeDropdownTimeout.value = null;
    }
  };

  const onDropdownHover = () => {
    console.log('Mouse entered dropdown');
    // Cancel any pending close operation
    if (closeDropdownTimeout.value) {
      clearTimeout(closeDropdownTimeout.value);
      closeDropdownTimeout.value = null;
    }
  };

  // Utility methods
  const getFilterIcon = () => {
    const icons = {
      'Product': 'fas fa-box',
      'Deal': 'fas fa-tags',
      'News': 'fas fa-newspaper'
    };
    return icons[selectedFilter.value] || 'fas fa-box';
  };

  const getPlaceholder = () => {
    const placeholders = {
      'Product': 'Search products...',
      'Deal': 'Search deals...',
      'News': 'Search news...'
    };
    return placeholders[selectedFilter.value] || 'Search...';
  };

  return {
    // State
    selectedFilter,
    searchQuery,
    dropdownOpen,
    suggestionsVisible,
    loading,
    isExpanded,
    searchInput,
    searchContainer,
    filterDropdown,
    dropdownContent,
    isDropdownInteracting,
    justToggledDropdown,
    closeDropdownTimeout,
    isIntentionalInteraction,
    searchResults,
    searchError,
    
    // Computed
    filteredSuggestions,
    
    // Methods
    highlightText,
    toggleDropdown,
    selectFilter,
    closeDropdown,
    onDropdownMouseLeave,
    onFilterHover,
    onDropdownHover,
    getFilterIcon,
    getPlaceholder
  };
};
