import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default ({ app, store }, inject) => {
  inject('supabase', supabase)
  
  // Only run on client side
  if (process.client) {
    // Initialize auth state immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        store.dispatch('auth/initializeAuth').then(() => {
          // Fetch user data after auth is initialized
          store.dispatch('watchlist/fetchWatchlist')
          store.dispatch('viewingHistory/fetchHistory')
        })
      }
    })
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        store.dispatch('auth/initializeAuth')
        // Fetch user data when signed in
        store.dispatch('watchlist/fetchWatchlist')
        store.dispatch('viewingHistory/fetchHistory')
      } else if (event === 'SIGNED_OUT') {
        store.commit('auth/SET_USER', null)
        store.commit('auth/SET_PROFILE', null)
        store.commit('auth/SET_PREFERENCES', null)
        store.commit('auth/CLEAR_AUTH')
      }
    })
  }
}
