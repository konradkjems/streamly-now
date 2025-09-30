<template>
  <div class="genres-page">
    <!-- Page Header -->
    <div class="genres-page__header">
      <div class="genres-page__header-content">
        <div class="genres-page__breadcrumb">
          <nuxt-link to="/" class="genres-page__breadcrumb-link">Home</nuxt-link>
          <span class="genres-page__breadcrumb-separator">/</span>
          <span class="genres-page__breadcrumb-current">Genres</span>
        </div>
        
        <h1 class="genres-page__title">Browse by Genre</h1>
        <p class="genres-page__subtitle">Discover movies and TV shows by category</p>
      </div>
    </div>

    <!-- Genres Content -->
    <div class="genres-page__content">
      <!-- Loading State -->
      <div v-if="loading" class="genres-page__loading">
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

      <!-- Genres Grid -->
      <div v-else class="genres-page__grid">
        <!-- Popular Genres Section -->
        <div class="genres-page__section">
          <h2 class="genres-page__section-title">Popular Genres</h2>
          <div class="genres-page__section-grid">
            <nuxt-link
              v-for="genre in popularGenres"
              :key="`popular-${genre.id}`"
              :to="getGenreUrl(genre, 'movie')"
              class="genres-page__genre-card genres-page__genre-card--popular">
              <div class="genres-page__genre-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 class="genres-page__genre-name">{{ genre.name }}</h3>
              <p class="genres-page__genre-description">Explore {{ genre.name.toLowerCase() }} content</p>
            </nuxt-link>
          </div>
        </div>

        <!-- Movie Genres Section -->
        <div class="genres-page__section">
          <h2 class="genres-page__section-title">Movie Genres</h2>
          <div class="genres-page__section-grid">
            <nuxt-link
              v-for="genre in movieGenres"
              :key="`movie-${genre.id}`"
              :to="getGenreUrl(genre, 'movie')"
              class="genres-page__genre-card">
              <div class="genres-page__genre-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 class="genres-page__genre-name">{{ genre.name }}</h3>
              <p class="genres-page__genre-description">Movies</p>
            </nuxt-link>
          </div>
        </div>

        <!-- TV Show Genres Section -->
        <div class="genres-page__section">
          <h2 class="genres-page__section-title">TV Show Genres</h2>
          <div class="genres-page__section-grid">
            <nuxt-link
              v-for="genre in tvGenres"
              :key="`tv-${genre.id}`"
              :to="getGenreUrl(genre, 'tv')"
              class="genres-page__genre-card">
              <div class="genres-page__genre-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                  <polyline points="17,2 12,7 7,2"/>
                </svg>
              </div>
              <h3 class="genres-page__genre-name">{{ genre.name }}</h3>
              <p class="genres-page__genre-description">TV Shows</p>
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GenresPage',

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
  },

  head() {
    return {
      title: 'Browse Genres - Streamly',
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'Browse Genres - Streamly' },
        { hid: 'description', name: 'description', content: 'Discover movies and TV shows by genre. Browse action, comedy, drama, horror, and more.' },
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.genres-page {
  min-height: 100vh;
  background: $base-bg;
  color: #fff;
}

.genres-page__header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  padding: 4rem 2rem 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.genres-page__header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.genres-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.genres-page__breadcrumb-link {
  color: $primary-color;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: lighten($primary-color, 10%);
  }
}

.genres-page__breadcrumb-separator {
  color: #666;
}

.genres-page__breadcrumb-current {
  color: #b3b3b3;
}

.genres-page__title {
  margin: 0 0 1rem;
  font-size: 3.6rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.genres-page__subtitle {
  margin: 0;
  font-size: 1.6rem;
  color: #b3b3b3;
  line-height: 1.6;
}

.genres-page__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.genres-page__loading {
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

.genres-page__grid {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.genres-page__section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
}

.genres-page__section-title {
  margin: 0 0 2rem;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.5px;
}

.genres-page__section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.genres-page__genre-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    text-decoration: none;
    color: inherit;
  }

  &:active {
    transform: translateY(-2px);
  }

  &--popular {
    background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($primary-color, 0.05) 100%);
    border-color: rgba($primary-color, 0.3);

    &:hover {
      background: linear-gradient(135deg, rgba($primary-color, 0.2) 0%, rgba($primary-color, 0.1) 100%);
      border-color: rgba($primary-color, 0.5);
    }
  }
}

.genres-page__genre-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: $primary-color;
  transition: all 0.3s ease;

  .genres-page__genre-card:hover & {
    background: rgba($primary-color, 0.2);
    transform: scale(1.1);
  }
}

.genres-page__genre-name {
  margin: 0 0 0.8rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.genres-page__genre-description {
  margin: 0;
  font-size: 1.3rem;
  color: #b3b3b3;
  line-height: 1.5;
}

// Mobile responsive
@media (max-width: 768px) {
  .genres-page__header {
    padding: 3rem 1.5rem 2rem;
  }

  .genres-page__title {
    font-size: 2.8rem;
  }

  .genres-page__subtitle {
    font-size: 1.4rem;
  }

  .genres-page__content {
    padding: 2rem 1.5rem;
  }

  .genres-page__section {
    padding: 1.5rem;
  }

  .genres-page__section-title {
    font-size: 2rem;
  }

  .genres-page__section-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }

  .genres-page__genre-card {
    padding: 1.5rem 1rem;
  }

  .genres-page__genre-icon {
    width: 5rem;
    height: 5rem;
    margin-bottom: 1rem;
  }

  .genres-page__genre-name {
    font-size: 1.6rem;
  }

  .genres-page__genre-description {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .genres-page__section-grid {
    grid-template-columns: 1fr;
  }
}
</style>
