import { supabase } from '~/plugins/supabase'

export const state = () => ({
  history: [],
  loading: false,
  error: null
})

export const mutations = {
  SET_HISTORY(state, history) {
    state.history = history
  },
  ADD_TO_HISTORY(state, item) {
    const existingIndex = state.history.findIndex(h => 
      h.media_type === item.media_type && 
      h.media_id === item.media_id &&
      h.season_number === item.season_number &&
      h.episode_number === item.episode_number
    )
    
    if (existingIndex >= 0) {
      state.history.splice(existingIndex, 1, item)
    } else {
      state.history.unshift(item)
    }
  },
  UPDATE_WATCH_PROGRESS(state, { media_type, media_id, season_number, episode_number, watch_duration, total_duration, completed }) {
    const item = state.history.find(h => 
      h.media_type === media_type && 
      h.media_id === media_id &&
      h.season_number === season_number &&
      h.episode_number === episode_number
    )
    
    if (item) {
      item.watch_duration = watch_duration
      item.total_duration = total_duration
      item.completed = completed
      item.last_watched_at = new Date().toISOString()
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

// Helper function to deduplicate viewing history records
function deduplicateHistory(historyData) {
  const seen = new Map()
  const deduplicated = []
  
  for (const record of historyData) {
    // Create a unique key based on the database unique constraint
    const key = `${record.user_id}-${record.media_type}-${record.media_id}-${record.season_number || 'null'}-${record.episode_number || 'null'}`
    
    if (!seen.has(key)) {
      seen.set(key, true)
      deduplicated.push(record)
    } else {
      console.log('ViewingHistory - Removing duplicate record:', key, record.id)
    }
  }
  
  return deduplicated
}

export const actions = {
  async fetchHistory({ commit, rootState }) {
    if (!rootState.auth.user) return
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase
        .from('viewing_history')
        .select('*')
        .eq('user_id', rootState.auth.user.id)
        .order('last_watched_at', { ascending: false })
      
      if (error) throw error
      
      // Debug logging
      if (process.client) {
        console.log('ViewingHistory - fetchHistory result:', data)
        console.log('ViewingHistory - data length:', data?.length || 0)
      }
      
      // Deduplicate records based on unique constraints
      const deduplicatedData = deduplicateHistory(data || [])
      console.log('ViewingHistory - Deduplicated data length:', deduplicatedData.length)
      
      commit('SET_HISTORY', deduplicatedData)
      return deduplicatedData
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async recordViewing({ commit, rootState }, viewingData) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to record viewing')
    }
    
    console.log('ViewingHistory - recordViewing called with:', viewingData)
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // Prepare the data for database operations
      const seasonNum = (viewingData.season_number === null || viewingData.season_number === undefined || viewingData.season_number === 'null') ? null : viewingData.season_number
      const episodeNum = (viewingData.episode_number === null || viewingData.episode_number === undefined || viewingData.episode_number === 'null') ? null : viewingData.episode_number
      
      // Convert decimal values to integers for database storage
      const watchDuration = Math.floor(viewingData.watch_duration || 0)
      const totalDuration = viewingData.total_duration ? Math.floor(viewingData.total_duration) : null
      
      console.log('ViewingHistory - recordViewing final values:')
      console.log('  seasonNum:', seasonNum, 'type:', typeof seasonNum)
      console.log('  episodeNum:', episodeNum, 'type:', typeof episodeNum)
      console.log('  watchDuration:', watchDuration, 'type:', typeof watchDuration, '(converted from:', viewingData.watch_duration, ')')
      console.log('  totalDuration:', totalDuration, 'type:', typeof totalDuration, '(converted from:', viewingData.total_duration, ')')
      
      const historyItem = {
        user_id: rootState.auth.user.id,
        media_type: viewingData.media_type,
        media_id: viewingData.media_id,
        media_title: viewingData.media_title,
        media_poster_path: viewingData.media_poster_path,
        season_number: seasonNum,
        episode_number: episodeNum,
        watch_duration: watchDuration,
        total_duration: totalDuration,
        completed: viewingData.completed || false
      }
      
      console.log('ViewingHistory - Inserting history item:', historyItem)
      
      const { data, error } = await supabase
        .from('viewing_history')
        .upsert([historyItem], {
          onConflict: 'user_id,media_type,media_id,season_number,episode_number'
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log('ViewingHistory - recordViewing success:', data)
      commit('ADD_TO_HISTORY', data)
      return data
    } catch (error) {
      console.error('ViewingHistory - recordViewing error:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateWatchProgress({ commit, rootState }, progressData) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to update watch progress')
    }
    
    console.log('ViewingHistory - updateWatchProgress called with:', progressData)
    console.log('ViewingHistory - season_number type:', typeof progressData.season_number, 'value:', progressData.season_number)
    console.log('ViewingHistory - episode_number type:', typeof progressData.episode_number, 'value:', progressData.episode_number)
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // Prepare the data for database operations
      const seasonNum = (progressData.season_number === null || progressData.season_number === undefined || progressData.season_number === 'null') ? null : progressData.season_number
      const episodeNum = (progressData.episode_number === null || progressData.episode_number === undefined || progressData.episode_number === 'null') ? null : progressData.episode_number
      
      // Convert decimal values to integers for database storage
      const watchDuration = Math.floor(progressData.watch_duration || 0)
      const totalDuration = progressData.total_duration ? Math.floor(progressData.total_duration) : null
      
      console.log('ViewingHistory - Final values being sent to database:')
      console.log('  seasonNum:', seasonNum, 'type:', typeof seasonNum)
      console.log('  episodeNum:', episodeNum, 'type:', typeof episodeNum)
      console.log('  watchDuration:', watchDuration, 'type:', typeof watchDuration, '(converted from:', progressData.watch_duration, ')')
      console.log('  totalDuration:', totalDuration, 'type:', typeof totalDuration, '(converted from:', progressData.total_duration, ')')
      
      // First, try to find existing record
      let { data: existingRecords, error: findError } = await supabase
        .from('viewing_history')
        .select('*')
        .eq('user_id', rootState.auth.user.id)
        .eq('media_type', progressData.media_type)
        .eq('media_id', progressData.media_id)
      
      if (findError) {
        console.error('ViewingHistory - Error finding existing records:', findError)
        throw findError
      }
      
      console.log('ViewingHistory - Found existing records:', existingRecords)
      
      // Find the matching record (handle both null and "null" string cases)
      let existingRecord = null
      if (existingRecords && existingRecords.length > 0) {
        existingRecord = existingRecords.find(record => {
          const recordSeasonNull = record.season_number === null || record.season_number === 'null'
          const recordEpisodeNull = record.episode_number === null || record.episode_number === 'null'
          const targetSeasonNull = seasonNum === null
          const targetEpisodeNull = episodeNum === null
          
          const seasonMatch = (recordSeasonNull && targetSeasonNull) || (record.season_number === seasonNum)
          const episodeMatch = (recordEpisodeNull && targetEpisodeNull) || (record.episode_number === episodeNum)
          
          return seasonMatch && episodeMatch
        })
      }
      
      console.log('ViewingHistory - Matching existing record:', existingRecord)
      
      let data, error
      
      if (existingRecord) {
        // Update existing record
        console.log('ViewingHistory - Updating existing record with ID:', existingRecord.id)
        const { data: updateData, error: updateError } = await supabase
          .from('viewing_history')
          .update({
            watch_duration: watchDuration,
            total_duration: totalDuration,
            completed: progressData.completed,
            last_watched_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select()
          .single()
        
        data = updateData
        error = updateError
      } else {
        // No existing record found, will create new one below
        data = []
        error = null
      }
      
      if (error) {
        console.error('ViewingHistory - updateWatchProgress Supabase error details:', error)
        console.error('ViewingHistory - Error code:', error.code)
        console.error('ViewingHistory - Error message:', error.message)
        console.error('ViewingHistory - Error details:', error.details)
        throw error
      }
      
      // If no rows were updated, create a new record
      if (!data || data.length === 0) {
        console.log('ViewingHistory - No existing record found, creating new one')
        
        console.log('ViewingHistory - Creating new record with:')
        console.log('  season_number:', seasonNum, 'type:', typeof seasonNum)
        console.log('  episode_number:', episodeNum, 'type:', typeof episodeNum)
        
        const { data: newData, error: insertError } = await supabase
          .from('viewing_history')
          .insert({
            user_id: rootState.auth.user.id,
            media_type: progressData.media_type,
            media_id: progressData.media_id,
            media_title: progressData.media_title || 'Unknown',
            media_poster_path: progressData.media_poster_path,
            season_number: seasonNum,
            episode_number: episodeNum,
            watch_duration: watchDuration,
            total_duration: totalDuration,
            completed: progressData.completed,
            last_watched_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('ViewingHistory - insertError details:', insertError)
          console.error('ViewingHistory - Insert error code:', insertError.code)
          console.error('ViewingHistory - Insert error message:', insertError.message)
          throw insertError
        }
        data = newData
      }
      
      console.log('ViewingHistory - updateWatchProgress success:', data)
      commit('UPDATE_WATCH_PROGRESS', progressData)
      return data
    } catch (error) {
      console.error('ViewingHistory - updateWatchProgress error:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeFromHistory({ commit, rootState }, { media_type, media_id, season_number, episode_number }) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to remove from history')
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { error } = await supabase
        .from('viewing_history')
        .delete()
        .eq('user_id', rootState.auth.user.id)
        .eq('media_type', media_type)
        .eq('media_id', media_id)
        .eq('season_number', season_number || null)
        .eq('episode_number', episode_number || null)
      
      if (error) throw error
      
      // Remove from local state
      const index = state.history.findIndex(h => 
        h.media_type === media_type && 
        h.media_id === media_id &&
        h.season_number === season_number &&
        h.episode_number === episode_number
      )
      
      if (index >= 0) {
        state.history.splice(index, 1)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export const getters = {
  getHistory: (state) => state.history,
  viewingHistory: (state) => state.history, // Keep for backward compatibility
  isLoading: (state) => state.loading,
  error: (state) => state.error,
  recentHistory: (state) => state.history.slice(0, 10),
  completedItems: (state) => state.history.filter(item => item.completed),
  continueWatching: (state) => {
    // Show recent viewing history, prioritizing incomplete items
    const incompleteItems = state.history.filter(item => !item.completed && item.watch_duration > 0)
    const recentCompletedItems = state.history.filter(item => item.completed).slice(0, 5) // Show up to 5 recent completed items
    
    // Combine and sort by last_watched_at, most recent first
    const combined = [...incompleteItems, ...recentCompletedItems]
    const sorted = combined.sort((a, b) => new Date(b.last_watched_at) - new Date(a.last_watched_at))
    
    // Deduplicate by media_id, season, and episode
    const deduplicated = []
    const seen = new Set()
    
    for (const item of sorted) {
      const key = `${item.media_id}-${item.season_number || 'null'}-${item.episode_number || 'null'}`
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(item)
      }
    }
    
    // Debug logging
    if (process.client) {
      console.log('ViewingHistory - continueWatching getter:')
      console.log('  Total history:', state.history.length)
      console.log('  Incomplete items:', incompleteItems.length)
      console.log('  Recent completed items:', recentCompletedItems.length)
      console.log('  Combined result:', sorted.length)
      console.log('  Deduplicated result:', deduplicated.length)
    }
    
    return deduplicated
  },
  watchProgress: (state) => ({ media_type, media_id, season_number, episode_number }) => {
    const item = state.history.find(h =>
      h.media_type === media_type &&
      h.media_id === media_id &&
      h.season_number === season_number &&
      h.episode_number === episode_number
    )

    return item ? {
      watch_duration: item.watch_duration,
      total_duration: item.total_duration,
      progress_percentage: item.total_duration > 0 ? (item.watch_duration / item.total_duration) * 100 : 0,
      completed: item.completed
    } : null
  },
  // Returns the most recently watched record for a given media (movie or TV show).
  // For TV, this is the latest episode the user touched - drives the "Resume S3:E5" CTA.
  // For movies, returns the single record (or null if never started).
  lastWatchedForMedia: (state) => ({ media_type, media_id }) => {
    const records = state.history.filter(h =>
      h.media_type === media_type && h.media_id === media_id
    )
    if (!records.length) return null
    return records.slice().sort((a, b) =>
      new Date(b.last_watched_at) - new Date(a.last_watched_at)
    )[0]
  }
}
