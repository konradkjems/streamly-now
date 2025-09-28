<template>
  <button
    :class="$style.watchlistBtn"
    :disabled="loading"
    type="button"
    :aria-label="isInWatchlistItem ? 'Remove from watchlist' : 'Add to watchlist'"
    @click="toggleWatchlist">
    <span :class="$style.icon">
      <svg v-if="isInWatchlistItem" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
        <path d="M13 12h3"/>
        <path d="M8 12H5"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
      </svg>
    </span>
    <span v-if="showText" :class="$style.text">
      {{ isInWatchlistItem ? 'In Watchlist' : 'Add to Watchlist' }}
    </span>
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    showText: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('watchlist', ['isInWatchlist']),

    mediaData() {
      return {
        media_type: this.item.title ? 'movie' : 'tv',
        media_id: this.item.id,
        media_title: this.item.title || this.item.name,
        media_poster_path: this.item.poster_path,
        media_release_date: this.item.release_date || this.item.first_air_date,
        media_overview: this.item.overview
      }
    },

    isInWatchlistItem() {
      return this.$store.getters['watchlist/isInWatchlist'](this.mediaData)
    },

    loading() {
      return this.$store.state.watchlist.loading
    }
  },

  methods: {
    ...mapActions('watchlist', ['toggleWatchlist']),

    async toggleWatchlist() {
      if (!this.isAuthenticated) {
        this.$router.push('/auth/signin')
        return
      }

      try {
        await this.$store.dispatch('watchlist/toggleWatchlist', this.mediaData)
      } catch (error) {
        console.error('Error toggling watchlist:', error)
        // You could show a toast notification here
      }
    }
  }
}
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.watchlistBtn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}

.text {
  white-space: nowrap;
}

// Watchlist button variants
.watchlistBtn {
  &.inWatchlist {
    background: rgba(229, 9, 20, 0.2);
    border-color: rgba(229, 9, 20, 0.4);
    color: $primary-color;

    &:hover:not(:disabled) {
      background: rgba(229, 9, 20, 0.3);
      border-color: rgba(229, 9, 20, 0.6);
    }
  }
}
</style>
