<template>
  <div class="because-you-watched">
    <div class="because-you-watched__header">
      <h2 class="because-you-watched__title">Because You Watched</h2>
    </div>

    <div v-if="loading" class="because-you-watched__loading">
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

    <div v-else-if="recommendations.length === 0" class="because-you-watched__empty">
      <div class="because-you-watched__empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <h3 class="because-you-watched__empty-title">Start Watching to Get Recommendations</h3>
        <p class="because-you-watched__empty-description">
          Watch movies and TV shows to see personalized recommendations based on your viewing history.
        </p>
      </div>
    </div>

    <div v-else class="because-you-watched__content">
      <div 
        v-for="group in recommendations" 
        :key="`${group.basedOn.type}-${group.basedOn.id}`"
        class="because-you-watched__group">
        
        <div class="because-you-watched__group-header">
          <h3 class="because-you-watched__group-title">
            Because you watched 
            <nuxt-link 
              :to="getItemUrl(group.basedOn)"
              class="because-you-watched__based-on-link">
              {{ group.basedOn.title }}
            </nuxt-link>
          </h3>
        </div>

        <div class="because-you-watched__carousel">
          <button
            class="carousel__nav carousel__nav--left"
            aria-label="Previous"
            type="button"
            :disabled="disableLeftButton"
            @click="moveToClickEvent('left', group.basedOn.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M17.9 23.2L6.1 12 17.9.8"/>
            </svg>
          </button>

          <div
            :ref="`carouselElement-${group.basedOn.id}`"
            class="carousel__items"
            @scroll="scrollEvent">
            <div
              v-for="item in group.recommendations"
              :key="`because-${item.id}`"
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
                </div>
                <h2 class="card__name">
                  {{ item.title || item.name }}
                </h2>
              </nuxt-link>
            </div>
          </div>

          <button
            class="carousel__nav carousel__nav--right"
            aria-label="Next"
            type="button"
            :disabled="disableRightButton"
            @click="moveToClickEvent('right', group.basedOn.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M6.1 23.2L17.9 12 6.1.8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'
import carousel from '~/mixins/Carousel'

export default {
  name: 'BecauseYouWatched',
  
  mixins: [carousel],

  computed: {
    ...mapGetters('recommendations', ['getBecauseYouWatched', 'isLoading']),
    ...mapGetters('auth', ['isAuthenticated']),

    recommendations() {
      return this.getBecauseYouWatched
    },

    loading() {
      return this.isLoading
    }
  },

  mounted() {
    if (this.isAuthenticated && this.recommendations.length === 0) {
      this.fetchRecommendations()
    }
  },

  watch: {
    recommendations: {
      handler(newRecommendations, oldRecommendations) {
        this.$nextTick(() => {
          this.initializeCarousels()
        })
        
        // Show notification for new recommendations
        if (newRecommendations.length > 0 && oldRecommendations && oldRecommendations.length === 0) {
          this.showRecommendationNotification()
        }
      },
      deep: true
    }
  },

  methods: {
    ...mapActions('recommendations', ['fetchBecauseYouWatched']),

    async fetchRecommendations() {
      try {
        await this.fetchBecauseYouWatched()
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      }
    },

    getItemUrl(item) {
      if (item.media_type === 'tv' || item.media_type === 'tv') {
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

    initializeCarousels() {
      // Initialize each carousel group
      this.recommendations.forEach((group, groupIndex) => {
        if (group.recommendations && group.recommendations.length > 0) {
          // Use a timeout to ensure DOM is updated
          setTimeout(() => {
            const carouselRef = `carouselElement-${group.basedOn.id}`
            if (this.$refs[carouselRef] && this.$refs[carouselRef][0]) {
              // Temporarily set the carouselElement ref for the mixin
              this.$refs.carouselElement = this.$refs[carouselRef][0]
              this.calculateState(group.recommendations.length)
            }
          }, 100)
        }
      })
    },

    moveToClickEvent(direction, groupId) {
      const carouselRef = `carouselElement-${groupId}`
      if (this.$refs[carouselRef] && this.$refs[carouselRef][0]) {
        // Temporarily set the carouselElement ref for the mixin
        this.$refs.carouselElement = this.$refs[carouselRef][0]
        // Call the mixin's moveToClickEvent method
        this.$options.mixins[0].methods.moveToClickEvent.call(this, direction)
      }
    },

    async showRecommendationNotification() {
      // Show notification for new recommendations
      if (this.recommendations.length > 0 && this.$notifications) {
        const firstGroup = this.recommendations[0]
        if (firstGroup && firstGroup.recommendations && firstGroup.recommendations.length > 0) {
          const firstRecommendation = firstGroup.recommendations[0]
          const basedOn = firstGroup.basedOn.title
          
          try {
            await this.$notifications.showRecommendationNotification(
              firstRecommendation.title || firstRecommendation.name,
              basedOn
            )
          } catch (error) {
            console.log('Recommendation notification failed:', error)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.because-you-watched {
  margin: 4rem 2.5rem;

  @media (min-width: $breakpoint-xsmall) {
    margin: 6rem 4rem;
  }

  @media (min-width: $breakpoint-large) {
    margin: 8rem;
  }
}

.because-you-watched__header {
  margin-bottom: 2rem;
}

.because-you-watched__title {
  margin: 0;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.5px;
}

.because-you-watched__loading {
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

.because-you-watched__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
  padding: 4rem 2rem;
  text-align: center;
}

.because-you-watched__empty-content {
  max-width: 40rem;
}

.because-you-watched__empty-title {
  margin: 2rem 0 1rem;
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}

.because-you-watched__empty-description {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.6;
  color: #b3b3b3;
}

.because-you-watched__content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.because-you-watched__group {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
}

.because-you-watched__group-header {
  margin-bottom: 2rem;
}

.because-you-watched__group-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 500;
  color: #b3b3b3;
}

.because-you-watched__based-on-link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
}

.because-you-watched__carousel {
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

// Card styles (reusing existing card styles)
.card {
  flex-shrink: 0;
  width: 20rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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

.card__name {
  margin: 0;
  padding: 1.2rem 1.5rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Mobile responsive
@media (max-width: 768px) {
  .because-you-watched__title {
    font-size: 2rem;
  }

  .because-you-watched__group {
    padding: 1.5rem;
  }

  .because-you-watched__group-title {
    font-size: 1.6rem;
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

  .card__name {
    padding: 1rem 1.2rem;
    font-size: 1.3rem;
  }
}
</style>
