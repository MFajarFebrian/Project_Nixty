<template>
  <div ref="searchContainer" class="animated-search-container" :class="{ 'expanded': isExpanded }">
    <!-- Search Bar Content (expanded state) -->
    <div class="search-bar-content" :class="{ 'visible': isExpanded }">
      <!-- Filter Dropdown -->
      <div ref="filterDropdown" class="filter-dropdown">
        <button
          @click="toggleDropdown"
          @mouseenter="onFilterHover"
          @mouseleave="onDropdownMouseLeave"
          class="filter-btn"
        >
          <i :class="getFilterIcon()"></i>
          <span>{{ selectedFilter }}</span>
          <i class="fas fa-chevron-down" :class="{ 'rotate-180': dropdownOpen }"></i>
        </button>
      </div>

      <!-- Search Input -->
      <div class="search-input-container">
        <input
          ref="searchInput"
          type="text"
          :placeholder="getPlaceholder()"
          v-model="searchQuery"
          @input="onSearchInput"
          @focus="onInputFocus"
          @blur="onInputBlur"
          class="search-input"
        />

        <!-- Search Suggestions -->
        <div
          v-if="suggestionsVisible"
          class="search-suggestions"
        >
          <!-- Minimum character message -->
          <div v-if="searchQuery.length === 1" class="suggestion-item info">
            <i class="fas fa-info-circle"></i>
            <span>Type at least 2 characters to search</span>
          </div>

          <!-- Loading -->
          <div v-else-if="loading" class="suggestion-item loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Searching...</span>
          </div>

          <!-- Results -->
          <div
            v-else-if="filteredSuggestions.length > 0"
            v-for="(item, index) in filteredSuggestions"
            :key="index"
            @mousedown="selectSuggestion(item)"
            class="suggestion-item result"
          >
            <span v-html="highlightText(item.name || item.title, searchQuery)"></span>
          </div>

          <!-- Error state -->
          <div v-else-if="searchError" class="suggestion-item error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ searchError }}</span>
          </div>

          <!-- No results -->
          <div v-else-if="searchQuery.length >= 2" class="suggestion-item no-results">
            <i class="fas fa-search"></i>
            <span>No results found</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Dropdown Content (positioned outside search-bar-content to avoid overflow issues) -->
    <div
      v-if="dropdownOpen && isExpanded"
      ref="dropdownContent"
      class="filter-dropdown-content"
      @click.stop
      @mouseenter="onDropdownHover"
      @mouseleave="onDropdownMouseLeave"
      :style="{
        position: 'absolute',
        top: '100%',
        left: '0px',
        zIndex: 99999
      }"
    >
      <div
        @click.stop="selectFilter('Product')"
        class="dropdown-item"
      >
        <i class="fas fa-box"></i>
        <span>Product</span>
      </div>
      <div
        @click.stop="selectFilter('Deal')"
        class="dropdown-item"
      >
        <i class="fas fa-tags"></i>
        <span>Deal</span>
      </div>
      <div
        @click.stop="selectFilter('News')"
        class="dropdown-item"
      >
        <i class="fas fa-newspaper"></i>
        <span>News</span>
      </div>
    </div>

    <!-- Search Icon (always visible, fixed position at right) -->
    <div class="search-icon-container" @click="toggleSearch">
      <i class="fas fa-search"></i>
    </div>
  </div>
</template>

<script setup lang="js">
import { onMounted, onUnmounted } from 'vue';
import { useSearchBar } from '~/scripts/components/SearchBar.js';
import { useSearchBarActions } from '~/scripts/components/SearchBarActions.js';
import { useSearchBarEvents } from '~/scripts/components/SearchBarEvents.js';
import '~/assets/css/components/SearchBar.css';

// Emits
const emit = defineEmits(['search', 'suggestion-selected', 'search-expanded', 'search-collapsed']);

// Use separated script logic
const searchBarState = useSearchBar(emit);
const {
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
} = searchBarState;

// Use search actions
const searchBarActions = useSearchBarActions(searchBarState, emit);
const {
  toggleSearch,
  searchDatabase,
  onSearchInput,
  onInputFocus,
  onInputBlur,
  selectSuggestion,
  performSearch
} = searchBarActions;

// Use event handlers
const searchBarEvents = useSearchBarEvents(searchBarState, searchBarActions);
const {
  handleClickOutside,
  initializeEvents,
  cleanupEvents
} = searchBarEvents;

// Lifecycle hooks
onMounted(() => {
  initializeEvents();
});

onUnmounted(() => {
  cleanupEvents();
});
</script>
