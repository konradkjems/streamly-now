<template>
  <div class="vidking-player-container">
    <div class="video-container">
      <iframe
        :src="vidkingEmbedUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allowfullscreen
        :title="'Watch ' + title"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        referrerpolicy="no-referrer"
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  movieId: string | number
  title: string
  type?: 'movie' | 'tv'
  season?: string | number | null
  episode?: string | number | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'movie'
})

const vidkingEmbedUrl = computed(() => {
  let baseUrl = `https://www.vidking.net/embed/${props.type}/${props.movieId}`
  
  // Add season and episode for TV shows
  if (props.type === 'tv' && props.season && props.episode) {
    baseUrl += `/${props.season}/${props.episode}`
  }
  
  const params = new URLSearchParams({
    autoplay: 'true',
    color: ''
  })
  return `${baseUrl}?${params.toString()}`
})
</script>

<style scoped>
.vidking-player-container {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  background-color: #000;
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-container iframe {
  border: none;
  border-radius: 8px;
}
</style>
