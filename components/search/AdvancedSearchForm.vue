<template>
  <div class="advanced-search">
    <div class="advanced-search__header">
      <h2 class="advanced-search__title">Advanced Search</h2>
      <button 
        class="advanced-search__close"
        @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <form @submit.prevent="performSearch" class="advanced-search__form">
      <!-- Search Query -->
      <div class="advanced-search__field">
        <label class="advanced-search__label">Search Query</label>
        <input
          v-model="searchForm.query"
          type="text"
          class="advanced-search__input"
          placeholder="Enter movie, TV show, or person name..."
          required>
      </div>

      <!-- Content Type -->
      <div class="advanced-search__field">
        <label class="advanced-search__label">Content Type</label>
        <div class="advanced-search__radio-group">
          <label class="advanced-search__radio">
            <input 
              type="radio" 
              v-model="searchForm.media_type" 
              value="all"
              class="advanced-search__radio-input">
            <span class="advanced-search__radio-label">All</span>
          </label>
          <label class="advanced-search__radio">
            <input 
              type="radio" 
              v-model="searchForm.media_type" 
              value="movie"
              class="advanced-search__radio-input">
            <span class="advanced-search__radio-label">Movies</span>
          </label>
          <label class="advanced-search__radio">
            <input 
              type="radio" 
              v-model="searchForm.media_type" 
              value="tv"
              class="advanced-search__radio-input">
            <span class="advanced-search__radio-label">TV Shows</span>
          </label>
          <label class="advanced-search__radio">
            <input 
              type="radio" 
              v-model="searchForm.media_type" 
              value="person"
              class="advanced-search__radio-input">
            <span class="advanced-search__radio-label">People</span>
          </label>
        </div>
      </div>

      <!-- Year Range -->
      <div class="advanced-search__field">
        <label class="advanced-search__label">Year Range</label>
        <div class="advanced-search__year-range">
          <input
            v-model.number="searchForm.year_from"
            type="number"
            class="advanced-search__input advanced-search__input--small"
            placeholder="From"
            min="1900"
            :max="currentYear">
          <span class="advanced-search__year-separator">to</span>
          <input
            v-model.number="searchForm.year_to"
            type="number"
            class="advanced-search__input advanced-search__input--small"
            placeholder="To"
            min="1900"
            :max="currentYear">
        </div>
      </div>

      <!-- Genre Filters -->
      <div class="advanced-search__field" v-if="searchForm.media_type !== 'person'">
        <label class="advanced-search__label">Genres</label>
        <div class="advanced-search__genre-grid">
          <label 
            v-for="genre in availableGenres"
            :key="genre.id"
            class="advanced-search__checkbox">
            <input 
              type="checkbox" 
              :value="genre.id"
              v-model="searchForm.genres"
              class="advanced-search__checkbox-input">
            <span class="advanced-search__checkbox-label">{{ genre.name }}</span>
          </label>
        </div>
      </div>

      <!-- Rating Filter -->
      <div class="advanced-search__field" v-if="searchForm.media_type !== 'person'">
        <label class="advanced-search__label">Minimum Rating</label>
        <div class="advanced-search__rating-slider">
          <input
            v-model.number="searchForm.min_rating"
            type="range"
            min="0"
            max="10"
            step="0.1"
            class="advanced-search__slider">
          <div class="advanced-search__rating-display">
            {{ searchForm.min_rating }} / 10
          </div>
        </div>
      </div>

      <!-- Language Filter -->
      <div class="advanced-search__field" v-if="searchForm.media_type !== 'person'">
        <label class="advanced-search__label">Language</label>
        <select v-model="searchForm.language" class="advanced-search__select">
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div class="advanced-search__field">
        <label class="advanced-search__label">Sort By</label>
        <select v-model="searchForm.sort_by" class="advanced-search__select">
          <option value="relevance">Relevance</option>
          <option value="popularity.desc">Popularity</option>
          <option value="release_date.desc">Release Date (Newest)</option>
          <option value="release_date.asc">Release Date (Oldest)</option>
          <option value="vote_average.desc">Rating (Highest)</option>
          <option value="vote_average.asc">Rating (Lowest)</option>
          <option value="vote_count.desc">Most Votes</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="advanced-search__actions">
        <button 
          type="submit" 
          class="advanced-search__search-btn"
          :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span v-if="loading">Searching...</span>
          <span v-else>Search</span>
        </button>
        
        <button 
          type="button" 
          @click="resetFilters"
          class="advanced-search__reset-btn">
          Reset Filters
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AdvancedSearchForm',

  data() {
    return {
      loading: false,
      searchForm: {
        query: '',
        media_type: 'all',
        year_from: null,
        year_to: null,
        genres: [],
        min_rating: 0,
        language: '',
        sort_by: 'relevance'
      },
      availableGenres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ]
    }
  },

  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },

  methods: {
    ...mapActions('search', ['performAdvancedSearch']),

    async performSearch() {
      this.loading = true
      
      try {
        // Build search parameters
        const searchParams = {
          query: this.searchForm.query,
          page: 1
        }

        // Add filters based on content type
        if (this.searchForm.media_type !== 'all') {
          searchParams.media_type = this.searchForm.media_type
        }

        if (this.searchForm.year_from) {
          searchParams.year = this.searchForm.year_from
          if (this.searchForm.year_to) {
            searchParams.year += `-${this.searchForm.year_to}`
          }
        }

        if (this.searchForm.genres.length > 0) {
          searchParams.with_genres = this.searchForm.genres.join(',')
        }

        if (this.searchForm.min_rating > 0) {
          searchParams['vote_average.gte'] = this.searchForm.min_rating
        }

        if (this.searchForm.language) {
          searchParams.language = this.searchForm.language
        }

        if (this.searchForm.sort_by) {
          searchParams.sort_by = this.searchForm.sort_by
        }

        // Perform search
        await this.performAdvancedSearch(searchParams)
        
        // Emit success event
        this.$emit('search-completed', searchParams)
        
      } catch (error) {
        console.error('Advanced search error:', error)
        this.$emit('search-error', error)
      } finally {
        this.loading = false
      }
    },

    resetFilters() {
      this.searchForm = {
        query: '',
        media_type: 'all',
        year_from: null,
        year_to: null,
        genres: [],
        min_rating: 0,
        language: '',
        sort_by: 'relevance'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.advanced-search {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  padding: 2rem;
}

.advanced-search__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
}

.advanced-search__title {
  margin: 0;
  font-size: 2.8rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.advanced-search__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.advanced-search__form {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.advanced-search__field {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.advanced-search__label {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
}

.advanced-search__input {
  padding: 1.2rem 1.6rem;
  font-size: 1.4rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #b3b3b3;
  }

  &:focus {
    border-color: $primary-color;
    background: rgba(255, 255, 255, 0.15);
  }

  &--small {
    width: 12rem;
  }
}

.advanced-search__select {
  padding: 1.2rem 1.6rem;
  font-size: 1.4rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    border-color: $primary-color;
    background: rgba(255, 255, 255, 0.15);
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
}

.advanced-search__radio-group {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.advanced-search__radio {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.advanced-search__radio-input {
  width: 1.8rem;
  height: 1.8rem;
  accent-color: $primary-color;
}

.advanced-search__radio-label {
  font-size: 1.4rem;
  color: #fff;
}

.advanced-search__year-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.advanced-search__year-separator {
  font-size: 1.4rem;
  color: #b3b3b3;
}

.advanced-search__genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.advanced-search__checkbox {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.advanced-search__checkbox-input {
  width: 1.6rem;
  height: 1.6rem;
  accent-color: $primary-color;
}

.advanced-search__checkbox-label {
  font-size: 1.3rem;
  color: #fff;
}

.advanced-search__rating-slider {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.advanced-search__slider {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: $primary-color;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: $primary-color;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
}

.advanced-search__rating-display {
  font-size: 1.4rem;
  color: #fff;
  font-weight: 600;
  text-align: center;
}

.advanced-search__actions {
  display: flex;
  gap: 1.6rem;
  justify-content: center;
  margin-top: 2rem;
}

.advanced-search__search-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.4rem 3.2rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.advanced-search__reset-btn {
  padding: 1.4rem 2.4rem;
  font-size: 1.6rem;
  font-weight: 500;
  color: #b3b3b3;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.05);
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .advanced-search {
    padding: 1.6rem 1.2rem;
  }

  .advanced-search__title {
    font-size: 2.2rem;
  }

  .advanced-search__form {
    gap: 2rem;
  }

  .advanced-search__radio-group {
    gap: 1.5rem;
  }

  .advanced-search__genre-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.8rem;
  }

  .advanced-search__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .advanced-search__search-btn,
  .advanced-search__reset-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
