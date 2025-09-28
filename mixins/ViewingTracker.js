import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('viewingHistory', ['recordViewing', 'updateWatchProgress']),

    async trackViewingStart(item, seasonNumber = null, episodeNumber = null) {
      if (!this.$store.getters['auth/isAuthenticated']) return

      try {
        await this.recordViewing({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          media_title: item.title || item.name,
          media_poster_path: item.poster_path,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          watch_duration: 0,
          total_duration: item.runtime ? item.runtime * 60 : null, // Convert minutes to seconds
          completed: false
        })
      } catch (error) {
        console.error('Error tracking viewing start:', error)
      }
    },

    async trackViewingProgress(item, watchDuration, seasonNumber = null, episodeNumber = null) {
      if (!this.$store.getters['auth/isAuthenticated']) return

      try {
        const totalDuration = item.runtime ? item.runtime * 60 : null // Convert minutes to seconds
        const completed = totalDuration ? watchDuration >= totalDuration * 0.9 : false // 90% watched = completed

        await this.updateWatchProgress({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          watch_duration: watchDuration,
          total_duration: totalDuration,
          completed: completed
        })
      } catch (error) {
        console.error('Error tracking viewing progress:', error)
      }
    },

    async trackViewingComplete(item, seasonNumber = null, episodeNumber = null) {
      if (!this.$store.getters['auth/isAuthenticated']) return

      try {
        const totalDuration = item.runtime ? item.runtime * 60 : null // Convert minutes to seconds
        
        await this.updateWatchProgress({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          watch_duration: totalDuration,
          total_duration: totalDuration,
          completed: true
        })
      } catch (error) {
        console.error('Error tracking viewing complete:', error)
      }
    }
  }
}
