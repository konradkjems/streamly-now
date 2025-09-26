<template>
  <main class="main">
    <Hero
      v-if="featured"
      :item="featured"
    />

    <ListingCarousel
      v-if="trendingMovies && trendingMovies.results.length"
      :title="trendingMoviesTitle"
      :view-all-url="trendingMoviesUrl"
      :items="trendingMovies"
    />

    <ListingCarousel
      v-if="trendingTv && trendingTv.results.length"
      :title="trendingTvTitle"
      :view-all-url="trendingTvUrl"
      :items="trendingTv"
    />
  </main>
</template>

<script setup lang="ts">
import { getTrending, getMovie, getTvShow, getListItem } from '~/api'

// Set page title and meta
useHead({
  title: 'Browse Movies, TV Shows and People',
  meta: [
    { name: 'description', content: 'Browse Movies, TV Shows and People' }
  ]
})

// Fetch data
const { data: trendingMovies } = await useAsyncData('trending-movies', () => getTrending('movie'))
const { data: trendingTv } = await useAsyncData('trending-tv', () => getTrending('tv'))

// Get featured item
const featured = ref(null)

if (trendingMovies.value && trendingTv.value) {
  // feature a random item from movies or tv
  const items = [...trendingMovies.value.results, ...trendingTv.value.results]
  const randomItem = items[Math.floor(Math.random() * items.length)]
  const media = randomItem.title ? 'movie' : 'tv'

  if (media === 'movie') {
    featured.value = await getMovie(randomItem.id)
  } else {
    featured.value = await getTvShow(randomItem.id)
  }
}

// Computed properties
const trendingMoviesTitle = computed(() => {
  return getListItem('movie', 'trending').title
})

const trendingMoviesUrl = computed(() => {
  return { name: 'movie-category-name', params: { name: 'trending' } }
})

const trendingTvTitle = computed(() => {
  return getListItem('tv', 'trending').title
})

const trendingTvUrl = computed(() => {
  return { name: 'tv-category-name', params: { name: 'trending' } }
})
</script>

<style scoped>
.main {
  @apply min-h-screen bg-black text-white;
}
</style>
