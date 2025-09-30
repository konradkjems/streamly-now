import { getGenreList, getMediaByGenre } from '~/api'

export const state = () => ({
  movieGenres: [],
  tvGenres: [],
  loading: false,
  error: null,
  selectedGenre: null,
  genreContent: {
    movies: [],
    tv: []
  }
})

export const mutations = {
  SET_MOVIE_GENRES(state, genres) {
    state.movieGenres = genres
  },
  SET_TV_GENRES(state, genres) {
    state.tvGenres = genres
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_SELECTED_GENRE(state, genre) {
    state.selectedGenre = genre
  },
  SET_GENRE_CONTENT(state, { type, content }) {
    state.genreContent[type] = content
  },
  CLEAR_GENRE_CONTENT(state) {
    state.genreContent = { movies: [], tv: [] }
  }
}

export const actions = {
  async fetchMovieGenres({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const genres = await getGenreList('movie')
      commit('SET_MOVIE_GENRES', genres)
      return genres
    } catch (error) {
      console.error('Error fetching movie genres:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchTVGenres({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const genres = await getGenreList('tv')
      commit('SET_TV_GENRES', genres)
      return genres
    } catch (error) {
      console.error('Error fetching TV genres:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchGenres({ dispatch }) {
    await Promise.all([
      dispatch('fetchMovieGenres'),
      dispatch('fetchTVGenres')
    ])
  },

  async fetchGenreContent({ commit }, { genreId, mediaType, page = 1 }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const content = await getMediaByGenre(mediaType, genreId, page)
      commit('SET_GENRE_CONTENT', { 
        type: mediaType === 'movie' ? 'movies' : 'tv', 
        content: content.results 
      })
      return content
    } catch (error) {
      console.error('Error fetching genre content:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  selectGenre({ commit }, genre) {
    commit('SET_SELECTED_GENRE', genre)
  },

  clearGenreContent({ commit }) {
    commit('CLEAR_GENRE_CONTENT')
  }
}

export const getters = {
  getMovieGenres: (state) => state.movieGenres,
  getTVGenres: (state) => state.tvGenres,
  getAllGenres: (state) => [...state.movieGenres, ...state.tvGenres],
  getSelectedGenre: (state) => state.selectedGenre,
  getGenreContent: (state) => state.genreContent,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  getGenreById: (state) => (id) => {
    return [...state.movieGenres, ...state.tvGenres].find(genre => genre.id === id)
  },
  getPopularGenres: (state) => {
    // Return most popular genres for quick access
    const popularGenreIds = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37]
    return [...state.movieGenres, ...state.tvGenres].filter(genre => 
      popularGenreIds.includes(genre.id)
    ).slice(0, 8)
  }
}
