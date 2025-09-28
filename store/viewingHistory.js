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
      
      commit('SET_HISTORY', data || [])
      return data
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
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const historyItem = {
        user_id: rootState.auth.user.id,
        media_type: viewingData.media_type,
        media_id: viewingData.media_id,
        media_title: viewingData.media_title,
        media_poster_path: viewingData.media_poster_path,
        season_number: viewingData.season_number || null,
        episode_number: viewingData.episode_number || null,
        watch_duration: viewingData.watch_duration || 0,
        total_duration: viewingData.total_duration,
        completed: viewingData.completed || false
      }
      
      const { data, error } = await supabase
        .from('viewing_history')
        .upsert([historyItem], {
          onConflict: 'user_id,media_type,media_id,season_number,episode_number'
        })
        .select()
        .single()
      
      if (error) throw error
      
      commit('ADD_TO_HISTORY', data)
      return data
    } catch (error) {
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
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase
        .from('viewing_history')
        .update({
          watch_duration: progressData.watch_duration,
          total_duration: progressData.total_duration,
          completed: progressData.completed,
          last_watched_at: new Date().toISOString()
        })
        .eq('user_id', rootState.auth.user.id)
        .eq('media_type', progressData.media_type)
        .eq('media_id', progressData.media_id)
        .eq('season_number', progressData.season_number || null)
        .eq('episode_number', progressData.episode_number || null)
        .select()
        .single()
      
      if (error) throw error
      
      commit('UPDATE_WATCH_PROGRESS', progressData)
      return data
    } catch (error) {
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
  continueWatching: (state) => state.history.filter(item => !item.completed && item.watch_duration > 0),
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
  }
}
