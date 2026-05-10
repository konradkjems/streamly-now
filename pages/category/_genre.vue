<template>
  <div class="category-page">
    <!-- Category Header -->
    <div class="category-page__header">
      <div class="category-page__header-content">
        <div class="category-page__breadcrumb">
          <nuxt-link to="/" class="category-page__breadcrumb-link">Home</nuxt-link>
          <span class="category-page__breadcrumb-separator">/</span>
          <span class="category-page__breadcrumb-current">{{ categoryTitle }}</span>
        </div>
        
        <h1 class="category-page__title">{{ categoryTitle }}</h1>
        <p class="category-page__subtitle">{{ categoryDescription }}</p>
        
        <!-- Category Stats -->
        <div class="category-page__stats">
          <div class="category-page__stat">
            <span class="category-page__stat-number">{{ totalResults }}</span>
            <span class="category-page__stat-label">Items</span>
          </div>
          <div class="category-page__stat">
            <span class="category-page__stat-number">{{ currentPage }}</span>
            <span class="category-page__stat-label">Page</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Content -->
    <div class="category-page__content">
      <!-- Loading State -->
      <div v-if="loading" class="category-page__loading">
        <div class="loading-spinner">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" stroke="#2196f3">
            <g fill="none" fill-rule="evenodd" stroke-width="2">
              <circle cx="22" cy="22" r="1">
                <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
              </circle>
              <circle cx="22" cy="22" r="1">
                <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
              </circle>
            </g>
          </svg>
        </div>
      </div>

      <!-- Content Grid -->
      <div v-else-if="categoryItems.length > 0" class="category-page__grid">
        <div
          v-for="item in categoryItems"
          :key="`${mediaType}-${item.id}`"
          class="category-page__item">
          <nuxt-link
            :to="getItemUrl(item)"
            class="category-page__item-link">
            <div class="category-page__item-img">
              <img
                v-if="item.poster_path"
                v-lazyload="getPosterUrl(item.poster_path)"
                class="lazyload"
                :alt="item.title || item.name">
              <span v-else class="category-page__item-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </span>
              
              <!-- Item Type Badge -->
              <div class="category-page__item-badge">
                {{ mediaType === 'movie' ? 'Movie' : 'TV Show' }}
              </div>
            </div>
            
            <div class="category-page__item-info">
              <h3 class="category-page__item-title">
                {{ item.title || item.name }}
              </h3>
              
              <div class="category-page__item-meta">
                <div class="category-page__item-rating">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <span>{{ item.vote_average?.toFixed(1) || 'N/A' }}</span>
                </div>
                
                <div class="category-page__item-year">
                  {{ getReleaseYear(item) }}
                </div>
              </div>
              
              <p class="category-page__item-overview">
                {{ truncateText(item.overview, 120) }}
              </p>
            </div>
          </nuxt-link>
        </div>
      </div>

      <!-- No Content State -->
      <div v-else class="category-page__empty">
        <div class="category-page__empty-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 class="category-page__empty-title">No Content Found</h3>
          <p class="category-page__empty-description">
            We couldn't find any content for this category. Try browsing other genres.
          </p>
          <nuxt-link to="/" class="category-page__empty-btn">
            Browse All Content
          </nuxt-link>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="category-page__pagination">
        <button
          :disabled="currentPage <= 1"
          class="category-page__pagination-btn"
          @click="goToPage(currentPage - 1)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Previous
        </button>
        
        <div class="category-page__pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <button
          :disabled="currentPage >= totalPages"
          class="category-page__pagination-btn"
          @click="goToPage(currentPage + 1)">
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'

