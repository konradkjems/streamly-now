import { supabase } from '~/plugins/supabase'

export const state = () => ({
  items: [],
  loading: false,
  error: null
})

export const mutations = {
  SET_WATCHLIST(state, items) {
    state.items = items
  },
  ADD_TO_WATCHLIST(state, item) {
    state.items.push(item)
  },
  REMOVE_FROM_WATCHLIST(state, mediaId) {
    state.items = state.items.filter(item => 
      !(item.media_type === mediaId.media_type && item.media_id === mediaId.media_id)
    )
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

export const actions = {
  async fetchWatchlist({ commit, rootState }) {
    if (!rootState.auth.user) return
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', rootState.auth.user.id)
        .order('added_at', { ascending: false })
      
      if (error) throw error
      
      commit('SET_WATCHLIST', data || [])
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addToWatchlist({ commit, rootState }, mediaData) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to add to watchlist')
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const watchlistItem = {
        user_id: rootState.auth.user.id,
        media_type: mediaData.media_type,
        media_id: mediaData.media_id,
        media_title: mediaData.media_title,
        media_poster_path: mediaData.media_poster_path,
        media_release_date: mediaData.media_release_date,
        media_overview: mediaData.media_overview
      }
      
      const { data, error } = await supabase
        .from('watchlist')
        .insert([watchlistItem])
        .select()
        .single()
      
      if (error) throw error
      
      commit('ADD_TO_WATCHLIST', data)
      
      // Show notification if available
      if (process.client && this.app && this.app.$notifications) {
        try {
          await this.app.$notifications.showWatchlistNotification(
            mediaData.media_title,
            mediaData.media_type
          )
        } catch (error) {
          console.log('Notification failed:', error)
        }
      }
      
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeFromWatchlist({ commit, rootState }, { media_type, media_id }) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to remove from watchlist')
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', rootState.auth.user.id)
        .eq('media_type', media_type)
        .eq('media_id', media_id)
      
      if (error) throw error
      
      commit('REMOVE_FROM_WATCHLIST', { media_type, media_id })
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async toggleWatchlist({ dispatch, rootGetters }, mediaData) {
    const isInWatchlist = rootGetters['watchlist/isInWatchlist']({
      media_type: mediaData.media_type,
      media_id: mediaData.media_id
    })
    
    if (isInWatchlist) {
      await dispatch('removeFromWatchlist', {
        media_type: mediaData.media_type,
        media_id: mediaData.media_id
      })
    } else {
      await dispatch('addToWatchlist', mediaData)
    }
  }
}

export const getters = {
  getWatchlist: (state) => state.items,
  watchlistItems: (state) => state.items, // Keep for backward compatibility
  isLoading: (state) => state.loading,
  error: (state) => state.error,
  isInWatchlist: (state) => ({ media_type, media_id }) => {
    return state.items.some(item => 
      item.media_type === media_type && item.media_id === media_id
    )
  },
  watchlistByType: (state) => (type) => {
    return state.items.filter(item => item.media_type === type)
  }
}
