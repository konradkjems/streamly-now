<template>
  <div class="card">
    <NuxtLink
      class="card__link"
      :to="{ name: `${media}-id`, params: { id: item.id } }"
    >
      <div class="card__img">
        <img
          v-if="poster"
          v-lazy="poster"
          class="lazyload"
          :alt="name"
        >

        <span v-else>
          <!-- eslint-disable-next-line -->
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd" fill="#999"><path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/></svg>
        </span>
      </div>

      <h2 class="card__name">
        {{ name }}
      </h2>

      <div
        v-if="media !== 'person' && (stars || item.vote_average)"
        class="card__rating"
      >
        <div
          v-if="stars"
          class="card__stars"
        >
          <div :style="{ width: `${stars}%` }" />
        </div>

        <div
          v-if="item.vote_average"
          class="card__vote"
        >
          {{ formatRating(item.vote_average) }}
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { apiImgUrl } from '~/api'

interface Props {
  item: {
    id: number
    title?: string
    name?: string
    poster_path?: string
    profile_path?: string
    media_type?: string
    vote_average?: number
  }
}

const props = defineProps<Props>()

const name = computed(() => {
  return props.item.title || props.item.name
})

const stars = computed(() => {
  if (props.item.vote_average) {
    return props.item.vote_average * 10
  }
  return null
})

const poster = computed(() => {
  if (props.item.poster_path) {
    return `${apiImgUrl}/w342${props.item.poster_path}`
  } else if (props.item.profile_path) {
    return `${apiImgUrl}/w342${props.item.profile_path}`
  } else {
    return false
  }
})

const media = computed(() => {
  if (props.item.media_type) {
    return props.item.media_type
  } else if (props.item.name) {
    return 'tv'
  } else {
    return 'movie'
  }
})

const formatRating = (rating: number) => {
  if (rating.toString().length <= 1) {
    return `${rating.toString()}.0`
  }
  return rating.toString()
}
</script>

<style scoped>
.card {
  @apply relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105;
}

.card__link {
  @apply block text-white no-underline;
}

.card__img {
  @apply relative w-full h-80 bg-gray-700 flex items-center justify-center;
}

.card__img img {
  @apply w-full h-full object-cover;
}

.card__name {
  @apply text-lg font-semibold p-4 m-0 truncate;
}

.card__rating {
  @apply flex items-center justify-between p-4 pt-0;
}

.card__stars {
  @apply relative w-16 h-3 bg-gray-600 rounded-full overflow-hidden;
}

.card__stars div {
  @apply absolute top-0 left-0 h-full bg-yellow-400;
}

.card__vote {
  @apply text-sm text-gray-300 font-medium;
}
</style>
