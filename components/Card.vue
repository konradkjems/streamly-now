<template>
  <div 
    class="card"
    @mouseenter="showPreview = true"
    @mouseleave="showPreview = false">
    <div class="card__content">
      <nuxt-link
        class="card__link"
        :to="{ name: `${media}-id`, params: { id: item.id } }">
        <div class="card__img">
          <img
            v-if="poster"
            v-lazyload="poster"
            class="lazyload"
            :alt="name">

          <span v-else>
            <!-- eslint-disable-next-line -->
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd" fill="#999"><path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/></svg>
          </span>

          <!-- Hover Preview Overlay -->
          <div v-if="showPreview && media !== 'person'" class="card__preview-overlay">
            <div class="card__preview-content">
              <div class="card__preview-actions">
                <button @click.stop="goToWatch" class="card__preview-btn card__preview-btn--play" title="Play">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <button @click.stop="toggleWatchlist" class="card__preview-btn card__preview-btn--watchlist" title="Add to Watchlist">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
              <div class="card__preview-info">
                <div class="card__preview-rating">
                  <span class="rating-value">{{ formatRating(item.vote_average) }}</span>
                  <span class="star-icon">⭐</span>
                </div>
                <div v-if="item.release_date || item.first_air_date" class="card__preview-year">
                  {{ new Date(item.release_date || item.first_air_date).getFullYear() }}
                </div>
                <div v-if="item.runtime" class="card__preview-duration">
                  {{ formatDuration(item.runtime) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 class="card__name">
          {{ name }}
        </h2>

        <div
          v-if="media !== 'person' && (stars || item.vote_average)"
          class="card__rating">
          <div
            v-if="stars"
            class="card__stars">
            <div :style="{ width: `${stars}%` }" />
          </div>

          <div
            v-if="item.vote_average"
            class="card__vote">
            {{ item.vote_average | rating }}
          </div>
        </div>
      </nuxt-link>

      <!-- Watchlist Button Overlay -->
      <div v-if="media !== 'person'" class="card__actions">
        <WatchlistButton :item="item" />
      </div>

      <!-- Progress Bar (if watched) -->
      <div v-if="media !== 'person' && watchProgress" class="card__progress">
        <div 
          class="card__progress-bar"
          :style="{ width: watchProgress.progress_percentage + '%' }">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { apiImgUrl } from '~/api';
import { name, stars } from '~/mixins/Details';
import WatchlistButton from '~/components/WatchlistButton';

export default {
  components: {
    WatchlistButton,
  },

  mixins: [
    name,
    stars,
  ],

  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      showPreview: false,
    }
  },

  computed: {
    ...mapGetters('viewingHistory', ['watchProgress']),

    poster () {
      if (this.item.poster_path) {
        return `${apiImgUrl}/w370_and_h556_bestv2${this.item.poster_path}`;
      } else if (this.item.profile_path) {
        return `${apiImgUrl}/w370_and_h556_bestv2${this.item.profile_path}`;
      } else {
        return false;
      }
    },

    media () {
      if (this.item.media_type) {
        return this.item.media_type;
      } else if (this.item.name) {
        return 'tv';
      } else {
        return 'movie';
      }
    },

    watchProgress() {
      if (!this.$store.getters['auth/isAuthenticated']) return null
      
      return this.$store.getters['viewingHistory/watchProgress']({
        media_type: this.media,
        media_id: this.item.id,
        season_number: null,
        episode_number: null
      })
    },
  },

  methods: {
    goToWatch() {
      this.$router.push({ 
        name: `${this.media}-id`, 
        params: { id: this.item.id },
        query: { tab: 'watch' }
      })
    },

    toggleWatchlist() {
      this.$store.dispatch('watchlist/toggleWatchlist', {
        media_type: this.media,
        media_id: this.item.id,
        title: this.item.title || this.item.name,
        poster_path: this.item.poster_path
      })
    },

    formatDuration(minutes) {
      if (!minutes) return ''
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    },

    formatRating(rating) {
      if (!rating) return '0.0'
      return rating.toFixed(1)
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  .card__img {
    position: relative;
    overflow: hidden;
  }

  .card__preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
  }

  &:hover .card__preview-overlay {
    opacity: 1;
  }

  .card__preview-content {
    text-align: center;
    padding: 2rem 2.5rem 2rem 2.5rem; // Make preview content roomier
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem; // space between actions & info
  }

  .card__preview-actions {
    display: flex;
    gap: 0.85rem;
    justify-content: center;
    margin-bottom: 1.35rem;
  }

  .card__preview-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: #fff;
      transform: scale(1.1);
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .card__preview-btn--play {
    background: #fff;
    border-color: #fff;

    svg {
      fill: #000;
    }

    &:hover {
      background: #fff;
      transform: scale(1.15);
    }
  }

  .card__preview-info {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    color: #fff;
    font-size: 0.96rem;
    align-items: center;
  }

  .card__preview-rating {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 1.13rem;
    margin-bottom: 0.15rem;
  }

  .rating-value {
    font-weight: 600;
    color: #fff;
    line-height: 1;
  }

  .star-icon {
    font-size: 1.22rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    padding-left: 0.25rem;
    padding-top: 4rem;
    
  }

  .card__preview-year,
  .card__preview-duration {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1.03rem;
    margin: 0.13rem 0 0.13rem 0;
    font-weight: 500;
    letter-spacing: 0.015em;
  }

  .card__preview-year:not(:last-child) {
    margin-bottom: 0.18rem;
  }

  @media (max-width: 600px) {
    .card__preview-rating {
      display: none; /* Hide on mobile to avoid touch issues */
    }
  }
}

@media (max-width: 768px) {
  .card__preview-overlay {
    display: none; /* Hide on mobile to avoid touch issues */
  }
}
</style>
