<template>
  <div class="genre-navigation">
    <div class="genre-navigation__header">
      <h2 class="genre-navigation__title">Browse by Genre</h2>
      <p class="genre-navigation__subtitle">Discover content by category</p>
    </div>

    <div v-if="loading" class="genre-navigation__loading">
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

    <div v-else class="genre-navigation__content">
      <!-- Popular Genres -->
      <div class="genre-navigation__section">
        <h3 class="genre-navigation__section-title">Popular Genres</h3>
        <div class="genre-navigation__grid">
          <nuxt-link
            v-for="genre in popularGenres"
            :key="`popular-${genre.id}`"
            :to="getGenreUrl(genre, 'movie')"
            class="genre-navigation__item">
            <div class="genre-navigation__item-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="genre-navigation__item-name">{{ genre.name }}</span>
          </nuxt-link>
        </div>
      </div>

      <!-- All Movie Genres -->
      <div class="genre-navigation__section">
        <h3 class="genre-navigation__section-title">Movie Genres</h3>
        <div class="genre-navigation__grid">
          <nuxt-link
            v-for="genre in movieGenres"
            :key="`movie-${genre.id}`"
            :to="getGenreUrl(genre, 'movie')"
            class="genre-navigation__item">
            <div class="genre-navigation__item-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span class="genre-navigation__item-name">{{ genre.name }}</span>
          </nuxt-link>
        </div>
      </div>

      <!-- All TV Genres -->
      <div class="genre-navigation__section">
        <h3 class="genre-navigation__section-title">TV Show Genres</h3>
        <div class="genre-navigation__grid">
          <nuxt-link
            v-for="genre in tvGenres"
            :key="`tv-${genre.id}`"
            :to="getGenreUrl(genre, 'tv')"
            class="genre-navigation__item">
            <div class="genre-navigation__item-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17,2 12,7 7,2"/>
              </svg>
            </div>
            <span class="genre-navigation__item-name">{{ genre.name }}</span>
          </nuxt-link>
        </div>
      </div>
    </div>

    <!-- View All Genres Button -->
    <div class="genre-navigation__view-all">
      <nuxt-link to="/genres" class="genre-navigation__view-all-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
          <path d="M9 1v6M15 1v6M9 17v6M15 17v6M1 9h6M17 9h6M1 15h6M17 15h6"/>
        </svg>
        Browse All Genres
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'

export default {
  name: 'GenreNavigation',

  data() {
    return {
      selectedGenreType: 'movie'
    }
  },

  computed: {
    ...mapGetters('genres', [
      'getMovieGenres', 
      'getTVGenres', 
      'getPopularGenres', 
      'isLoading'
    ]),

    loading() {
      return this.isLoading
    },

    movieGenres() {
      return this.getMovieGenres
    },

    tvGenres() {
      return this.getTVGenres
    },

    popularGenres() {
      return this.getPopularGenres
    }
  },

  mounted() {
    this.loadGenres()
  },

  methods: {
    ...mapActions('genres', ['fetchGenres']),

    async loadGenres() {
      if (this.movieGenres.length === 0 && this.tvGenres.length === 0) {
        await this.fetchGenres()
      }
    },

    getGenreUrl(genre, type) {
      return {
        name: 'category-genre',
        params: { genre: genre.id },
        query: { type }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.genre-navigation {
  margin-bottom: 4rem;
}

.genre-navigation__header {
  margin-bottom: 3rem;
  text-align: center;
}

.genre-navigation__title {
  margin: 0 0 1rem;
  font-size: 2.8rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.genre-navigation__subtitle {
  margin: 0;
  font-size: 1.6rem;
  color: #b3b3b3;
  line-height: 1.6;
}

.genre-navigation__loading {
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

.genre-navigation__content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.genre-navigation__section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
}

.genre-navigation__section-title {
  margin: 0 0 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}

.genre-navigation__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.genre-navigation__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  outline: none;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    text-decoration: none;
    color: #fff;
  }

  &:active {
    transform: translateY(0);
  }
}

.genre-navigation__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  color: currentColor;
}

.genre-navigation__item-name {
  font-size: 1.4rem;
  font-weight: 500;
}

.genre-navigation__view-all {
  margin-top: 3rem;
  text-align: center;
}

.genre-navigation__view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2.4rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
    text-decoration: none;
    color: #fff;
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .genre-navigation__title {
    font-size: 2.2rem;
  }

  .genre-navigation__subtitle {
    font-size: 1.4rem;
  }

  .genre-navigation__section {
    padding: 1.5rem;
  }

  .genre-navigation__section-title {
    font-size: 1.8rem;
  }

  .genre-navigation__grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .genre-navigation__item {
    padding: 1rem 1.2rem;
  }

  .genre-navigation__item-name {
    font-size: 1.3rem;
  }

  .genre-navigation__selected {
    padding: 1.5rem;
  }

  .genre-navigation__selected-title {
    font-size: 2rem;
  }

  .genre-navigation__content-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .genre-navigation__content-img {
    height: 20rem;
  }

  .genre-navigation__content-info {
    padding: 1rem;
  }

  .genre-navigation__content-title {
    font-size: 1.2rem;
  }
}
</style>
