import { search, getMovieDiscover, getTvDiscover } from '~/api'

export const state = () => ({
  searchOpen: false,
  fromPage: '/',
  results: null,
  filters: {
    query: '',
    media_type: 'all',
    year_from: null,
    year_to: null,
    genres: [],
    min_rating: 0,
    language: '',
    sort_by: 'relevance'
  },
  loading: false,
  error: null,
  searchHistory: [],
  suggestions: []
})

export const mutations = {
  toggleSearch (state) {
    state.searchOpen = !state.searchOpen;
  },

  openSearch (state) {
    state.searchOpen = true;
  },

  closeSearch (state) {
    state.searchOpen = false;
  },

  setFromPage (state, page) {
    state.fromPage = page;
  },

  SET_RESULTS(state, results) {
    state.results = results
  },

  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  ADD_TO_HISTORY(state, searchQuery) {
    // Remove duplicate if exists
    state.searchHistory = state.searchHistory.filter(item => item.query !== searchQuery.query)
    // Add to beginning
    state.searchHistory.unshift(searchQuery)
    // Keep only last 10 searches
    state.searchHistory = state.searchHistory.slice(0, 10)
  },

  SET_SUGGESTIONS(state, suggestions) {
    state.suggestions = suggestions
  },

  CLEAR_RESULTS(state) {
    state.results = null
    state.error = null
  }
}

export const actions = {
  async performBasicSearch({ commit }, query) {
    if (!query || query.trim().length === 0) return

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const results = await search(query.trim(), 1)
      commit('SET_RESULTS', results)
      commit('ADD_TO_HISTORY', { query: query.trim(), timestamp: Date.now() })
      return results
    } catch (error) {
      console.error('Basic search error:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async performAdvancedSearch({ commit }, searchParams) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    commit('SET_FILTERS', searchParams)

    try {
      const { query, media_type, ...filters } = searchParams

      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required')
      }

      let results = null

      if (media_type === 'all' || media_type === 'movie') {
        // Search movies
        const movieParams = {
          query: query.trim(),
          page: 1,
          ...filters
        }
        results = await search(query.trim(), 1, movieParams)
      } else if (media_type === 'tv') {
        // Search TV shows
        const tvParams = {
          query: query.trim(),
          page: 1,
          ...filters
        }
        results = await search(query.trim(), 1, tvParams)
      } else if (media_type === 'person') {
        // Search people
        const personParams = {
          query: query.trim(),
          page: 1
        }
        results = await search(query.trim(), 1, personParams)
      }

      commit('SET_RESULTS', results)
      commit('ADD_TO_HISTORY', { 
        query: query.trim(), 
        filters: searchParams,
        timestamp: Date.now() 
      })
      
      return results
    } catch (error) {
      console.error('Advanced search error:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async getSearchSuggestions({ commit }, query) {
    if (!query || query.trim().length < 2) {
      commit('SET_SUGGESTIONS', [])
      return
    }

    try {
      // This would typically call an API endpoint for suggestions
      // For now, we'll use a simple approach with the search API
      const results = await search(query.trim(), 1)
      
      const suggestions = results.results.slice(0, 5).map(item => ({
        id: item.id,
        title: item.title || item.name,
        type: item.media_type || 'movie',
        poster_path: item.poster_path
      }))

      commit('SET_SUGGESTIONS', suggestions)
      return suggestions
    } catch (error) {
      console.error('Search suggestions error:', error)
      commit('SET_SUGGESTIONS', [])
    }
  },

  clearSearchResults({ commit }) {
    commit('CLEAR_RESULTS')
  }
}

export const getters = {
  getSearchResults: (state) => state.results,
  getSearchFilters: (state) => state.filters,
  isLoading: (state) => state.loading,
  getSearchError: (state) => state.error,
  getSearchHistory: (state) => state.searchHistory,
  getSearchSuggestions: (state) => state.suggestions,
  hasSearchResults: (state) => state.results && state.results.results && state.results.results.length > 0
}
