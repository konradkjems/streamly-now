<template>
  <div class="listing listing--carousel">
    <div class="listing__head">
      <h2 class="listing__title">Continue Watching</h2>
    </div>

    <!-- Content when user has items to continue watching -->
    <div v-if="continueWatchingItems.length > 0" class="carousel">
      <button
        class="carousel__nav carousel__nav--left"
        aria-label="Previous"
        type="button"
        :disabled="disableLeftButton"
        @click="moveToClickEvent('left')">
        <!-- eslint-disable-next-line -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M17.9 23.2L6.1 12 17.9.8"/></svg>
      </button>

      <div
        ref="carouselElement"
        class="carousel__items"
        @scroll="scrollEvent">
        <div
          v-for="item in continueWatchingItems"
          :key="`continue-${item.media_id}-${item.season_number || 'null'}-${item.episode_number || 'null'}-${item.id || Date.now()}`"
          class="card card--continue-watching">
          <nuxt-link
            class="card__link"
            :to="getItemUrl(item)"
            @click="recordViewingClick(item)">
            <div class="card__img">
              <img
                v-if="item.media_poster_path"
                v-lazyload="getPosterUrl(item.media_poster_path)"
                class="lazyload"
                :alt="item.media_title">

              <span v-else>
                <!-- eslint-disable-next-line -->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd" fill="#999"><path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/></svg>
              </span>

              <!-- Progress Bar Overlay -->
              <div class="card__progress">
                <div 
                  class="card__progress-bar"
                  :style="{ width: getProgressPercentage(item) + '%' }">
                </div>
              </div>

              <!-- Play Button Overlay -->
              <div class="card__play-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#fff">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            <h2 class="card__name">
              {{ getItemTitle(item) }}
            </h2>

            <div class="card__progress-info">
              <span class="card__progress-text">
                {{ formatTime(item.watch_duration) }} / {{ formatTime(item.total_duration) }}
              </span>
              <span class="card__progress-percentage">
                {{ Math.round(getProgressPercentage(item)) }}%
              </span>
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
        <!-- eslint-disable-next-line -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6.1 23.2L17.9 12 6.1.8"/></svg>
      </button>
    </div>

    <!-- Content when user has no items to continue watching -->
    <div v-else class="continue-watching__empty">
      <div class="continue-watching__empty-content">
        <div class="continue-watching__empty-icon">
          <!-- eslint-disable-next-line -->
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <h3 class="continue-watching__empty-title">
          {{ isAuthenticated ? 'Nothing to Continue' : 'Sign In to Continue Watching' }}
        </h3>
        <p class="continue-watching__empty-description">
          {{ isAuthenticated 
            ? 'Start watching movies and TV shows to see them here' 
            : 'Sign in to your account to continue watching your favorite content' 
          }}
        </p>
        <nuxt-link 
          v-if="!isAuthenticated"
          to="/auth/signin" 
          class="button button--primary continue-watching__signin-btn">
          Sign In
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'
import carousel from '~/mixins/Carousel'

export default {
  name: 'ContinueWatching',
  
  mixins: [carousel],

  computed: {
    ...mapGetters('viewingHistory', ['continueWatching']),
    ...mapGetters('auth', ['isAuthenticated']),

    continueWatchingItems() {
      const items = this.continueWatching.slice(0, 10) // Limit to 10 items
      
      // Debug logging
      if (process.client) {
        console.log('ContinueWatching - continueWatching getter:', this.continueWatching)
        console.log('ContinueWatching - continueWatchingItems:', items)
        console.log('ContinueWatching - isAuthenticated:', this.isAuthenticated)
      }
      
      return items
    }
  },

  mounted() {
    if (this.continueWatchingItems.length > 0) {
      this.calculateState(this.continueWatchingItems.length)
    }
  },

  watch: {
    continueWatchingItems: {
      handler(newItems) {
        if (newItems.length > 0) {
          this.$nextTick(() => {
            this.calculateState(newItems.length)
          })
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions('viewingHistory', ['recordViewing']),

    getItemUrl(item) {
      if (item.media_type === 'tv') {
        return {
          name: 'tv-id',
          params: { id: item.media_id },
          query: { 
            tab: 'watch',
            season: item.season_number,
            episode: item.episode_number
          }
        }
      } else {
        return {
          name: 'movie-id',
          params: { id: item.media_id },
          query: { tab: 'watch' }
        }
      }
    },

    getItemTitle(item) {
      if (item.media_type === 'tv') {
        return `${item.media_title} - S${item.season_number}E${item.episode_number}`
      }
      return item.media_title
    },

    getPosterUrl(posterPath) {
      return `${apiImgUrl}/w370_and_h556_bestv2${posterPath}`
    },

    getProgressPercentage(item) {
      if (item.total_duration <= 0) return 0
      return (item.watch_duration / item.total_duration) * 100
    },

    formatTime(seconds) {
      if (!seconds) return '0:00'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:00`
      }
      return `${minutes}:00`
    },

    async recordViewingClick(item) {
      // Record that user clicked to continue watching
      try {
        await this.recordViewing({
          media_type: item.media_type,
          media_id: item.media_id,
          media_title: item.media_title,
          media_poster_path: item.media_poster_path,
          season_number: item.season_number,
          episode_number: item.episode_number,
          watch_duration: item.watch_duration,
          total_duration: item.total_duration,
          completed: false
        })
      } catch (error) {
        console.error('Error recording viewing click:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.card--continue-watching {
  position: relative;
  
  .card__img {
    position: relative;
    overflow: hidden;
  }

  .card__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 2;
  }

  .card__progress-bar {
    height: 100%;
    background: $primary-color;
    transition: width 0.3s ease;
  }

  .card__play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
    pointer-events: none;
  }

  &:hover {
    .card__play-overlay {
      opacity: 1;
    }
  }

  .card__progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 1.1rem;
    color: #b3b3b3;
  }

  .card__progress-text {
    font-size: 1rem;
  }

  .card__progress-percentage {
    font-size: 1rem;
    font-weight: 600;
    color: $primary-color;
  }
}

@media (max-width: 480px) {
  .card--continue-watching {
    .card__name,
    .card__progress-info {
      display: none;
    }
  }
}

// Empty State Styles
.continue-watching__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20rem;
  padding: 4rem 2rem;
  text-align: center;
}

.continue-watching__empty-content {
  max-width: 40rem;
}

.continue-watching__empty-icon {
  margin-bottom: 2rem;
  
  svg {
    opacity: 0.6;
  }
}

.continue-watching__empty-title {
  margin: 0 0 1rem;
  font-size: 2.2rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.continue-watching__empty-description {
  margin: 0 0 2.5rem;
  font-size: 1.5rem;
  line-height: 1.6;
  color: #b3b3b3;
}

.continue-watching__signin-btn {
  display: inline-flex;
  align-items: center;
  padding: 1.2rem 2.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  text-decoration: none;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
