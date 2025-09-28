<template>
  <div class="watchlist">
    <!-- Watchlist Header -->
    <div class="watchlist__header">
      <div class="watchlist__hero">
        <div class="watchlist__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
        </div>
        
        <div class="watchlist__info">
          <h1 class="watchlist__title">My Watchlist</h1>
          <p class="watchlist__subtitle">
            {{ watchlistCount }} {{ watchlistCount === 1 ? 'item' : 'items' }} saved for later
          </p>
        </div>
      </div>
    </div>

    <!-- Watchlist Filters -->
    <div class="watchlist__filters">
      <div class="watchlist__filters-container">
        <div class="watchlist__filter-group">
          <label class="watchlist__filter-label">Filter by type:</label>
          <select v-model="typeFilter" class="watchlist__filter">
            <option value="all">All Content</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
        </div>

        <div class="watchlist__filter-group">
          <label class="watchlist__filter-label">Sort by:</label>
          <select v-model="sortBy" class="watchlist__filter">
            <option value="added_at">Date Added</option>
            <option value="media_title">Title</option>
            <option value="media_release_date">Release Date</option>
          </select>
        </div>

        <div class="watchlist__view-toggle">
          <button 
            :class="['watchlist__view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
            title="Grid View">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button 
            :class="['watchlist__view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            title="List View">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Watchlist Content -->
    <div class="watchlist__content">
      <div v-if="filteredAndSortedWatchlist.length > 0" :class="['watchlist__items', `watchlist__items--${viewMode}`]">
        <!-- Grid View -->
        <template v-if="viewMode === 'grid'">
          <div 
            v-for="item in filteredAndSortedWatchlist" 
            :key="`${item.media_type}-${item.media_id}`"
            class="watchlist__item watchlist__item--grid">
            <div class="watchlist__item-content">
              <nuxt-link 
                :to="getItemUrl(item)"
                class="watchlist__item-link">
                <div class="watchlist__item-img">
                  <img 
                    v-if="item.media_poster_path"
                    :src="getPosterUrl(item.media_poster_path)"
                    :alt="item.media_title" />
                  <div v-else class="watchlist__item-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  
                  <!-- Play Button Overlay -->
                  <div class="watchlist__play-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#fff">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                <div class="watchlist__item-info">
                  <h3 class="watchlist__item-title">{{ item.media_title }}</h3>
                  <p class="watchlist__item-type">{{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                  <p class="watchlist__item-date">Added {{ formatDate(item.added_at) }}</p>
                </div>
              </nuxt-link>

              <!-- Remove Button -->
              <button 
                class="watchlist__remove-btn"
                @click="removeFromWatchlist(item)"
                :disabled="loading"
                title="Remove from watchlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </template>

        <!-- List View -->
        <template v-else>
          <div 
            v-for="item in filteredAndSortedWatchlist" 
            :key="`${item.media_type}-${item.media_id}`"
            class="watchlist__item watchlist__item--list">
            <div class="watchlist__item-content">
              <nuxt-link 
                :to="getItemUrl(item)"
                class="watchlist__item-link">
                <div class="watchlist__item-img">
                  <img 
                    v-if="item.media_poster_path"
                    :src="getPosterUrl(item.media_poster_path)"
                    :alt="item.media_title" />
                  <div v-else class="watchlist__item-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                </div>

                <div class="watchlist__item-details">
                  <h3 class="watchlist__item-title">{{ item.media_title }}</h3>
                  <p class="watchlist__item-type">{{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                  <p class="watchlist__item-overview" v-if="item.media_overview">
                    {{ truncateText(item.media_overview, 150) }}
                  </p>
                  <div class="watchlist__item-meta">
                    <span class="watchlist__item-date">Added {{ formatDate(item.added_at) }}</span>
                    <span v-if="item.media_release_date" class="watchlist__item-release">
                      Released {{ formatDate(item.media_release_date) }}
                    </span>
                  </div>
                </div>
              </nuxt-link>

              <!-- Remove Button -->
              <button 
                class="watchlist__remove-btn"
                @click="removeFromWatchlist(item)"
                :disabled="loading"
                title="Remove from watchlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div v-else class="watchlist__empty">
        <div class="watchlist__empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
        </div>
        <h2 class="watchlist__empty-title">Your watchlist is empty</h2>
        <p class="watchlist__empty-message">
          Start building your watchlist by adding movies and TV shows you want to watch later.
        </p>
        <nuxt-link to="/" class="watchlist__empty-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Browse Content
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'

export default {
  name: 'Watchlist',
  
  middleware: 'auth',
  
  data() {
    return {
      typeFilter: 'all',
      sortBy: 'added_at',
      viewMode: 'grid', // 'grid' or 'list'
      loading: false
    }
  },

  computed: {
    ...mapGetters('watchlist', ['getWatchlist']),

    watchlistCount() {
      return this.getWatchlist.length
    },

    filteredAndSortedWatchlist() {
      let filtered = this.getWatchlist

      // Filter by type
      if (this.typeFilter !== 'all') {
        filtered = filtered.filter(item => item.media_type === this.typeFilter)
      }

      // Sort
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'media_title':
            return a.media_title.localeCompare(b.media_title)
          case 'media_release_date':
            return new Date(b.media_release_date || 0) - new Date(a.media_release_date || 0)
          case 'added_at':
          default:
            return new Date(b.added_at) - new Date(a.added_at)
        }
      })

      return filtered
    }
  },

  methods: {
    ...mapActions('watchlist', ['toggleWatchlist']),

    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    getPosterUrl(posterPath) {
      return `${apiImgUrl}/w370_and_h556_bestv2${posterPath}`
    },

    getItemUrl(item) {
      if (item.media_type === 'tv') {
        return {
          name: 'tv-id',
          params: { id: item.media_id },
          query: { tab: 'watch' }
        }
      } else {
        return {
          name: 'movie-id',
          params: { id: item.media_id },
          query: { tab: 'watch' }
        }
      }
    },

    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },

    async removeFromWatchlist(item) {
      this.loading = true
      try {
        const mediaData = {
          media_type: item.media_type,
          media_id: item.media_id,
          media_title: item.media_title,
          media_poster_path: item.media_poster_path,
          media_release_date: item.media_release_date,
          media_overview: item.media_overview
        }
        await this.toggleWatchlist(mediaData)
      } catch (error) {
        console.error('Error removing from watchlist:', error)
        // You could show a toast notification here
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.watchlist {
  min-height: 100vh;
  background: $base-bg;
  color: #fff;
}

.watchlist__header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  padding: 4rem 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.watchlist__hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.watchlist__icon {
  flex-shrink: 0;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  svg {
    width: 4.8rem;
    height: 4.8rem;
  }
}

.watchlist__info {
  flex: 1;
}

.watchlist__title {
  font-size: 3.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
}

.watchlist__subtitle {
  font-size: 1.6rem;
  color: #b3b3b3;
}

.watchlist__filters {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 6.8rem;
  z-index: 100;
}

.watchlist__filters-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.watchlist__filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.watchlist__filter-label {
  font-size: 1.4rem;
  font-weight: 500;
  color: #b3b3b3;
  white-space: nowrap;
}

.watchlist__filter {
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 1.4rem;
  outline: none;
  min-width: 150px;

  &:focus {
    border-color: $primary-color;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
}

.watchlist__view-toggle {
  display: flex;
  gap: 0;
  margin-left: auto;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.watchlist__view-btn {
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  &.active {
    background: $primary-color;
    color: #fff;
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.watchlist__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.watchlist__items {
  &--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }

  &--list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.watchlist__item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  &--grid {
    .watchlist__item-content {
      position: relative;
    }

    .watchlist__remove-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .watchlist__remove-btn {
      opacity: 1;
    }
  }

  &--list {
    .watchlist__item-content {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1.5rem;
    }

    .watchlist__remove-btn {
      margin-left: auto;
      opacity: 0.6;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.watchlist__item-link {
  display: block;
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.watchlist__item-img {
  position: relative;
  width: 100%;
  height: 20rem;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;

  .watchlist__item--list & {
    width: 12rem;
    height: 18rem;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.watchlist__item-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;

  svg {
    width: 4rem;
    height: 4rem;
  }
}

.watchlist__play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.watchlist__item:hover .watchlist__play-overlay {
  opacity: 1;
}

.watchlist__item-info,
.watchlist__item-details {
  padding: 0 1rem 1rem;

  .watchlist__item--list & {
    padding: 0;
    flex: 1;
  }
}

.watchlist__item-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  line-height: 1.3;

  .watchlist__item--list & {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
}

.watchlist__item-type {
  font-size: 1.2rem;
  color: $primary-color;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .watchlist__item--list & {
    font-size: 1.3rem;
  }
}

.watchlist__item-date {
  font-size: 1.2rem;
  color: #b3b3b3;

  .watchlist__item--list & {
    font-size: 1.3rem;
  }
}

.watchlist__item-overview {
  font-size: 1.3rem;
  color: #b3b3b3;
  line-height: 1.5;
  margin: 1rem 0;
}

.watchlist__item-meta {
  display: flex;
  gap: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.watchlist__remove-btn {
  width: 3.2rem;
  height: 3.2rem;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
}

.watchlist__empty {
  text-align: center;
  padding: 6rem 2rem;
  color: #666;

  &-icon {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;

    svg {
      opacity: 0.5;
      color: #666;
    }
  }

  &-title {
    font-size: 2.4rem;
    color: #b3b3b3;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  &-message {
    font-size: 1.6rem;
    margin-bottom: 3rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  &-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1.4rem 2.8rem;
    background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    font-size: 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, lighten($primary-color, 5%) 0%, $primary-color 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba($primary-color, 0.4);
    }

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
}

@media (max-width: $breakpoint-medium) {
  .watchlist__hero {
    flex-direction: column;
    text-align: center;
  }

  .watchlist__filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .watchlist__filter-group {
    justify-content: space-between;
  }

  .watchlist__view-toggle {
    margin-left: 0;
    justify-content: center;
  }

  .watchlist__content {
    padding: 2rem 1rem;
  }

  .watchlist__items--grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .watchlist__item--list .watchlist__item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .watchlist__item--list .watchlist__item-img {
    width: 100%;
    height: 15rem;
  }
}

@media (max-width: $breakpoint-small) {
  .watchlist__items--grid {
    grid-template-columns: 1fr;
  }
}
</style>
