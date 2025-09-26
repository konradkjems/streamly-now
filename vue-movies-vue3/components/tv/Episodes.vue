<template>
  <div class="episodes-container">
    <div class="episodes-header">
      <select
        v-if="seasons.length > 1"
        v-model="activeSeason"
        @change="getEpisodes"
        class="season-selector"
      >
        <option
          v-for="season in seasons"
          :key="`season-${season.season}`"
          :value="season.season"
        >
          Season {{ season.season }}
        </option>
      </select>

      <strong
        v-if="activeEpisodes"
        class="episode-count"
      >
        {{ episodeCount }}
      </strong>
    </div>

    <div
      v-if="activeEpisodes"
      class="episodes-grid"
    >
      <EpisodesItem
        v-for="episode in activeEpisodes"
        :key="`episode-${episode.id}`"
        :episode="episode"
        :tv-show-id="tvShowId"
        :season-number="activeSeason"
        @play-episode="onPlayEpisode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTvShowEpisodes } from '~/api'

interface Props {
  numberOfSeasons: number
  tvShowId: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'play-episode': [episodeData: {
    tvShowId: string | number
    seasonNumber: string | number
    episodeNumber: number
    episodeName: string
  }]
}>()

const activeSeason = ref(props.numberOfSeasons)
const activeEpisodes = ref(null)

const episodeCount = computed(() => {
  if (!activeEpisodes.value) return ''
  const count = activeEpisodes.value.length
  return `${count} ${count > 1 ? 'Episodes' : 'Episode'}`
})

const seasons = computed(() => {
  const seasons = []
  for (let index = 0; index < props.numberOfSeasons; index++) {
    seasons.push({
      season: index + 1,
      episodes: null
    })
  }
  seasons.sort((a, b) => a.season > b.season ? -1 : 1)
  return seasons
})

const getEpisodes = async () => {
  const season = seasons.value.find(season => season.season === activeSeason.value)
  
  if (!season) return

  // if we already have the episodes, just show them
  if (season.episodes) {
    activeEpisodes.value = season.episodes
  } else {
    // get episodes for a certain season
    try {
      const response = await getTvShowEpisodes(props.tvShowId, activeSeason.value)
      season.episodes = response.episodes
      activeEpisodes.value = season.episodes
    } catch (error) {
      console.error('Failed to load episodes:', error)
    }
  }
}

const onPlayEpisode = (episodeData: any) => {
  emit('play-episode', episodeData)
}

// Initialize episodes on mount
onMounted(() => {
  getEpisodes()
})
</script>

<style scoped>
.episodes-container {
  @apply p-4;
}

.episodes-header {
  @apply flex items-center mb-6;
}

@media (min-width: 1024px) {
  .episodes-header {
    @apply mb-8;
  }
}

.season-selector {
  @apply mr-4 px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white;
}

.episode-count {
  @apply text-lg text-gray-400 tracking-wide;
}

@media (min-width: 1024px) {
  .episode-count {
    @apply text-xl;
  }
}

.episodes-grid {
  @apply flex flex-wrap -mx-1;
}
</style>
