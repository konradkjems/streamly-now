<template>
  <div>
    <div class="hero">
      <div class="backdrop">
        <div>
          <button
            v-if="trailer"
            class="play-button"
            type="button"
            aria-label="Play Trailer"
            @click="openModal"
          >
            <!-- eslint-disable-next-line -->
            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55"><circle cx="27.5" cy="27.5" r="26.75" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.97 40.81L40.64 27.5 20.97 14.19v26.62z"/></svg>
          </button>

          <img
            v-if="backdrop"
            v-lazy="backdrop"
            class="lazyload hero-image"
            :alt="name"
          >
        </div>
      </div>

      <div class="pane">
        <transition
          appear
          name="hero"
        >
          <div>
            <h1 class="hero-name">
              <template v-if="isSingle">
                {{ name }}
              </template>

              <template v-else>
                <NuxtLink :to="{ name: `${type}-id`, params: { id: item.id } }">
                  {{ name }}
                </NuxtLink>
              </template>
            </h1>

            <div class="hero-meta">
              <div
                v-if="stars || item.vote_count"
                class="rating"
              >
                <div
                  v-if="stars"
                  class="stars"
                >
                  <div :style="{ width: `${stars}%` }" />
                </div>

                <div v-if="item.vote_count > 0">
                  {{ formatNumber(item.vote_count) }} Reviews
                </div>
              </div>

              <div class="info">
                <span v-if="item.number_of_seasons">Season {{ item.number_of_seasons }}</span>
                <span v-if="yearStart">{{ yearStart }}</span>
                <span v-if="item.runtime">{{ formatRuntime(item.runtime) }}</span>
                <span v-if="cert">Cert. {{ cert }}</span>
              </div>
            </div>

            <div class="hero-desc">
              {{ truncateText(item.overview, 200) }}
            </div>

            <div class="hero-buttons">
              <button
                class="button button--primary watch-now-button"
                type="button"
                @click="watchNow"
              >
                <!-- eslint-disable-next-line -->
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>
                <span class="txt">Watch Now</span>
              </button>

              <button
                v-if="trailer"
                class="button button--icon trailer-button"
                type="button"
                @click="openModal"
              >
                <!-- eslint-disable-next-line -->
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M3 22v-20l18 10-18 10z"/></svg></span>
                <span class="txt">Watch Trailer</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <Modal
      v-if="modalVisible"
      :data="trailer"
      type="iframe"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    id: number
    title?: string
    name?: string
    vote_count?: number
    number_of_seasons?: number
    runtime?: number
    overview: string
    backdrop_path?: string
    poster_path?: string
    release_date?: string
    first_air_date?: string
    last_air_date?: string
    status?: string
    videos?: {
      results: Array<{
        type: string
        name: string
        key: string
      }>
    }
  }
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

const isSingle = computed(() => props.item.id === Number(route.params.id))
const modalVisible = ref(false)

const type = computed(() => {
  return props.item.title ? 'movie' : 'tv'
})

const name = computed(() => {
  return props.item.title || props.item.name
})

const stars = computed(() => {
  // This would need to be calculated based on vote_average
  // For now, returning null as we don't have the vote_average in the interface
  return null
})

const yearStart = computed(() => {
  const date = props.item.release_date || props.item.first_air_date
  if (date) {
    return date.split('-')[0]
  }
  return null
})

const cert = computed(() => {
  // This would need to be calculated based on release_dates or content_ratings
  // For now, returning null
  return null
})

const backdrop = computed(() => {
  if (props.item.backdrop_path) {
    return `https://image.tmdb.org/t/p/original${props.item.backdrop_path}`
  }
  return null
})

const trailer = computed(() => {
  const videos = props.item.videos?.results
  if (!videos || !videos.length) return null

  const trailerVideo = videos.find(video => video.type === 'Trailer')
  if (!trailerVideo) return null

  return [{
    name: trailerVideo.name,
    src: `https://www.youtube.com/embed/${trailerVideo.key}?rel=0&showinfo=0&autoplay=1`
  }]
})

const openModal = () => {
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
}

