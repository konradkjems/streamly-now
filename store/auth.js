import { supabase } from '~/plugins/supabase'

export const state = () => ({
  user: null,
  profile: null,
  preferences: null,
  loading: false,
  error: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_PROFILE(state, profile) {
    state.profile = profile
  },
  SET_PREFERENCES(state, preferences) {
    state.preferences = preferences
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_AUTH(state) {
    state.user = null
    state.profile = null
    state.preferences = null
    state.error = null
  }
}

export const actions = {
  async signUp({ commit }, { email, password, displayName }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      })
      
      if (error) throw error
      
      commit('SET_USER', data.user)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async signIn({ commit }, { email, password }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      commit('SET_USER', data.user)
      await this.dispatch('auth/fetchProfile')
      await this.dispatch('auth/fetchPreferences')
      
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async signOut({ commit }) {
    commit('SET_LOADING', true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      commit('CLEAR_AUTH')
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchProfile({ commit, state }) {
    if (!state.user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', state.user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      commit('SET_PROFILE', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateProfile({ commit, state }, updates) {
    if (!state.user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id)
        .select()
        .single()
      
      if (error) throw error
      
      commit('SET_PROFILE', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async fetchPreferences({ commit, state }) {
    if (!state.user) return
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', state.user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      commit('SET_PREFERENCES', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updatePreferences({ commit, state }, updates) {
    if (!state.user) return
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id)
        .select()
        .single()
      
      if (error) throw error
      
      commit('SET_PREFERENCES', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async initializeAuth({ commit, dispatch }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        commit('SET_USER', user)
        await dispatch('fetchProfile')
        await dispatch('fetchPreferences')
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }
}

export const getters = {
  isAuthenticated: (state) => !!state.user,
  currentUser: (state) => state.user,
  currentProfile: (state) => state.profile,
  currentPreferences: (state) => state.preferences,
  isLoading: (state) => state.loading,
  authError: (state) => state.error
}
