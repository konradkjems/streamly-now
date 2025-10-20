<template>
  <main class="main">
    <Hero
      :item="featured" />

    <!-- Continue Watching Section -->
    <ContinueWatching />

    <!-- Because You Watched Section (for authenticated users) -->
    <BecauseYouWatched v-if="isAuthenticated" />

    <!-- New This Week Section -->
    <ListingCarousel
      v-if="newThisWeek && newThisWeek.results.length"
      title="New This Week"
      :items="newThisWeek" />

    <!-- Trending Now Section -->
    <ListingCarousel
      v-if="trendingMovies && trendingMovies.results.length"
      :title="trendingMoviesTitle"
      :view-all-url="trendingMoviesUrl"
      :items="trendingMovies" />

    <ListingCarousel
      v-if="trendingTv && trendingTv.results.length"
      :title="trendingTvTitle"
      :view-all-url="trendingTvUrl"
      :items="trendingTv" />

    <!-- Random Pick Section -->
    <div v-if="randomPick" class="random-pick-section">
      <div class="random-pick-header">
        <h2 class="random-pick-title">Feeling Lucky?</h2>
        <button @click="generateRandomPick" class="random-pick-btn" title="Get Another Random Pick">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Try Another</span>
        </button>
      </div>
      <div class="random-pick-content">
        <nuxt-link 
          :to="randomPickUrl" 
          class="random-pick-card"
          @click="recordRandomPick">
          <div class="random-pick-poster">
            <img 
              v-if="randomPick.poster_path"
              v-lazyload="getPosterUrl(randomPick.poster_path)"
              class="lazyload"
              :alt="randomPick.title || randomPick.name">
          </div>
          <div class="random-pick-info">
            <h3 class="random-pick-name">{{ randomPick.title || randomPick.name }}</h3>
            <p class="random-pick-overview">{{ truncateOverview(randomPick.overview) }}</p>
            <div class="random-pick-meta">
              <span class="random-pick-type">{{ randomPick.title ? 'Movie' : 'TV Show' }}</span>
              <span v-if="randomPick.release_date || randomPick.first_air_date" class="random-pick-year">
                • {{ new Date(randomPick.release_date || randomPick.first_air_date).getFullYear() }}
              </span>
              <span v-if="randomPick.vote_average" class="random-pick-rating">
                • ⭐ {{ randomPick.vote_average.toFixed(1) }}
              </span>
            </div>
          </div>
        </nuxt-link>
      </div>
    </div>

    <!-- Genre Navigation -->
    <GenreNavigation />
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTrending, getMovie, getTvShow, getListItem } from '~/api';
import Hero from '~/components/Hero';
import ListingCarousel from '~/components/ListingCarousel';
import ContinueWatching from '~/components/ContinueWatching';
import BecauseYouWatched from '~/components/BecauseYouWatched';
import GenreNavigation from '~/components/GenreNavigation';

export default {
  components: {
    Hero,
    ListingCarousel,
    ContinueWatching,
    BecauseYouWatched,
    GenreNavigation,
  },

  async mounted() {
    // Check if we have OAuth callback tokens in the URL hash
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Redirect to the proper callback page to handle authentication
      this.$router.replace('/auth/callback')
      return
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated']),

    trendingMoviesTitle () {
      return getListItem('movie', 'trending').title;
    },

    trendingMoviesUrl () {
      return { name: 'movie-category-name', params: { name: 'trending' } };
    },

    trendingTvTitle () {
      return getListItem('tv', 'trending').title;
    },

    trendingTvUrl () {
      return { name: 'tv-category-name', params: { name: 'trending' } };
    },
  },

  data() {
    return {
      randomPick: null,
      allItems: []
    }
  },

  computed: {
    randomPickUrl() {
      if (!this.randomPick) return ''
      const media = this.randomPick.title ? 'movie' : 'tv'
      return { name: `${media}-id`, params: { id: this.randomPick.id } }
    }
  },

  async asyncData ({ error, $axios }) {
    try {
      const trendingMovies = await getTrending('movie');
      const trendingTv = await getTrending('tv');
      let featured;

      // Get "New This Week" - recently released content
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weekAgoStr = oneWeekAgo.toISOString().split('T')[0]

      const [newMovies, newTv] = await Promise.all([
        $axios.get(`https://api.themoviedb.org/3/discover/movie`, {
          params: {
            api_key: process.env.API_KEY,
            'primary_release_date.gte': weekAgoStr,
            sort_by: 'popularity.desc',
            page: 1
          }
        }),
        $axios.get(`https://api.themoviedb.org/3/discover/tv`, {
          params: {
            api_key: process.env.API_KEY,
            'first_air_date.gte': weekAgoStr,
            sort_by: 'popularity.desc',
            page: 1
          }
        })
      ])

      const newThisWeek = {
        results: [...newMovies.data.results, ...newTv.data.results].slice(0, 20)
      }

      // feature a random item from movies or tv
      const items = [...trendingMovies.results, ...trendingTv.results];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const media = randomItem.title ? 'movie' : 'tv';

      if (media === 'movie') {
        featured = await getMovie(randomItem.id);
      } else {
        featured = await getTvShow(randomItem.id);
      }

      return { trendingMovies, trendingTv, featured, newThisWeek };
    } catch {
      error({ statusCode: 504, message: 'Data not available' });
    }
  },

  async mounted() {
    // Generate initial random pick
    await this.generateRandomPick()
  },

  methods: {
    async generateRandomPick() {
      try {
        // Get a mix of popular movies and TV shows
        const [popularMovies, popularTv] = await Promise.all([
          getTrending('movie'),
          getTrending('tv')
        ])

        // Combine all items
        this.allItems = [...popularMovies.results, ...popularTv.results]

        // Pick a random item
        this.randomPick = this.allItems[Math.floor(Math.random() * this.allItems.length)]
      } catch (error) {
        console.error('Error generating random pick:', error)
      }
    },

    recordRandomPick() {
      // Track random pick usage
      console.log('Random pick selected:', this.randomPick)
    },

    getPosterUrl(posterPath) {
      return `https://image.tmdb.org/t/p/w370_and_h556_bestv2${posterPath}`
    },

    truncateOverview(overview) {
      if (!overview) return ''
      return overview.length > 150 ? overview.substring(0, 150) + '...' : overview
    }
  }
};
</script>

<style lang="scss" scoped>
.random-pick-section {
  padding: 2rem 0;
  margin-bottom: 3rem;
}

.random-pick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;

  @media (min-width: 768px) {
    padding: 0 4rem;
  }
}

.random-pick-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
}

.random-pick-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke: #fff;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.random-pick-content {
  padding: 0 1rem;

  @media (min-width: 768px) {
    padding: 0 4rem;
  }
}

.random-pick-card {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
}

.random-pick-poster {
  flex-shrink: 0;
  width: 200px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 768px) {
    width: 150px;
    align-self: center;
  }
}

.random-pick-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.random-pick-name {
  margin: 0 0 1rem;
  font-size: 2rem;
  font-weight: 600;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.random-pick-overview {
  margin: 0 0 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
}

.random-pick-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    font-size: 0.85rem;
  }
}

.random-pick-type {
  font-weight: 600;
  color: #e50914;
}

.random-pick-year,
.random-pick-rating {
  color: rgba(255, 255, 255, 0.6);
}
</style>
