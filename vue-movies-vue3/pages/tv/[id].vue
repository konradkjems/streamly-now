<template>
  <main class="main">
    <TopNav :title="metaTitle" />

    <Hero :item="item" />

    <MediaNav :menu="menu" @clicked="navClicked" />

    <template v-if="activeMenu === 'overview'">
      <TvInfo :item="item" />

      <Credits v-if="showCredits" :people="item.credits.cast" />
    </template>

    <template v-if="activeMenu === 'watch'">
      <div class="watch-section">
        <div class="season-episode-selector">
          <div class="selector-group">
            <label for="season-select">Season:</label>
            <select 
              id="season-select"
              v-model="selectedSeason" 
              @change="onSeasonChange"
              class="selector"
            >
              <option 
                v-for="season in availableSeasons" 
                :key="season" 
                :value="season"
              >
                Season {{ season }}
              </option>
            </select>
          </div>
          
          <div class="selector-group">
            <label for="episode-select">Episode:</label>
            <select 
              id="episode-select"
              v-model="selectedEpisode" 
              @change="onEpisodeChange"
              class="selector"
            >
              <option 
                v-for="episode in availableEpisodes" 
                :key="episode" 
                :value="episode"
              >
                Episode {{ episode }}
              </option>
            </select>
          </div>
        </div>
        
        <VidKingPlayer
          :movie-id="item.id"
          :title="name"
          type="tv"
          :season="selectedSeason"
          :episode="selectedEpisode"
        />
      </div>
    </template>

    <template v-if="activeMenu === 'episodes' && showEpisodes">
      <Episodes
        :number-of-seasons="item.number_of_seasons"
        :tv-show-id="item.id"
        @play-episode="onPlayEpisode"
      />
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
import { apiImgUrl, getTvShow, getTvShowRecommended } from '~/api'

// Get route params
const route = useRoute()
const id = route.params.id as string

// Reactive data
const activeMenu = ref('overview')
const selectedSeason = ref(1)
const selectedEpisode = ref(1)
const recommended = ref(null)

// Fetch TV show data
const { data: item } = await useAsyncData(`tv-${id}`, () => getTvShow(id))

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'TV Show not found'
  })
}

// Set page title and meta
const name = computed(() => {
  return item.value?.title || item.value?.name
})

const metaTitle = computed(() => {
  if (item.value?.status === 'Ended' && item.value?.first_air_date && item.value?.last_air_date) {
    const startYear = item.value.first_air_date.split('-')[0]
    const endYear = item.value.last_air_date.split('-')[0]
    return `${name.value} (TV Series ${startYear}-${endYear})`
  } else if (item.value?.first_air_date) {
    const startYear = item.value.first_air_date.split('-')[0]
    return `${name.value} (TV Series ${startYear}-)`
  } else {
    return `${name.value} (TV Series)`
  }
})

useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: item.value?.overview?.substring(0, 200) || '' },
    { property: 'og:title', content: metaTitle.value },
    { property: 'og:description', content: item.value?.overview?.substring(0, 200) || '' },
    { property: 'og:image', content: item.value?.poster_path ? `${apiImgUrl}/w500${item.value.poster_path}` : '' },
    { property: 'og:url', content: `${process.env.FRONTEND_URL}/tv/${id}` }
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

const showEpisodes = computed(() => {
  return item.value?.number_of_seasons
})

const showVideos = computed(() => {
  const videos = item.value?.videos
  return videos && videos.results && videos.results.length
})

const showImages = computed(() => {
  const images = item.value?.images
  return images && ((images.backdrops && images.backdrops.length) || (images.posters && images.posters.length))
})

const availableSeasons = computed(() => {
  const seasons = []
  const totalSeasons = item.value?.number_of_seasons || 1
  for (let i = 1; i <= totalSeasons; i++) {
    seasons.push(i)
  }
  return seasons
})

const availableEpisodes = computed(() => {
  const episodes = []
  // Default to 10 episodes per season if not specified
  const episodesPerSeason = 10
  for (let i = 1; i <= episodesPerSeason; i++) {
    episodes.push(i)
  }
  return episodes
})

// Menu creation
const menu = computed(() => {
  const menuItems = ['Overview', 'Watch']
  
  if (showEpisodes.value) menuItems.push('Episodes')
  if (showVideos.value) menuItems.push('Videos')
  if (showImages.value) menuItems.push('Photos')
  
  return menuItems
})

// Methods
const navClicked = (label: string) => {
  activeMenu.value = label
}

const onSeasonChange = () => {
  // Reset episode to 1 when season changes
  selectedEpisode.value = 1
}

const onEpisodeChange = () => {
  // Episode changed, player will update automatically
}

const onPlayEpisode = (episodeData: any) => {
  // Switch to watch tab and set the selected season/episode
  selectedSeason.value = episodeData.seasonNumber
  selectedEpisode.value = episodeData.episodeNumber
  activeMenu.value = 'watch'
}

// Initialize recommended shows
const initRecommended = async () => {
  if (recommended.value !== null) return
  
  try {
    const response = await getTvShowRecommended(id)
    recommended.value = response
  } catch (error) {
    console.error('Failed to load recommended shows:', error)
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

.season-episode-selector {
  @apply flex gap-8 mb-8 p-4 bg-white bg-opacity-5 rounded-lg items-center flex-wrap;
}

.selector-group {
  @apply flex flex-col gap-2 min-w-[120px];
}

.selector-group label {
  @apply text-sm font-medium text-gray-300 uppercase tracking-wider;
}

.selector {
  @apply px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-base cursor-pointer transition-all duration-300 min-w-[120px];
}

.selector:hover {
  @apply bg-white bg-opacity-15 border-white border-opacity-30;
}

.selector:focus {
  @apply outline-none border-blue-500 shadow-[0_0_0_2px_rgba(33,150,243,0.2)];
}

.selector option {
  @apply bg-gray-800 text-white p-2;
}

/* Responsive design */
@media (max-width: 768px) {
  .season-episode-selector {
    @apply flex-col items-stretch gap-4;
  }
  
  .selector-group {
    @apply min-w-0;
  }
  
  .selector {
    @apply min-w-0 w-full;
  }
}
</style>
