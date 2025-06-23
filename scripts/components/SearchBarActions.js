import { nextTick } from 'vue';

export const useSearchBarActions = (searchBarState, emit) => {
  const {
    searchQuery,
    dropdownOpen,
    suggestionsVisible,
    loading,
    isExpanded,
    searchInput,
    searchResults,
    searchError,
    selectedFilter,
    isIntentionalInteraction,
    isDropdownInteracting
  } = searchBarState;

  // Animation methods
  const toggleSearch = () => {
    // Set intentional interaction flag to prevent auto-close
    isIntentionalInteraction.value = true;

    if (isExpanded.value) {
      // Collapse - add collapsing class first
      const searchContent = document.querySelector('.search-bar-content');
      if (searchContent) {
        searchContent.classList.remove('visible');
        searchContent.classList.add('collapsing');

        // Wait for collapse animation to complete
        setTimeout(() => {
          isExpanded.value = false;
          dropdownOpen.value = false;
          suggestionsVisible.value = false;
          searchQuery.value = '';
          searchResults.value = [];
          searchError.value = null;

          // Remove collapsing class
          searchContent.classList.remove('collapsing');
          console.log('Search bar collapsed');

          // Reset intentional interaction flag
          isIntentionalInteraction.value = false;

          // Emit event to parent to trigger navigation slide back
          emit('search-collapsed');
        }, 400); // Match collapse animation duration
      }
    } else {
      // Expand
      console.log('Search bar expanding...');

      // Emit event to parent to trigger navigation slide
      emit('search-expanded');

      // Set expanded state immediately
      isExpanded.value = true;

      // Small delay to ensure DOM is ready, then trigger animation
      nextTick(() => {
        setTimeout(() => {
          const searchContent = document.querySelector('.search-bar-content');
          if (searchContent) {
            searchContent.classList.add('visible');
            console.log('Search bar expanded');

            // Focus input after animation completes
            setTimeout(() => {
              if (searchInput.value) {
                searchInput.value.focus();
              }
              // Reset intentional interaction flag after focus
              setTimeout(() => {
                isIntentionalInteraction.value = false;
              }, 100);
            }, 400); // Wait for animation to complete
          }
        }, 50); // Small delay to ensure initial state is applied
      });
    }
  };

  // Search function to call API
  const searchDatabase = async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = [];
      return;
    }

    loading.value = true;
    searchError.value = null;

    try {
      console.log('Searching database for:', searchQuery.value, 'Type:', selectedFilter.value);

      // Use $fetch with proper query parameters
      const response = await $fetch('/api/search', {
        params: {
          q: searchQuery.value,
          type: selectedFilter.value,
          limit: 3
        }
      });

      console.log('Search API response:', response);

      if (response && response.success) {
        searchResults.value = response.data || [];
      } else {
        console.error('Search API error:', response?.message || 'Unknown error');
        searchError.value = response?.message || 'Search failed';
        searchResults.value = [];
      }
    } catch (error) {
      console.error('Search request failed:', error);
      searchError.value = 'Search request failed';
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  };

  const onSearchInput = () => {
    console.log('Search input:', searchQuery.value, 'Length:', searchQuery.value.length);
    console.log('Current suggestionsVisible:', suggestionsVisible.value);

    if (searchQuery.value.length >= 1) {
      suggestionsVisible.value = true;
      console.log('Set suggestionsVisible to true');

      if (searchQuery.value.length >= 2) {
        console.log('Calling searchDatabase...');
        searchDatabase();
      } else {
        console.log('Query too short, clearing results');
        searchResults.value = [];
      }
    } else {
      console.log('Empty query, hiding suggestions');
      suggestionsVisible.value = false;
      searchResults.value = [];
    }

    console.log('After onSearchInput - suggestionsVisible:', suggestionsVisible.value, 'searchResults:', searchResults.value.length);
  };

  const onInputFocus = () => {
    console.log('Input focused');
    if (searchQuery.value.length >= 1) {
      suggestionsVisible.value = true;
      if (searchQuery.value.length >= 2) {
        searchDatabase();
      }
    }
  };

  const onInputBlur = () => {
    console.log('Input blurred');
    // Don't auto-close if we're intentionally interacting with the search
    if (isIntentionalInteraction.value) {
      console.log('Intentional interaction, not auto-closing');
      return;
    }

    setTimeout(() => {
      suggestionsVisible.value = false;
      // Only auto-close search bar if dropdown is not open and not interacting with dropdown
      if (isExpanded.value && !dropdownOpen.value && !isDropdownInteracting.value && !isIntentionalInteraction.value) {
        toggleSearch();
      }
    }, 200);
  };

  const selectSuggestion = (item) => {
    searchQuery.value = item.name || item.title;
    suggestionsVisible.value = false;
    emit('suggestion-selected', { suggestion: item, filter: selectedFilter.value });
    console.log('Suggestion selected:', item);
  };

  const performSearch = () => {
    suggestionsVisible.value = false;
    emit('search', { query: searchQuery.value, filter: selectedFilter.value });
    console.log('Search performed:', searchQuery.value, selectedFilter.value);
  };

  return {
    toggleSearch,
    searchDatabase,
    onSearchInput,
    onInputFocus,
    onInputBlur,
    selectSuggestion,
    performSearch
  };
};
