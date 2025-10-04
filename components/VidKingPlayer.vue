<template>
  <div class="vidking-player-container">
    <div class="video-container">
      <iframe
        ref="vidkingIframe"
        :src="vidkingEmbedUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allowfullscreen
        :title="'Watch ' + title"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        referrerpolicy="no-referrer"
        loading="lazy"
        @load="onIframeLoad"
      />
    </div>
    
    <!-- Debug info (remove in production) -->
    <div v-if="showDebugInfo" class="debug-info">
      <p>Watch Duration: {{ Math.floor(currentWatchDuration / 60) }}:{{ String(Math.floor(currentWatchDuration % 60)).padStart(2, '0') }}</p>
      <p>Status: {{ isPlaying ? 'Playing' : 'Paused' }}</p>
      <p>Total Duration: {{ totalDuration ? Math.floor(totalDuration / 60) + ':' + String(Math.floor(totalDuration % 60)).padStart(2, '0') : 'Unknown' }}</p>
    </div>
  </div>
</template>

<script>
import ViewingTracker from '~/mixins/ViewingTracker'

export default {
  name: 'VidKingPlayer',
  
  mixins: [ViewingTracker],
  
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
    posterPath: {
      type: String,
      default: null,
    },
    showDebugInfo: {
      type: Boolean,
      default: false, // Set to true for debugging
    }
  },

  data() {
    return {
      watchStartTime: null,
      currentWatchDuration: 0,
      progressUpdateInterval: null,
      lastProgressUpdate: 0,
      isPlaying: false,
      totalDuration: null,
      hasTrackedStart: false,
    }
  },

  computed: {
    vidkingEmbedUrl: function () {
      var baseUrl = 'https://www.vidking.net/embed/' + this.type + '/' + this.movieId;
      
      // Add season and episode for TV shows
      if (this.type === 'tv' && this.season && this.episode) {
        baseUrl += '/' + this.season + '/' + this.episode;
      }
      
      // Use the specified parameters
      var params = 'color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true';
      return baseUrl + '?' + params;
    },
  },

  mounted() {
    console.log('VidKingPlayer mounted for:', this.title)
    this.setupPostMessageListener()
    this.setupProgressTracking()
  },

  beforeDestroy() {
    this.cleanupProgressTracking()
    window.removeEventListener('message', this.handlePostMessage)
  },

  methods: {
    setupPostMessageListener() {
      // Listen for messages from the VidKing iframe
      window.addEventListener('message', this.handlePostMessage)
      console.log('VidKing postMessage listener setup')
    },

    handlePostMessage(event) {
      // Only accept messages from VidKing domain
      if (!event.origin.includes('vidking.net')) {
        return
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        
        console.log('VidKing message received:', data)
        
        // Handle VidKing's actual message formats
        if (data.type === 'PLAYER_EVENT') {
          this.handlePlayerEvent(data)
        } else if (data.type === 'MEDIA_DATA') {
          this.handleMediaData(data)
        } else {
          console.log('Unknown VidKing message type:', data.type)
        }
      } catch (error) {
        // Handle non-JSON messages or other errors
        console.log('VidKing non-JSON message:', event.data)
      }
    },

    handlePlayerEvent(data) {
      console.log('Player event:', data.data.event)
      
      switch (data.data.event) {
        case 'play':
          this.onVideoStarted(data)
          break
        case 'pause':
          this.onVideoPaused(data)
          break
        case 'ended':
          this.onVideoEnded(data)
          break
        case 'timeupdate':
          this.onVideoProgress(data)
          break
        default:
          console.log('Unknown player event:', data.data.event)
      }
    },

    handleMediaData(data) {
      console.log('Media data received:', data)
      
      // Store media information
      if (data.data.progress) {
        this.totalDuration = data.data.progress.duration
        this.currentWatchDuration = data.data.progress.watched
        
        // If this is the first time we're getting media data, track viewing start
        if (!this.hasTrackedStart && this.currentWatchDuration > 0) {
          this.trackViewingStart({
            id: this.movieId,
            title: this.type === 'movie' ? this.title : null,
            name: this.type === 'tv' ? this.title : null,
            poster_path: this.posterPath,
            runtime: this.totalDuration ? Math.floor(this.totalDuration / 60) : null
          }, this.getSeasonNumber(), this.getEpisodeNumber())
          this.hasTrackedStart = true
        }
        
        // Update progress if we have watch duration
        if (this.currentWatchDuration > 0) {
          this.updateProgress()
        }
      }
    },

    setupProgressTracking() {
      // Fallback: Track time when iframe is focused/visible
      this.progressUpdateInterval = setInterval(() => {
        if (this.isPlaying && this.watchStartTime) {
          this.currentWatchDuration = Math.floor((Date.now() - this.watchStartTime) / 1000)
          
          // Update progress every 30 seconds
          if (this.currentWatchDuration - this.lastProgressUpdate >= 30) {
            this.updateProgress()
            this.lastProgressUpdate = this.currentWatchDuration
          }
        }
      }, 1000) // Check every second
    },

    cleanupProgressTracking() {
      if (this.progressUpdateInterval) {
        clearInterval(this.progressUpdateInterval)
        this.progressUpdateInterval = null
      }
    },

    onIframeLoad() {
      console.log('VidKing iframe loaded')
      // Try to establish communication with the iframe
      this.sendMessageToIframe({ type: 'request_duration' })
    },

    sendMessageToIframe(message) {
      if (this.$refs.vidkingIframe && this.$refs.vidkingIframe.contentWindow) {
        this.$refs.vidkingIframe.contentWindow.postMessage(message, '*')
      }
    },

    // VidKing Event Handlers
    onVideoStarted(data) {
      console.log('Video started:', data)
      this.isPlaying = true
      this.watchStartTime = Date.now()
      
      if (!this.hasTrackedStart) {
        this.trackViewingStart({
          id: this.movieId,
          title: this.type === 'movie' ? this.title : null,
          name: this.type === 'tv' ? this.title : null,
          poster_path: this.posterPath,
          runtime: this.totalDuration ? Math.floor(this.totalDuration / 60) : null
        }, this.getSeasonNumber(), this.getEpisodeNumber())
        this.hasTrackedStart = true
      }
    },

    onVideoPaused(data) {
      console.log('Video paused:', data)
      this.isPlaying = false
      
      // Extract current time from VidKing data
      if (data.data && data.data.currentTime) {
        this.currentWatchDuration = Math.floor(data.data.currentTime)
        this.updateProgress()
      }
    },

    onVideoResumed(data) {
      console.log('Video resumed:', data)
      this.isPlaying = true
      this.watchStartTime = Date.now() - (this.currentWatchDuration * 1000)
    },

    onVideoEnded(data) {
      console.log('Video ended:', data)
      this.isPlaying = false
      this.currentWatchDuration = this.totalDuration || this.currentWatchDuration
      this.completeViewing()
    },

    onVideoProgress(data) {
      console.log('Video progress:', data)
      
      // Extract current time from VidKing data
      if (data.data && data.data.currentTime) {
        this.currentWatchDuration = Math.floor(data.data.currentTime)
        
        if (this.totalDuration) {
          this.currentWatchDuration = Math.min(this.currentWatchDuration, this.totalDuration)
        }
      }
    },

    updateProgress() {
      if (this.currentWatchDuration > 0) {
        console.log('Updating progress:', this.currentWatchDuration, 'seconds')
        console.log('User authenticated:', this.$store.getters['auth/isAuthenticated'])
        
        if (!this.$store.getters['auth/isAuthenticated']) {
          console.log('User not authenticated, skipping progress update')
          return
        }
        
        this.trackViewingProgress({
          id: this.movieId,
          title: this.type === 'movie' ? this.title : null,
          name: this.type === 'tv' ? this.title : null,
          poster_path: this.posterPath,
          runtime: this.totalDuration ? Math.floor(this.totalDuration / 60) : null
        }, this.currentWatchDuration, this.getSeasonNumber(), this.getEpisodeNumber())
      }
    },

    completeViewing() {
      console.log('Completing viewing:', this.title)
      this.trackViewingComplete({
        id: this.movieId,
        title: this.type === 'movie' ? this.title : null,
        name: this.type === 'tv' ? this.title : null,
        poster_path: this.posterPath,
        runtime: this.totalDuration ? Math.floor(this.totalDuration / 60) : null
      }, this.getSeasonNumber(), this.getEpisodeNumber())
    },

    // Helper methods to properly convert season/episode to integers or null
    getSeasonNumber() {
      console.log('VidKingPlayer: getSeasonNumber called with:', this.season, 'type:', typeof this.season)
      if (!this.season || this.season === 'null' || this.season === null) {
        console.log('VidKingPlayer: getSeasonNumber returning null')
        return null
      }
      const num = parseInt(this.season, 10)
      const result = isNaN(num) ? null : num
      console.log('VidKingPlayer: getSeasonNumber returning:', result)
      return result
    },

    getEpisodeNumber() {
      console.log('VidKingPlayer: getEpisodeNumber called with:', this.episode, 'type:', typeof this.episode)
      if (!this.episode || this.episode === 'null' || this.episode === null) {
        console.log('VidKingPlayer: getEpisodeNumber returning null')
        return null
      }
      const num = parseInt(this.episode, 10)
      const result = isNaN(num) ? null : num
      console.log('VidKingPlayer: getEpisodeNumber returning:', result)
      return result
    },

    // Legacy methods for backward compatibility
    updateViewingProgress(watchDuration) {
      this.currentWatchDuration = watchDuration
      this.updateProgress()
    },

    completeViewing() {
      this.completeViewing()
    }
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

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  color: #fff;
  font-size: 1.2rem;
  
  p {
    margin: 0.5rem 0;
  }
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