<template>
  <div class="vidking-player-container">
    <!-- Player Selector -->
    <div class="player-selector">
      <div class="player-selector-header">
        <span class="player-icon">🎬</span>
        <label for="player-select">Choose Streaming Provider</label>
      </div>
      <div class="player-select-wrapper">
        <select 
          id="player-select" 
          v-model="selectedPlayer" 
          @change="selectPlayer(selectedPlayer)"
          class="player-select"
        >
          <option 
            v-for="player in players" 
            :key="player.value"
            :value="player.value"
          >
            {{ player.icon }} {{ player.name }} - {{ player.badge }}
          </option>
        </select>
      </div>
    </div>

    <div class="video-container">
      <!-- Loading Overlay -->
      <div v-if="playerLoading && !loadError" class="player-loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <p class="loading-text">Loading {{ selectedPlayerName }}...</p>
          <p class="loading-subtext">{{ connectionStatus }}</p>
        </div>
      </div>

      <!-- Error Overlay -->
      <div v-if="loadError" class="player-error-overlay">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Failed to Load Player</h3>
          <p class="error-message">{{ errorMessage }}</p>
          <div class="error-actions">
            <button @click="retryPlayer" class="btn-retry" :disabled="retryCount >= maxRetries">
              {{ retryCount >= maxRetries ? 'Max Retries Reached' : 'Retry Player' }}
            </button>
            <button @click="tryAlternativePlayer" class="btn-alternative">
              Try Alternative Player
            </button>
          </div>
          <button @click="reportIssue" class="btn-report">Report Issue</button>
        </div>
      </div>

      <iframe
        ref="playerIframe"
        :src="currentEmbedUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allowfullscreen
        :title="'Watch ' + title"
        :sandbox="getSandboxPermissions"
        referrerpolicy="no-referrer"
        loading="lazy"
        @load="onIframeLoad"
        @error="onIframeError"
      />
    </div>
    
    <!-- Debug info (remove in production) -->
    <div v-if="showDebugInfo" class="debug-info">
      <p>Player: {{ selectedPlayer }}</p>
      <p>Watch Duration: {{ Math.floor(currentWatchDuration / 60) }}:{{ String(Math.floor(currentWatchDuration % 60)).padStart(2, '0') }}</p>
      <p>Status: {{ isPlaying ? 'Playing' : 'Paused' }}</p>
      <p>Total Duration: {{ totalDuration ? Math.floor(totalDuration / 60) + ':' + String(Math.floor(totalDuration % 60)).padStart(2, '0') : 'Unknown' }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
      selectedPlayer: 'vidking', // Default to VidKing
      watchStartTime: null,
      currentWatchDuration: 0,
      progressUpdateInterval: null,
      lastProgressUpdate: 0,
      isPlaying: false,
      totalDuration: null,
      hasTrackedStart: false,
      // Loading & Error states
      playerLoading: true,
      loadError: false,
      connectionStatus: 'connecting',
      retryCount: 0,
      maxRetries: 3,
      // Popup blocker properties
      originalWindowOpen: null,
      beforeUnloadHandler: null,
      windowBlurHandler: null,
      postMessageHandler: null,
      clickHandler: null,
      vidfastBlocker: null,
      popupMonitor: null,
      // Player options
      players: [
        { 
          value: 'vidking', 
          name: 'VidKing', 
          icon: '👑', 
          badge: 'Primary', 
          badgeClass: 'badge-primary' 
        },
        { 
          value: 'movies111', 
          name: '111Movies', 
          icon: '🎥', 
          badge: 'Alternative player', 
          badgeClass: 'badge-hd' 
        },
        { 
          value: 'vidfast', 
          name: 'VidFast', 
          icon: '⚡', 
          badge: 'Alternative player', 
          badgeClass: 'badge-fast' 
        }
      ],
    }
  },

  computed: {
    ...mapGetters('auth', ['currentPreferences']),
    
    vidkingEmbedUrl: function () {
      var baseUrl = 'https://www.vidking.net/embed/' + this.type + '/' + this.movieId;
      
      // Add season and episode for TV shows
      if (this.type === 'tv' && this.season && this.episode) {
        baseUrl += '/' + this.season + '/' + this.episode;
      }
      
      // Get user preferences or use defaults
      const preferences = this.currentPreferences || {};
      const autoPlay = preferences.auto_play !== false; // Default to true if not set
      const videoQuality = preferences.video_quality || 'auto';
      const subtitleLanguage = preferences.subtitle_language || 'en';
      
      // Build parameters with user preferences
      var params = [
        'color=e50914',
        `autoPlay=${autoPlay}`,
        'nextEpisode=true',
        'episodeSelector=true'
      ];
      
      // Add video quality if specified
      if (videoQuality !== 'auto') {
        params.push(`quality=${videoQuality}`);
      }
      
      // Add subtitle language if not 'off'
      // NOTE: VidKing's actual parameter name may vary. Common alternatives:
      // - subtitle=, subtitleLang=, subs=, cc=, captions=
      // If subtitles still don't show, check browser console for VidKing messages
      // and verify what parameter names VidKing actually accepts
      if (subtitleLanguage && subtitleLanguage !== 'off') {
        params.push(`subtitle=${subtitleLanguage}`);
      }
      
      return baseUrl + '?' + params.join('&');
    },
    
    // 111Movies embed URL
    movies111EmbedUrl: function () {
      if (this.type === 'movie') {
        return `https://111movies.com/movie/${this.movieId}`;
      } else if (this.type === 'tv' && this.season && this.episode) {
        return `https://111movies.com/tv/${this.movieId}/${this.season}/${this.episode}`;
      }
      return '';
    },
    
    // VidFast embed URL
    vidfastEmbedUrl: function () {
      if (this.type === 'movie') {
        return `https://vidfast.pro/movie/${this.movieId}`;
      } else if (this.type === 'tv' && this.season && this.episode) {
        return `https://vidfast.pro/tv/${this.movieId}/${this.season}/${this.episode}=`;
      }
      return '';
    },
    
    // Current embed URL based on selected player
    currentEmbedUrl: function () {
      switch (this.selectedPlayer) {
        case 'movies111':
          return this.movies111EmbedUrl;
        case 'vidfast':
          return this.vidfastEmbedUrl;
        case 'vidking':
        default:
          return this.vidkingEmbedUrl;
      }
    },
    
    // Conditionally apply sandbox based on selected player
    getSandboxPermissions() {
      // Only apply sandbox restrictions to VidKing
      // Alternative players need more permissions to function
      if (this.selectedPlayer === 'vidking') {
        return 'allow-scripts allow-same-origin allow-presentation allow-forms';
      }
      // Remove sandbox for alternative players to allow them to work
      return undefined;
    },
    
    // Get current player name for display
    selectedPlayerName() {
      const player = this.players.find(p => p.value === this.selectedPlayer)
      return player ? player.name : 'Player'
    },
    
    // Error message based on context
    errorMessage() {
      if (this.retryCount >= this.maxRetries) {
        return 'Maximum retry attempts reached. Please try an alternative player or check your connection.'
      }
      return 'The player failed to load. This might be due to network issues or the content being unavailable.'
    },
  },

  mounted() {
    console.log('VidKingPlayer mounted for:', this.title)
    this.setupPostMessageListener()
    this.setupProgressTracking()
    this.setupPopupBlocker()
  },

  beforeDestroy() {
    this.cleanupProgressTracking()
    this.cleanupPopupBlocker()
    window.removeEventListener('message', this.handlePostMessage)
  },

  methods: {
    selectPlayer(playerValue) {
      this.selectedPlayer = playerValue
      console.log('Player changed to:', this.selectedPlayer)
      // Reset tracking when switching players
      this.hasTrackedStart = false
      this.isPlaying = false
      this.watchStartTime = null
      this.currentWatchDuration = 0
      this.totalDuration = null
      // Reset loading states
      this.playerLoading = true
      this.loadError = false
      this.connectionStatus = 'connecting'
      this.retryCount = 0
    },
    
    setupPostMessageListener() {
      // Listen for messages from all player iframes
      window.addEventListener('message', this.handlePostMessage)
      console.log('Player postMessage listener setup')
    },

    handlePostMessage(event) {
      // Accept messages from all supported player domains
      const allowedOrigins = [
        'vidking.net',
        '111movies.com',
        'vidfast.pro'
      ]
      
      const isAllowedOrigin = allowedOrigins.some(origin => event.origin.includes(origin))
      if (!isAllowedOrigin) {
        return
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        
        console.log('Player message received from', event.origin, ':', data)
        
        // Handle player message formats
        if (data.type === 'PLAYER_EVENT') {
          this.handlePlayerEvent(data)
        } else if (data.type === 'MEDIA_DATA') {
          this.handleMediaData(data)
        } else {
          console.log('Unknown player message type:', data.type)
        }
      } catch (error) {
        // Handle non-JSON messages or other errors
        console.log('Player non-JSON message:', event.data)
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
      
      // Check for subtitle availability
      if (data.data && data.data.subtitles) {
        console.log('Available subtitle tracks:', data.data.subtitles)
        const preferences = this.currentPreferences || {}
        const subtitleLanguage = preferences.subtitle_language || 'en'
        
        if (subtitleLanguage && subtitleLanguage !== 'off') {
          const hasPreferredLanguage = data.data.subtitles.some(
            sub => sub.language === subtitleLanguage || sub.lang === subtitleLanguage
          )
          
          if (!hasPreferredLanguage) {
            console.warn(`⚠️ Subtitle language '${subtitleLanguage}' not available for this video. Available languages:`, 
              data.data.subtitles.map(s => s.language || s.lang))
          } else {
            console.log(`✅ Subtitle language '${subtitleLanguage}' is available`)
          }
        }
      }
      
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

    setupPopupBlocker() {
      // Store original window.open
      this.originalWindowOpen = window.open
      
      // AGGRESSIVE POPUP BLOCKING - Block ALL popup attempts
      window.open = (url, target, features) => {
        console.log('🚫 AGGRESSIVE BLOCK - Popup attempt:', url)
        // Return a fake window object to prevent errors
        return {
          close: () => {},
          focus: () => {},
          blur: () => {},
          closed: true,
          opener: null
        }
      }
      
      // Block all possible popup methods
      window.showModalDialog = () => {
        console.log('🚫 BLOCKED - showModalDialog')
        return null
      }
      
      window.showModelessDialog = () => {
        console.log('🚫 BLOCKED - showModelessDialog')
        return null
      }
      
      // Block document.open attempts
      const originalDocumentOpen = document.open
      document.open = () => {
        console.log('🚫 BLOCKED - document.open')
        return originalDocumentOpen.call(document)
      }
      
      // Additional VidFast-specific protection
      this.vidfastBlocker = () => {
        // Block VidFast-specific popup attempts
        if (this.selectedPlayer === 'vidfast') {
          console.log('🛡️ Enhanced VidFast protection activated')
          // Override any VidFast-specific popup methods
          const iframe = this.$refs.playerIframe
          if (iframe && iframe.contentWindow) {
            try {
              // Block common popup methods in VidFast
              iframe.contentWindow.open = () => {
                console.log('🚫 BLOCKED - VidFast iframe popup')
                return null
              }
              iframe.contentWindow.showModalDialog = () => null
              iframe.contentWindow.showModelessDialog = () => null
            } catch (e) {
              // Cross-origin restrictions - this is expected
              console.log('Cross-origin VidFast protection applied')
            }
          }
        }
      }
      
      // Run VidFast blocker when iframe loads
      this.$watch('selectedPlayer', this.vidfastBlocker)
      
      // AGGRESSIVE beforeunload blocking
      this.beforeUnloadHandler = (e) => {
        console.log('🚫 AGGRESSIVE BLOCK - beforeunload event')
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
      window.addEventListener('beforeunload', this.beforeUnloadHandler)
      
      // AGGRESSIVE window monitoring
      this.windowBlurHandler = () => {
        console.log('🚫 AGGRESSIVE BLOCK - window blur detected')
        // Immediately close any popup windows
        try {
          if (window.opener) {
            window.opener.close()
            window.opener = null
          }
        } catch (e) {
          console.log('Blocked popup window')
        }
      }
      window.addEventListener('blur', this.windowBlurHandler)
      
      // AGGRESSIVE postMessage blocking
      this.postMessageHandler = (event) => {
        // Block ALL postMessage events that might trigger popups
        if (event.data && typeof event.data === 'object') {
          const suspiciousCommands = ['openWindow', 'open', 'popup', 'redirect', 'navigate', 'window']
          if (suspiciousCommands.some(cmd => 
            event.data.type === cmd || 
            event.data.action === cmd ||
            event.data.command === cmd ||
            JSON.stringify(event.data).toLowerCase().includes(cmd)
          )) {
            console.log('🚫 AGGRESSIVE BLOCK - Suspicious postMessage:', event.data)
            event.stopPropagation()
            event.preventDefault()
            return false
          }
        }
      }
      window.addEventListener('message', this.postMessageHandler, true)
      
      // Additional click-based popup blocking
      this.clickHandler = (e) => {
        // Block clicks that might trigger popups
        if (e.target.tagName === 'IFRAME' || e.target.closest('iframe')) {
          console.log('🚫 AGGRESSIVE BLOCK - iframe click intercepted')
          e.stopPropagation()
        }
      }
      document.addEventListener('click', this.clickHandler, true)
      
      console.log('✅ AGGRESSIVE Popup blocker activated')
      
      // Continuous popup monitoring
      this.popupMonitor = setInterval(() => {
        // Check for any popup windows and close them
        try {
          if (window.opener && window.opener !== window.self) {
            console.log('🚫 MONITOR - Closing detected popup')
            window.opener.close()
            window.opener = null
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      }, 100) // Check every 100ms
    },

    cleanupPopupBlocker() {
      // Restore original window.open
      if (this.originalWindowOpen) {
        window.open = this.originalWindowOpen
      }
      
      // Restore original methods
      delete window.showModalDialog
      delete window.showModelessDialog
      
      // Remove VidFast watcher
      if (this.vidfastBlocker) {
        this.$unwatch('selectedPlayer', this.vidfastBlocker)
      }
      
      // Remove event listeners
      if (this.beforeUnloadHandler) {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler)
      }
      
      if (this.windowBlurHandler) {
        window.removeEventListener('blur', this.windowBlurHandler)
      }
      
      if (this.postMessageHandler) {
        window.removeEventListener('message', this.postMessageHandler, true)
      }
      
      if (this.clickHandler) {
        document.removeEventListener('click', this.clickHandler, true)
      }
      
      // Clear popup monitor
      if (this.popupMonitor) {
        clearInterval(this.popupMonitor)
      }
      
      console.log('🚫 AGGRESSIVE Popup blocker deactivated')
    },

    onIframeLoad() {
      console.log('Player iframe loaded for:', this.selectedPlayer)
      
      // Update loading state
      this.playerLoading = false
      this.loadError = false
      this.connectionStatus = 'connected'
      this.retryCount = 0
      
      // VidFast-specific ad blocking
      if (this.selectedPlayer === 'vidfast') {
        console.log('🛡️ Applying VidFast ad blocking')
        // Additional VidFast protection
        setTimeout(() => {
          this.vidfastBlocker()
        }, 1000)
      }
      
      // Try to establish communication with the iframe
      this.sendMessageToIframe({ type: 'request_duration' })
      
      // Also try to set subtitle preferences via postMessage
      // Some players might not support URL parameters for subtitles
      const preferences = this.currentPreferences || {}
      const subtitleLanguage = preferences.subtitle_language || 'en'
      
      if (subtitleLanguage && subtitleLanguage !== 'off') {
        console.log('Attempting to enable subtitles via postMessage:', subtitleLanguage)
        this.sendMessageToIframe({ 
          type: 'set_subtitle', 
          language: subtitleLanguage 
        })
        // Also try alternative parameter names
        this.sendMessageToIframe({ 
          type: 'enable_subtitles', 
          lang: subtitleLanguage 
        })
      }
    },
    
    onIframeError() {
      console.error('Player iframe error for:', this.selectedPlayer)
      this.playerLoading = false
      this.loadError = true
      this.connectionStatus = 'error'
    },
    
    retryPlayer() {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        this.playerLoading = true
        this.loadError = false
        this.connectionStatus = 'retrying'
        
        // Force reload the iframe
        const iframe = this.$refs.playerIframe
        if (iframe) {
          iframe.src = iframe.src
        }
      }
    },
    
    tryAlternativePlayer() {
      // Find next available player
      const currentIndex = this.players.findIndex(p => p.value === this.selectedPlayer)
      const nextIndex = (currentIndex + 1) % this.players.length
      const alternativePlayer = this.players[nextIndex]
      
      console.log('Switching to alternative player:', alternativePlayer.name)
      this.selectPlayer(alternativePlayer.value)
    },
    
    reportIssue() {
      // Open issue report (could be a modal or external link)
      const issueData = {
        player: this.selectedPlayer,
        movieId: this.movieId,
        type: this.type,
        season: this.season,
        episode: this.episode,
        error: this.errorMessage,
        timestamp: new Date().toISOString()
      }
      
      console.log('Reporting issue:', issueData)
      // TODO: Implement actual issue reporting mechanism
      alert('Issue reported. Thank you for your feedback!')
    },

    sendMessageToIframe(message) {
      if (this.$refs.playerIframe && this.$refs.playerIframe.contentWindow) {
        this.$refs.playerIframe.contentWindow.postMessage(message, '*')
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

.player-selector {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(14, 14, 14, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  
  .player-selector-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .player-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    label {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.5px;
      cursor: pointer;
    }
  }
  
  .player-select-wrapper {
    position: relative;
  }
  
  .player-select {
    width: 100%;
    padding: 0.875rem 1rem;
    padding-right: 3rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    &:focus {
      outline: none;
      border-color: #e50914;
      background-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 20px rgba(229, 9, 20, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    option {
      background: #1a1a1a;
      color: #fff;
      padding: 0.5rem;
      font-size: 0.95rem;
    }
  }
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

/* Loading Overlay */
.player-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #fff;
}

.loading-subtext {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-transform: capitalize;
}

/* Error Overlay */
.player-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  color: #fff;
  max-width: 500px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #e50914;
}

.error-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-retry,
.btn-alternative {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-retry {
  background: #e50914;
  color: #fff;
  
  &:hover:not(:disabled) {
    background: #b8070f;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-alternative {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
}

.btn-report {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.5);
  }
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
  
  .player-selector {
    padding: 1rem;
    
    .player-selector-header {
      label {
        font-size: 1rem;
      }
    }
    
    .player-select {
      font-size: 0.95rem;
      padding: 0.75rem 0.875rem;
      padding-right: 2.5rem;
    }
  }
  
  .error-content {
    padding: 1rem;
  }
  
  .error-icon {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: 1.25rem;
  }
  
  .error-message {
    font-size: 0.9rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-retry,
  .btn-alternative {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .player-selector {
    padding: 0.75rem;
    
    .player-selector-header {
      .player-icon {
        font-size: 1.25rem;
      }
      
      label {
        font-size: 0.9rem;
      }
    }
    
    .player-select {
      font-size: 0.875rem;
      padding: 0.625rem 0.75rem;
      padding-right: 2.25rem;
    }
  }
}
</style>