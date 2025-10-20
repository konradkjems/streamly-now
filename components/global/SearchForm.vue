<template>
  <div :class="$style.form">
    <form
      autocomplete="off"
      @submit.prevent>
      <label
        class="visuallyhidden"
        for="search">Search</label>

      <div :class="$style.field">
        <input
          id="search"
          ref="input"
          v-model.trim="query"
          name="search"
          type="text"
          placeholder="Search for a movie, tv show or person..."
          @keyup="goToRoute"
          @input="handleInput"
          @focus="showSuggestions = true"
          @blur="unFocus">

        <div :class="$style.actions">
          <button
            type="button"
            :class="$style.advancedBtn"
            aria-label="Advanced Search"
            @click="openAdvancedSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          <button
            v-if="showButton"
            type="button"
            aria-label="Close"
            @click="goBack">
            <!-- eslint-disable-next-line -->
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"><path d="M.75.75l13.5 13.5M14.25.75L.75 14.25"/></g></svg>
          </button>
        </div>
      </div>

      <!-- Search Suggestions Dropdown -->
      <div v-if="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)" :class="$style.suggestions">
        <!-- Recent Searches -->
        <div v-if="!query && recentSearches.length > 0" :class="$style.recentSearches">
          <div :class="$style.sectionHeader">
            <span>Recent Searches</span>
            <button @click="clearRecentSearches" :class="$style.clearBtn">Clear</button>
          </div>
          <div
            v-for="(search, index) in recentSearches"
            :key="`recent-${index}`"
            :class="$style.suggestionItem"
            @mousedown="selectSuggestion(search)">
            <span :class="$style.searchIcon">🔍</span>
            <span>{{ search }}</span>
          </div>
        </div>

        <!-- Autocomplete Suggestions -->
        <div v-if="query && suggestions.length > 0" :class="$style.autocomplete">
          <div
            v-for="(item, index) in suggestions"
            :key="`suggestion-${index}`"
            :class="$style.suggestionItem"
            @mousedown="selectSuggestion(item.title || item.name)">
            <span :class="$style.itemIcon">
              {{ item.media_type === 'movie' ? '🎬' : item.media_type === 'tv' ? '📺' : '👤' }}
            </span>
            <div :class="$style.itemInfo">
              <span :class="$style.itemTitle">{{ item.title || item.name }}</span>
              <span :class="$style.itemMeta">
                {{ item.media_type === 'movie' ? 'Movie' : item.media_type === 'tv' ? 'TV Show' : 'Person' }}
                <span v-if="item.release_date || item.first_air_date">
                  • {{ new Date(item.release_date || item.first_air_date).getFullYear() }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="query && suggestions.length === 0 && !loading" :class="$style.noResults">
          <span>No results found for "{{ query }}"</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getSearchMulti } from '~/api';

export default {
  data () {
    return {
      query: this.$route.query.q ? this.$route.query.q : '',
      suggestions: [],
      recentSearches: [],
      showSuggestions: false,
      loading: false,
      searchTimeout: null,
    };
  },

  computed: {
    showButton () {
      return this.$route.name === 'search';
    },

    ...mapState('search', [
      'fromPage',
    ]),
  },

  mounted () {
    this.$refs.input.focus();
    this.loadRecentSearches();
  },

  methods: {
    goToRoute () {
      if (this.query) {
        this.saveToRecentSearches(this.query);
        this.showSuggestions = false;
        this.$router.push({
          name: 'search',
          query: { q: this.query },
        });
      } else {
        this.$router.push({
          path: this.fromPage,
        });
      }
    },

    goBack () {
      this.query = '';

      this.$router.push({
        path: this.fromPage,
      });
    },

    unFocus (e) {
      // Delay hiding suggestions to allow click events
      setTimeout(() => {
        if (this.$route.name !== 'search') {
          const target = e.relatedTarget;

          if (!target || !target.classList.contains('search-toggle')) {
            this.query = '';
            this.$store.commit('search/closeSearch');
          }
        }
        this.showSuggestions = false;
      }, 200);
    },

    openAdvancedSearch() {
      this.$emit('open-advanced-search');
    },

    async handleInput() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // If query is empty, show recent searches
      if (!this.query) {
        this.suggestions = [];
        return;
      }

      // Debounce search
      this.searchTimeout = setTimeout(async () => {
        this.loading = true;
        try {
          const results = await getSearchMulti(this.query);
          this.suggestions = results.results.slice(0, 8); // Limit to 8 suggestions
        } catch (error) {
          console.error('Search error:', error);
          this.suggestions = [];
        } finally {
          this.loading = false;
        }
      }, 300);
    },

    selectSuggestion(suggestion) {
      this.query = suggestion;
      this.goToRoute();
    },

    loadRecentSearches() {
      try {
        const stored = localStorage.getItem('recentSearches');
        this.recentSearches = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error loading recent searches:', error);
        this.recentSearches = [];
      }
    },

    saveToRecentSearches(search) {
      try {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(s => s !== search);
        
        // Add to beginning
        this.recentSearches.unshift(search);
        
        // Limit to 5 recent searches
        this.recentSearches = this.recentSearches.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
      } catch (error) {
        console.error('Error saving recent search:', error);
      }
    },

    clearRecentSearches() {
      this.recentSearches = [];
      localStorage.removeItem('recentSearches');
    }
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.form {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100vw;
  z-index: 1001;

  // Remove any left offset at large screens to ensure full width
  @media (min-width: $breakpoint-large) {
    left: 0;
    width: 100vw;
  }

  input[type='text'] {
    flex: 1;
    height: 6rem;
    padding: 2.1rem 1.5rem;
    font-size: 1.6rem;
    color: #fff;
    background: none;
    border: 0;
    outline: 0;

    @media (min-width: $breakpoint-large) {
      height: 8rem;
      padding: 3.1rem 5rem;
    }
  }

  button {
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    background: none;

    @media (min-width: $breakpoint-large) {
      padding: 0 5rem;
    }
  }
}

.field {
  display: flex;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.advancedBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  svg {
    width: 2rem;
    height: 2rem;
    stroke: #fff;
  }
}

/* Search Suggestions */
.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1000;
}

.recentSearches,
.autocomplete {
  padding: 1rem 0;
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clearBtn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #e50914;
  }
}

.suggestionItem {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.searchIcon,
.itemIcon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.itemInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.itemTitle {
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itemMeta {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.noResults {
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: $breakpoint-large - 1) {
  .sectionHeader {
    padding: 0 1.5rem 0.5rem;
  }
  
  .suggestionItem {
    padding: 0.75rem 1.5rem;
  }
  
  .noResults {
    padding: 1.5rem;
  }
}
</style>
