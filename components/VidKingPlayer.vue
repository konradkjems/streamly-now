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

<script>
export default {
  name: 'VidKingPlayer',
  
  props: {
    movieId: {
      type: [String, Number],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'movie',
      validator: function (value) {
        return ['movie', 'tv'].includes(value);
      },
    },
    season: {
      type: [String, Number],
      default: null,
    },
    episode: {
      type: [String, Number],
      default: null,
    },
  },

  computed: {
    vidkingEmbedUrl: function () {
      var baseUrl = 'https://www.vidking.net/embed/' + this.type + '/' + this.movieId;
      
      // Add season and episode for TV shows
      if (this.type === 'tv' && this.season && this.episode) {
        baseUrl += '/' + this.season + '/' + this.episode;
      }
      
      var params = 'autoplay=true&color=';
      return baseUrl + '?' + params;
    },
  },
};
</script>

<style lang="scss" scoped>
.vidking-player-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  background: #000;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .vidking-player-container {
    padding: 0.5rem;
  }
  
  .video-container {
    border-radius: 4px;
  }
}
</style>