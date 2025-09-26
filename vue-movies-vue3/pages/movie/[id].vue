<template>
  <main class="main">
    <TopNav :title="metaTitle" />

    <Hero :item="item" />

    <MediaNav :menu="menu" @clicked="navClicked" />

    <template v-if="activeMenu === 'overview'">
      <MovieInfo :item="item" />

      <Credits v-if="showCredits" :people="item.credits.cast" />
    </template>

    <template v-if="activeMenu === 'watch'">
      <div class="watch-section">
        <VidKingPlayer
          :movie-id="item.id"
          :title="name"
          type="movie"
        />
      </div>
    </template>

    <template v-if="activeMenu === 'videos' && showVideos">
      <Videos :videos="item.videos.results" />
    </template>

    <template v-if="activeMenu === 'photos' && showImages">
      <Images
        v-if="item.images.backdrops.length"
        title="Backdrops"
        type="backdrop"
        :images="item.images.backdrops"
      />

      <Images
        v-if="item.images.posters.length"
        title="Posters"
        type="poster"
        :images="item.images.posters"
      />
    </template>

    <ListingCarousel
      v-if="recommended && recommended.results.length"
      title="More Like This"
      :items="recommended"
    />
  </main>
</template>

<script setup lang="ts">
import { apiImgUrl, getMovie, getMovieRecommended } from '~/api'

// Get route params
const route = useRoute()
const id = route.params.id as string

// Reactive data
const activeMenu = ref('overview')
const recommended = ref(null)

// Fetch movie data
const { data: item } = await useAsyncData(`movie-${id}`, () => getMovie(id))

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Movie not found'
  })
}

// Set page title and meta
const name = computed(() => {
  return item.value?.title || item.value?.name
})

const metaTitle = computed(() => {
  if (item.value?.status === 'Released' && item.value?.release_date) {
    const year = item.value.release_date.split('-')[0]
    return `${name.value} (${year})`
  } else if (item.value?.release_date) {
    const year = item.value.release_date.split('-')[0]
    return `${name.value} (${year})`
  } else {
    return name.value
  }
})

useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: item.value?.overview?.substring(0, 200) || '' },
    { property: 'og:title', content: metaTitle.value },
    { property: 'og:description', content: item.value?.overview?.substring(0, 200) || '' },
    { property: 'og:image', content: item.value?.poster_path ? `${apiImgUrl}/w500${item.value.poster_path}` : '' },
    { property: 'og:url', content: `${process.env.FRONTEND_URL}/movie/${id}` }
  ],
  bodyAttrs: {
    class: 'topnav-active'
  }
})

// Computed properties
const showCredits = computed(() => {
  const credits = item.value?.credits
  return credits && credits.cast && credits.cast.length
})

const showVideos = computed(() => {
  const videos = item.value?.videos
  return videos && videos.results && videos.results.length
})

const showImages = computed(() => {
  const images = item.value?.images
  return images && ((images.backdrops && images.backdrops.length) || (images.posters && images.posters.length))
})

// Menu creation
const menu = computed(() => {
  const menuItems = ['Overview', 'Watch']
  
  if (showVideos.value) menuItems.push('Videos')
  if (showImages.value) menuItems.push('Photos')
  
  return menuItems
})

// Methods
const navClicked = (label: string) => {
  activeMenu.value = label
}

// Initialize recommended shows
const initRecommended = async () => {
  if (recommended.value !== null) return
  
  try {
    const response = await getMovieRecommended(id)
    recommended.value = response
  } catch (error) {
    console.error('Failed to load recommended movies:', error)
  }
}

// Check if we should switch to watch tab
const checkWatchTab = () => {
  if (route.query.tab === 'watch') {
    activeMenu.value = 'watch'
  }
}

// Watch for route changes
watch(() => route.query.tab, () => {
  checkWatchTab()
})

// Initialize on mount
onMounted(() => {
  initRecommended()
  checkWatchTab()
})
</script>

<style scoped>
.main {
  @apply min-h-screen bg-black text-white;
}

.watch-section {
  @apply py-8;
}
</style>