export default {
  name: 'CategoryPage',

  async asyncData({ params, query, error }) {
    try {
      const genreId = parseInt(params.genre)
      const mediaType = query.type || 'movie'
      const page = parseInt(query.page) || 1

      if (isNaN(genreId)) {
        throw new Error('Invalid genre ID')
      }

      return {
        genreId,
        mediaType,
        page
      }
    } catch (err) {
      error({ statusCode: 404, message: 'Category not found' })
    }
  },

  data() {
    return {
      categoryItems: [],
      totalResults: 0,
      totalPages: 0,
      loading: false
    }
  },

  computed: {
    ...mapGetters('genres', ['getGenreById']),

    currentPage() {
      return this.page
    },

    genre() {
      return this.getGenreById(this.genreId)
    },

    categoryTitle() {
      if (this.genre) {
        return `${this.genre.name} ${this.mediaType === 'movie' ? 'Movies' : 'TV Shows'}`
      }
      return 'Category'
    },

    categoryDescription() {
      if (this.genre) {
        return `Discover the best ${this.genre.name.toLowerCase()} ${this.mediaType === 'movie' ? 'movies' : 'TV shows'}`
      }
      return 'Browse content by category'
    }
  },

  watch: {
    '$route.query': {
      handler() {
        this.loadCategoryContent()
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions('genres', ['fetchGenreContent']),

    async loadCategoryContent() {
      this.loading = true
      
      try {
        const response = await this.fetchGenreContent({
          genreId: this.genreId,
          mediaType: this.mediaType,
          page: this.currentPage
        })
        
        this.categoryItems = response.results || []
        this.totalResults = response.total_results || 0
        this.totalPages = response.total_pages || 0
        
      } catch (error) {
        console.error('Error loading category content:', error)
        this.categoryItems = []
        this.totalResults = 0
        this.totalPages = 0
      } finally {
        this.loading = false
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$router.push({
          name: 'category-genre',
          params: { genre: this.genreId },
          query: { 
            type: this.mediaType,
            page: page
          }
        })
      }
    },

    getItemUrl(item) {
      if (this.mediaType === 'tv') {
        return {
          name: 'tv-id',
          params: { id: item.id }
        }
      } else {
        return {
          name: 'movie-id',
          params: { id: item.id }
        }
      }
    },

    getPosterUrl(posterPath) {
      return `${apiImgUrl}/w342${posterPath}`
    },

    getReleaseYear(item) {
      const date = item.release_date || item.first_air_date
      return date ? new Date(date).getFullYear() : 'N/A'
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  },

  head() {
    return {
      title: `${this.categoryTitle} - Streamly`,
      meta: [
        { hid: 'og:title', property: 'og:title', content: `${this.categoryTitle} - Streamly` },
        { hid: 'description', name: 'description', content: this.categoryDescription },
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.category-page {
  min-height: 100vh;
  background: $base-bg;
  color: #fff;
}

.category-page__header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  padding: 4rem 2rem 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-page__header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.category-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.category-page__breadcrumb-link {
  color: $primary-color;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: lighten($primary-color, 10%);
  }
}

.category-page__breadcrumb-separator {
  color: #666;
}

.category-page__breadcrumb-current {
  color: #b3b3b3;
}

.category-page__title {
  margin: 0 0 1rem;
  font-size: 3.6rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.category-page__subtitle {
  margin: 0 0 2rem;
  font-size: 1.6rem;
  color: #b3b3b3;
  line-height: 1.6;
}

.category-page__stats {
  display: flex;
  gap: 2rem;
}

.category-page__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-page__stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 0.5rem;
}

.category-page__stat-label {
  font-size: 1.2rem;
  color: #b3b3b3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-page__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.category-page__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.category-page__item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.category-page__item-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.category-page__item-img {
  position: relative;
  width: 100%;
  height: 32rem;
  overflow: hidden;
  background: #333;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.category-page__item-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #444;
}

.category-page__item-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  background: rgba($primary-color, 0.9);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-page__item-info {
  padding: 2rem;
}

.category-page__item-title {
  margin: 0 0 1rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-page__item-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.category-page__item-rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #ffd700;

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
}

.category-page__item-year {
  color: #b3b3b3;
}

.category-page__item-overview {
  margin: 0;
  font-size: 1.3rem;
  color: #b3b3b3;
  line-height: 1.6;
}

.category-page__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40rem;
  text-align: center;
}

.category-page__empty-content {
  max-width: 40rem;
}

.category-page__empty-title {
  margin: 2rem 0 1rem;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
}

.category-page__empty-description {
  margin: 0 0 2rem;
  font-size: 1.4rem;
  line-height: 1.6;
  color: #b3b3b3;
}

.category-page__empty-btn {
  display: inline-flex;
  align-items: center;
  padding: 1.2rem 2.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
  }
}

.category-page__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.category-page__pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.category-page__pagination-info {
  font-size: 1.4rem;
  color: #b3b3b3;
  font-weight: 500;
}

// Mobile responsive
@media (max-width: 768px) {
  .category-page__header {
    padding: 3rem 1.5rem 2rem;
  }

  .category-page__title {
    font-size: 2.8rem;
  }

  .category-page__subtitle {
    font-size: 1.4rem;
  }

  .category-page__stats {
    gap: 1rem;
  }

  .category-page__stat {
    padding: 0.8rem 1.2rem;
  }

  .category-page__stat-number {
    font-size: 1.6rem;
  }

  .category-page__content {
    padding: 2rem 1.5rem;
  }

  .category-page__grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .category-page__item-img {
    height: 28rem;
  }

  .category-page__item-info {
    padding: 1.5rem;
  }

  .category-page__item-title {
    font-size: 1.4rem;
  }

  .category-page__item-meta {
    font-size: 1.1rem;
  }

  .category-page__item-overview {
    font-size: 1.2rem;
  }

  .category-page__pagination {
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-page__pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
