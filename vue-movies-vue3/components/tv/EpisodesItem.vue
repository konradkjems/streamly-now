<template>
  <div class="episode-item">
    <div class="episode-image" @click="playEpisode">
      <img
        v-if="poster"
        v-lazy="poster"
        class="lazyload"
        :alt="episode.name"
      >

      <span v-else>
        <!-- eslint-disable-next-line -->
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd" fill="#999"><path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/></svg>
      </span>
      
      <div class="play-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>

    <h2 class="episode-name">
      <strong>E{{ formatEpisodeNumber(episode.episode_number) }}</strong> {{ episode.name }}
    </h2>

    <div class="episode-overview">
      {{ truncateText(episode.overview, 300) }}
    </div>

    <div
      v-if="episode.air_date"
      class="episode-aired"
    >
      {{ formatDate(episode.air_date) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiImgUrl } from '~/api'

interface Props {
  episode: {
    id: number
    name: string
    episode_number: number
    still_path?: string
    overview: string
    air_date?: string
  }
  tvShowId: string | number
  seasonNumber: string | number
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

const poster = computed(() => {
  if (props.episode.still_path) {
    return `${apiImgUrl}/w400${props.episode.still_path}`
  } else {
    return null
  }
})

const playEpisode = () => {
  emit('play-episode', {
    tvShowId: props.tvShowId,
    seasonNumber: props.seasonNumber,
    episodeNumber: props.episode.episode_number,
    episodeName: props.episode.name
  })
}

const formatEpisodeNumber = (num: number) => {
  return num.toString().padStart(2, '0')
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.episode-item {
  @apply flex flex-col w-full p-1 mb-8;
}

@media (min-width: 640px) {
  .episode-item {
    @apply w-1/2;
  }
}

@media (min-width: 768px) {
  .episode-item {
    @apply w-1/3;
  }
}

@media (min-width: 1450px) {
  .episode-item {
    @apply w-1/4;
  }
}

@media (min-width: 2000px) {
  .episode-item {
    @apply w-1/5;
  }
}

@media (min-width: 3000px) {
  .episode-item {
    @apply w-1/6;
  }
}

.episode-image {
  @apply relative h-0 pt-[56.25%] mb-6 overflow-hidden bg-gray-700 cursor-pointer;
}

.episode-image img,
.episode-image span {
  @apply absolute top-0 left-0 w-full h-full;
}

.episode-image span {
  @apply flex items-center justify-center;
}

.play-button {
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 rounded-full w-20 h-20 flex items-center justify-center cursor-pointer transition-all duration-300 opacity-0 pointer-events-none;
}

.episode-image:hover .play-button {
  @apply opacity-100 pointer-events-auto;
}

.play-button:hover {
  @apply bg-black bg-opacity-90 scale-110;
}

.episode-name {
  @apply mb-4 text-xl tracking-wide;
}

.episode-name strong {
  @apply text-blue-400;
}

.episode-overview {
  @apply flex-1 mb-4 text-sm text-gray-300;
}

.episode-aired {
  @apply text-xs text-gray-500 tracking-wide;
}

@media (min-width: 1024px) {
  .episode-aired {
    @apply text-sm;
  }
}
</style>
