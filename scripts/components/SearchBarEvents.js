export const useSearchBarEvents = (searchBarState, searchBarActions) => {
  const {
    searchContainer,
    filterDropdown,
    dropdownContent,
    isDropdownInteracting,
    justToggledDropdown,
    dropdownOpen,
    suggestionsVisible,
    isExpanded
  } = searchBarState;

  const { toggleSearch } = searchBarActions;

  // Click outside handler
  const handleClickOutside = (event) => {
    // Don't close if currently interacting with dropdown or just toggled
    if (isDropdownInteracting.value || justToggledDropdown.value) {
      console.log('Dropdown interaction in progress, ignoring click outside');
      return;
    }

    // Check if click is on dropdown content or filter button
    const isDropdownClick = event.target.closest('.filter-dropdown-content') ||
                           event.target.closest('.search-suggestions') ||
                           event.target.closest('.filter-dropdown') ||
                           (filterDropdown.value && filterDropdown.value.contains(event.target)) ||
                           (dropdownContent.value && dropdownContent.value.contains(event.target));

    // Check if click is outside the search container
    if (searchContainer.value && !searchContainer.value.contains(event.target) && !isDropdownClick) {
      console.log('Click outside detected, closing search and dropdowns');
      dropdownOpen.value = false;
      suggestionsVisible.value = false;
      // Auto-close search bar when clicked outside
      if (isExpanded.value) {
        toggleSearch();
      }
    } else if (isDropdownClick) {
      console.log('Click on dropdown detected, keeping search bar open');
    }
  };

  const initializeEvents = () => {
    document.addEventListener('click', handleClickOutside);
    console.log('SearchBar mounted');
  };

  const cleanupEvents = () => {
    document.removeEventListener('click', handleClickOutside);
    console.log('SearchBar unmounted');
  };

  return {
    handleClickOutside,
    initializeEvents,
    cleanupEvents
  };
};
