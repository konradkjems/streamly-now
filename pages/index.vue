<template>
  <main class="main">
    <Hero
      :item="featured" />

    <!-- Continue Watching Section -->
    <ContinueWatching />

    <!-- Because You Watched Section (for authenticated users) -->
    <BecauseYouWatched v-if="isAuthenticated" />

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

  async asyncData ({ error }) {
    try {
      const trendingMovies = await getTrending('movie');
      const trendingTv = await getTrending('tv');
      let featured;

      // feature a random item from movies or tv
      const items = [...trendingMovies.results, ...trendingTv.results];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const media = randomItem.title ? 'movie' : 'tv';

      if (media === 'movie') {
        featured = await getMovie(randomItem.id);
      } else {
        featured = await getTvShow(randomItem.id);
      }

      return { trendingMovies, trendingTv, featured };
    } catch {
      error({ statusCode: 504, message: 'Data not available' });
    }
  },
};
</script>
