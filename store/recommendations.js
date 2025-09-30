import { supabase } from '~/plugins/supabase'
import { getTrendingMovies, getTrendingTV, getMovieRecommendations, getTVRecommendations } from '~/api'

export const state = () => ({
  recommendations: {
    trending: {
      movies: [],
      tv: []
    },
    becauseYouWatched: [],
    similar: [],
    personalized: []
  },
  loading: false,
  error: null,
  lastUpdated: null
})

export const mutations = {
  SET_TRENDING_MOVIES(state, movies) {
    state.recommendations.trending.movies = movies
  },
  SET_TRENDING_TV(state, tv) {
    state.recommendations.trending.tv = tv
  },
  SET_BECAUSE_YOU_WATCHED(state, recommendations) {
    state.recommendations.becauseYouWatched = recommendations
  },
  SET_SIMILAR(state, similar) {
    state.recommendations.similar = similar
  },
  SET_PERSONALIZED(state, personalized) {
    state.recommendations.personalized = personalized
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_LAST_UPDATED(state, timestamp) {
    state.lastUpdated = timestamp
  },
  CLEAR_RECOMMENDATIONS(state) {
    state.recommendations = {
      trending: { movies: [], tv: [] },
      becauseYouWatched: [],
      similar: [],
      personalized: []
    }
  }
}

export const actions = {
  async fetchTrending({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // Fetch trending movies and TV shows
      const [moviesData, tvData] = await Promise.all([
        getTrendingMovies(1),
        getTrendingTV(1)
      ])
      
      commit('SET_TRENDING_MOVIES', moviesData.results.slice(0, 10))
      commit('SET_TRENDING_TV', tvData.results.slice(0, 10))
      commit('SET_LAST_UPDATED', Date.now())
      
    } catch (error) {
      console.error('Error fetching trending content:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchBecauseYouWatched({ commit, rootState }) {
    if (!rootState.auth.user) return
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // Get user's recent viewing history
      const { data: history, error } = await supabase
        .from('viewing_history')
        .select('*')
        .eq('user_id', rootState.auth.user.id)
        .order('last_watched_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      if (!history || history.length === 0) {
        commit('SET_BECAUSE_YOU_WATCHED', [])
        return
      }
      
      // Get recommendations for each item in history
      const recommendations = []
      const seenRecommendations = new Set() // Track seen recommendations to avoid duplicates
      
      for (const item of history.slice(0, 1)) { // Limit to 1 recent item
        try {
          let recommendationData = null
          
          if (item.media_type === 'movie') {
            const data = await getMovieRecommendations(item.media_id, 1)
            recommendationData = data.results.slice(0, 12) // Get more to filter duplicates
          } else if (item.media_type === 'tv') {
            const data = await getTVRecommendations(item.media_id, 1)
            recommendationData = data.results.slice(0, 12) // Get more to filter duplicates
          }
          
          if (recommendationData && recommendationData.length > 0) {
            // Filter out duplicates and limit to 6 unique recommendations
            const uniqueRecommendations = recommendationData.filter(rec => {
              const key = `${rec.id}-${rec.media_type || 'movie'}`
              if (seenRecommendations.has(key)) {
                return false
              }
              seenRecommendations.add(key)
              return true
            }).slice(0, 12)
            
            if (uniqueRecommendations.length > 0) {
              recommendations.push({
                basedOn: {
                  title: item.media_title,
                  type: item.media_type,
                  id: item.media_id
                },
                recommendations: uniqueRecommendations
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching recommendations for ${item.media_title}:`, error)
        }
      }
      
      commit('SET_BECAUSE_YOU_WATCHED', recommendations)
      
    } catch (error) {
      console.error('Error fetching because you watched recommendations:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchSimilarContent({ commit }, { mediaId, mediaType }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      let data = null
      
      if (mediaType === 'movie') {
        const response = await getMovieRecommendations(mediaId, 1)
        data = response.results.slice(0, 6)
      } else if (mediaType === 'tv') {
        const response = await getTVRecommendations(mediaId, 1)
        data = response.results.slice(0, 6)
      }
      
      commit('SET_SIMILAR', data || [])
      
    } catch (error) {
      console.error('Error fetching similar content:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchPersonalizedRecommendations({ commit, rootState }) {
    if (!rootState.auth.user) return
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // Get user's viewing history and watchlist
      const [historyResult, watchlistResult] = await Promise.all([
        supabase
          .from('viewing_history')
          .select('*')
          .eq('user_id', rootState.auth.user.id)
          .order('last_watched_at', { ascending: false })
          .limit(20),
        supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', rootState.auth.user.id)
          .order('added_at', { ascending: false })
          .limit(20)
      ])
      
      if (historyResult.error) throw historyResult.error
      if (watchlistResult.error) throw watchlistResult.error
      
      const history = historyResult.data || []
      const watchlist = watchlistResult.data || []
      
      // Combine and analyze user preferences
      const allItems = [...history, ...watchlist]
      
      if (allItems.length === 0) {
        // If no history, show trending content
        const trendingData = await getTrendingMovies(1)
        commit('SET_PERSONALIZED', trendingData.results.slice(0, 10))
        return
      }
      
      // Analyze genres and create personalized recommendations
      const genreCounts = {}
      const typeCounts = { movie: 0, tv: 0 }
      
      allItems.forEach(item => {
        // Count media types
        typeCounts[item.media_type] = (typeCounts[item.media_type] || 0) + 1
        
        // For now, we'll use a simple approach since we don't have genre data
        // In a real implementation, you'd fetch genre data from TMDB
      })
      
      // Determine user's preferred content type
      const preferredType = typeCounts.movie > typeCounts.tv ? 'movie' : 'tv'
      
      // Fetch personalized recommendations based on preferences
      let personalizedData = []
      
      if (preferredType === 'movie') {
        const data = await getTrendingMovies(1)
        personalizedData = data.results.slice(0, 10)
      } else {
        const data = await getTrendingTV(1)
        personalizedData = data.results.slice(0, 10)
      }
      
      commit('SET_PERSONALIZED', personalizedData)
      
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async refreshRecommendations({ dispatch }) {
    await Promise.all([
      dispatch('fetchTrending'),
      dispatch('fetchBecauseYouWatched'),
      dispatch('fetchPersonalizedRecommendations')
    ])
  },

  clearRecommendations({ commit }) {
    commit('CLEAR_RECOMMENDATIONS')
  }
}

export const getters = {
  getTrendingMovies: (state) => state.recommendations.trending.movies,
  getTrendingTV: (state) => state.recommendations.trending.tv,
  getBecauseYouWatched: (state) => state.recommendations.becauseYouWatched,
  getSimilarContent: (state) => state.recommendations.similar,
  getPersonalizedRecommendations: (state) => state.recommendations.personalized,
  isLoading: (state) => state.loading,
  hasRecommendations: (state) => {
    const recs = state.recommendations
    return recs.trending.movies.length > 0 || 
           recs.trending.tv.length > 0 || 
           recs.becauseYouWatched.length > 0 || 
           recs.personalized.length > 0
  },
  recommendationsLastUpdated: (state) => state.lastUpdated
}
