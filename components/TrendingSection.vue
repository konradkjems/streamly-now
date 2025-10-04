<template>
  <div class="trending-section">
    <div class="trending-section__header">
      <h2 class="trending-section__title">Trending Now</h2>
    </div>

    <div v-if="loading" class="trending-section__loading">
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

    <div v-else class="trending-section__content">
      <div class="trending-section__tabs">
        <button 
          :class="['trending-section__tab', { active: activeTab === 'movies' }]"
          @click="activeTab = 'movies'">
          Movies
        </button>
        <button 
          :class="['trending-section__tab', { active: activeTab === 'tv' }]"
          @click="activeTab = 'tv'">
          TV Shows
        </button>
      </div>

      <div class="trending-section__carousel">
        <button
          class="carousel__nav carousel__nav--left"
          aria-label="Previous"
          type="button"
          :disabled="disableLeftButton"
          @click="moveToClickEvent('left')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M17.9 23.2L6.1 12 17.9.8"/>
          </svg>
        </button>

        <div
          ref="carouselElement"
          class="carousel__items"
          @scroll="scrollEvent">
          <div
            v-for="item in currentItems"
            :key="`trending-${item.id}`"
            class="card">
            <nuxt-link
              class="card__link"
              :to="getItemUrl(item)">
              <div class="card__img">
                <img
                  v-if="item.poster_path"
                  v-lazyload="getPosterUrl(item.poster_path)"
                  class="lazyload"
                  :alt="item.title || item.name">
                <span v-else class="card__placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </span>
                
                <!-- Trending Badge -->
                <div class="card__trending-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <span>Trending</span>
                </div>
              </div>
              
              <div class="card__content">
                <h2 class="card__name">
                  {{ item.title || item.name }}
                </h2>
                <div class="card__meta">
                  <span class="card__rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    {{ item.vote_average?.toFixed(1) || 'N/A' }}
                  </span>
                  <span class="card__year">
                    {{ getReleaseYear(item) }}
                  </span>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>

        <button
          class="carousel__nav carousel__nav--right"
          aria-label="Next"
          type="button"
          :disabled="disableRightButton"
          @click="moveToClickEvent('right')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6.1 23.2L17.9 12 6.1.8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'
import carousel from '~/mixins/Carousel'

export default {
  name: 'TrendingSection',
  
  mixins: [carousel],

  data() {
    return {
      activeTab: 'movies'
    }
  },

  computed: {
    ...mapGetters('recommendations', ['getTrendingMovies', 'getTrendingTV', 'isLoading']),

    loading() {
      return this.isLoading
    },

    currentItems() {
      return this.activeTab === 'movies' ? this.getTrendingMovies : this.getTrendingTV
    }
  },

  mounted() {
    if (this.getTrendingMovies.length === 0 && this.getTrendingTV.length === 0) {
      this.fetchTrending()
    }
  },

  methods: {
    ...mapActions('recommendations', ['fetchTrending']),

    async fetchTrending() {
      try {
        await this.$store.dispatch('recommendations/fetchTrendingMovies')
        await this.$store.dispatch('recommendations/fetchTrendingTv')
      } catch (error) {
        console.error('Error fetching trending content:', error)
      }
    },

    getItemUrl(item) {
      if (this.activeTab === 'tv') {
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
      return `${apiImgUrl}/w370_and_h556_bestv2${posterPath}`
    },

    getReleaseYear(item) {
      const date = item.release_date || item.first_air_date
      return date ? new Date(date).getFullYear() : 'N/A'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.trending-section {
  margin-bottom: 4rem;
}

.trending-section__header {
  margin-bottom: 2rem;
}

.trending-section__title {
  margin: 0;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.5px;
}

.trending-section__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.trending-section__content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
}

.trending-section__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.5rem;
}

.trending-section__tab {
  flex: 1;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: #b3b3b3;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: #fff;
    background: $primary-color;
    font-weight: 600;
  }
}

.trending-section__carousel {
  position: relative;
}

// Carousel styles (reusing existing carousel styles)
.carousel__items {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.5rem 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.carousel__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 2rem;
    height: 2rem;
  }

  &--left {
    left: -2rem;
  }

  &--right {
    right: -2rem;
  }
}

// Enhanced card styles
.card {
  flex-shrink: 0;
  width: 20rem;
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

.card__link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card__img {
  position: relative;
  width: 100%;
  height: 28rem;
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

.card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #444;
}

.card__trending-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba($primary-color, 0.9);
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(10px);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

.card__content {
  padding: 1.5rem;
}

.card__name {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: #b3b3b3;
}

.card__rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #ffd700;

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
}

.card__year {
  color: #b3b3b3;
}

// Mobile responsive
@media (max-width: 768px) {
  .trending-section__title {
    font-size: 2rem;
  }

  .trending-section__content {
    padding: 1.5rem;
  }

  .trending-section__tab {
    padding: 0.8rem 1.5rem;
    font-size: 1.3rem;
  }

  .carousel__nav {
    width: 3.5rem;
    height: 3.5rem;

    &--left {
      left: -1.5rem;
    }

    &--right {
      right: -1.5rem;
    }

    svg {
      width: 1.8rem;
      height: 1.8rem;
    }
  }

  .card {
    width: 16rem;
  }

  .card__img {
    height: 22rem;
  }

  .card__content {
    padding: 1.2rem;
  }

  .card__name {
    font-size: 1.3rem;
  }

  .card__meta {
    font-size: 1.1rem;
  }

  .card__trending-badge {
    padding: 0.4rem 0.8rem;
    font-size: 1.1rem;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
}
</style>
