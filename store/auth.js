import { supabase } from '~/plugins/supabase'

export const state = () => ({
  user: null,
  profile: null,
  preferences: null,
  loading: false,
  initialized: false,
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
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized
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

  async signInWithGoogle({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
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
      commit('SET_LOADING', true)
      
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        commit('SET_INITIALIZED', true)
        return
      }
      
      if (session?.user) {
        commit('SET_USER', session.user)
        await dispatch('fetchProfile')
        await dispatch('fetchPreferences')
      } else {
        // If no session, try getUser as fallback
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          commit('SET_INITIALIZED', true)
          return
        }
        
        if (user) {
          commit('SET_USER', user)
          await dispatch('fetchProfile')
          await dispatch('fetchPreferences')
        }
      }
      
      commit('SET_INITIALIZED', true)
    } catch (error) {
      console.error('Error initializing auth:', error)
      commit('SET_ERROR', error.message)
      commit('SET_INITIALIZED', true)
    } finally {
      commit('SET_LOADING', false)
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
