import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('viewingHistory', ['recordViewing', 'updateWatchProgress']),

    async trackViewingStart(item, seasonNumber = null, episodeNumber = null) {
      if (!this.$store.getters['auth/isAuthenticated']) return

      try {
        // Ensure proper null handling for season/episode numbers
        const seasonNum = (seasonNumber === null || seasonNumber === undefined || seasonNumber === 'null') ? null : seasonNumber
        const episodeNum = (episodeNumber === null || episodeNumber === undefined || episodeNumber === 'null') ? null : episodeNumber
        
        await this.recordViewing({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          media_title: item.title || item.name,
          media_poster_path: item.poster_path,
          season_number: seasonNum,
          episode_number: episodeNum,
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

        console.log('ViewingTracker: Updating watch progress:', {
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          watch_duration: watchDuration,
          total_duration: totalDuration,
          completed: completed
        })
        console.log('ViewingTracker: seasonNumber type:', typeof seasonNumber, 'value:', seasonNumber)
        console.log('ViewingTracker: episodeNumber type:', typeof episodeNumber, 'value:', episodeNumber)

        // Ensure proper null handling for season/episode numbers
        const seasonNum = (seasonNumber === null || seasonNumber === undefined || seasonNumber === 'null') ? null : seasonNumber
        const episodeNum = (episodeNumber === null || episodeNumber === undefined || episodeNumber === 'null') ? null : episodeNumber
        
        console.log('ViewingTracker: Converted seasonNum:', seasonNum, 'episodeNum:', episodeNum)
        
        await this.updateWatchProgress({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          season_number: seasonNum,
          episode_number: episodeNum,
          watch_duration: watchDuration,
          total_duration: totalDuration,
          completed: completed
        })
        
        console.log('ViewingTracker: Progress updated successfully')
      } catch (error) {
        console.error('Error tracking viewing progress:', error)
      }
    },

    async trackViewingComplete(item, seasonNumber = null, episodeNumber = null) {
      if (!this.$store.getters['auth/isAuthenticated']) return

      try {
        const totalDuration = item.runtime ? item.runtime * 60 : null // Convert minutes to seconds
        
        // Ensure proper null handling for season/episode numbers
        const seasonNum = (seasonNumber === null || seasonNumber === undefined || seasonNumber === 'null') ? null : seasonNumber
        const episodeNum = (episodeNumber === null || episodeNumber === undefined || episodeNumber === 'null') ? null : episodeNumber
        
        await this.updateWatchProgress({
          media_type: item.title ? 'movie' : 'tv',
          media_id: item.id,
          season_number: seasonNum,
          episode_number: episodeNum,
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