const watchNow = () => {
  // Navigate to the detail page and switch to watch tab
  router.push({
    name: `${type.value}-id`,
    params: { id: props.item.id },
    query: { tab: 'watch' }
  })
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
</script>

<style scoped>
.hero {
  @apply flex flex-col justify-between h-[35rem] text-gray-400 bg-black;
}

@media (min-width: 640px) {
  .hero {
    @apply h-[50rem];
  }
}

@media (min-width: 768px) {
  .hero {
    @apply relative block h-0 pb-[40%];
  }
}

.backdrop {
  @apply relative flex flex-1 min-h-0;
}

@media (min-width: 768px) {
  .backdrop {
    @apply absolute top-0 right-0 block w-[71.1%] h-full;
  }
}

.backdrop::after {
  @apply absolute top-0 right-0 bottom-0 left-0 block content-[''] bg-gradient-to-t from-black via-black/10 to-black/10;
}

@media (min-width: 768px) {
  .backdrop::after {
    @apply bg-gradient-to-r from-black via-transparent to-transparent;
  }
}

.backdrop > div {
  @apply w-full;
}

@media (min-width: 768px) {
  .backdrop > div {
    @apply inline;
  }
}

.play-button {
  @apply absolute top-1/2 left-1/2 z-10 p-0 m-0 bg-transparent transform -translate-x-1/2 -translate-y-1/2;
}

@media (min-width: 768px) {
  .play-button {
    @apply hidden;
  }
}

.hero-image {
  @apply inline-block max-w-none h-full;
}

@media (max-width: 767px) {
  .hero-image {
    @apply w-full object-cover;
  }
}

.pane {
  @apply p-6 pb-6;
}

@media (min-width: 640px) {
  .pane {
    @apply p-16 pb-16;
  }
}

@media (min-width: 768px) {
  .pane {
    @apply absolute top-0 bottom-0 left-0 z-10 flex items-center w-[55%] h-full p-20;
  }
}

@media (min-width: 1024px) {
  .pane {
    @apply pr-20 pl-20;
  }
}

@media (min-width: 1280px) {
  .pane {
    @apply w-[43%];
  }
}

.hero-name {
  @apply m-0 mb-6 text-4xl leading-tight text-white tracking-wide;
}

@media (min-width: 640px) {
  .hero-name {
    @apply mb-7;
  }
}

@media (min-width: 1024px) {
  .hero-name {
    @apply text-[2.4vw];
  }
}

.hero-meta {
  @apply text-sm;
}

@media (min-width: 640px) {
  .hero-meta {
    @apply flex;
  }
}

@media (min-width: 1650px) {
  .hero-meta {
    @apply text-[0.9vw];
  }
}

.rating {
  @apply flex items-center mb-5;
}

@media (min-width: 640px) {
  .rating {
    @apply m-0 mr-5 mb-0;
  }
}

.stars {
  @apply w-20 h-4 mr-4 bg-[url('~assets/images/stars.png')] bg-no-repeat bg-auto;
}

@media (min-width: 640px) {
  .stars {
    @apply w-24 h-4;
  }
}

.stars > div {
  @apply h-full bg-[url('~assets/images/stars-filled.png')] bg-no-repeat bg-auto;
}

.info {
  @apply flex items-center;
}

.info span {
  @apply mr-4;
}

.hero-desc {
  @apply block mt-10 text-base text-white;
}

@media (max-width: 639px) {
  .hero-desc {
    @apply hidden;
  }
}

@media (min-width: 1650px) {
  .hero-desc {
    @apply text-[0.9vw];
  }
}

.hero-buttons {
  @apply flex gap-6 mt-12;
}

@media (max-width: 767px) {
  .hero-buttons {
    @apply hidden;
  }
}

@media (min-width: 1650px) {
  .hero-buttons {
    @apply text-[0.9vw];
  }
}

.watch-now-button {
  @apply bg-gradient-to-br from-blue-500 to-blue-700 border-0 shadow-[0_4px_15px_rgba(33,150,243,0.4)] font-semibold uppercase tracking-wider transition-all duration-300;
}

.watch-now-button:hover {
  @apply bg-gradient-to-br from-blue-700 to-blue-800 shadow-[0_6px_20px_rgba(33,150,243,0.6)] transform -translate-y-0.5;
}

.watch-now-button:active {
  @apply transform translate-y-0;
}

.watch-now-button .icon {
  @apply mr-3;
}

.trailer-button {
  @apply bg-white/10 border border-white/30 backdrop-blur-sm transition-all duration-300;
}

.trailer-button:hover {
  @apply bg-white/20 border-white/50;
}

/* Hero transition animations */
.hero-enter-active,
.hero-leave-active {
  transition: transform 0.75s cubic-bezier(0.4, 0.25, 0.3, 1), opacity 0.3s cubic-bezier(0.4, 0.25, 0.3, 1);
}

.hero-enter,
.hero-leave-to {
  opacity: 0;
  transform: translate3d(0, 2rem, 0);
}

.hero-enter-to,
.hero-leave {
  opacity: 1;
  transform: translateZ(0);
}
</style>
