<template>
  <div class="profile">
    <!-- Profile Header -->
    <div class="profile__header">
      <div class="profile__hero">
        <div class="profile__avatar">
          <div v-if="currentProfile && currentProfile.avatar_url" class="profile__avatar-img">
            <img :src="currentProfile.avatar_url" :alt="currentProfile.display_name" />
          </div>
          <div v-else class="profile__avatar-placeholder">
            <span>{{ userInitials }}</span>
          </div>
        </div>
        
        <div class="profile__info">
          <h1 class="profile__name">{{ currentProfile?.display_name || 'User' }}</h1>
          <p class="profile__email">{{ currentUser?.email }}</p>
          <p class="profile__member-since">
            Member since {{ formatDate(currentProfile?.created_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Profile Navigation -->
    <div class="profile__nav">
      <div class="profile__nav-container">
        <button 
          :class="['profile__nav-item', { active: activeTab === 'overview' }]"
          @click="activeTab = 'overview'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Overview
        </button>
        
        <button 
          :class="['profile__nav-item', { active: activeTab === 'watchlist' }]"
          @click="activeTab = 'watchlist'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
          My Watchlist
        </button>
        
        <button 
          :class="['profile__nav-item', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Viewing History
        </button>
        
        <button 
          :class="['profile__nav-item', { active: activeTab === 'settings' }]"
          @click="activeTab = 'settings'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </button>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="profile__content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="profile__tab">
        <div class="profile__stats">
          <div class="profile__stat">
            <div class="profile__stat-number">{{ watchlistCount }}</div>
            <div class="profile__stat-label">Items in Watchlist</div>
          </div>
          <div class="profile__stat">
            <div class="profile__stat-number">{{ historyCount }}</div>
            <div class="profile__stat-label">Items Watched</div>
          </div>
          <div class="profile__stat">
            <div class="profile__stat-number">{{ completedCount }}</div>
            <div class="profile__stat-label">Completed</div>
          </div>
        </div>

        <div class="profile__recent">
          <h2 class="profile__section-title">Recent Activity</h2>
          <div v-if="recentHistory.length > 0" class="profile__recent-list">
            <div 
              v-for="item in recentHistory.slice(0, 5)" 
              :key="`${item.media_type}-${item.media_id}-${item.season_number}-${item.episode_number}`"
              class="profile__recent-item">
              <nuxt-link 
                :to="getItemUrl(item)"
                class="profile__recent-link">
                <div class="profile__recent-img">
                  <img 
                    v-if="item.media_poster_path"
                    :src="getPosterUrl(item.media_poster_path)"
                    :alt="item.media_title" />
                </div>
                <div class="profile__recent-info">
                  <h3 class="profile__recent-title">{{ getItemTitle(item) }}</h3>
                  <p class="profile__recent-date">{{ formatDate(item.last_watched_at) }}</p>
                  <div v-if="!item.completed" class="profile__recent-progress">
                    <div class="profile__progress-bar">
                      <div 
                        class="profile__progress-fill"
                        :style="{ width: getProgressPercentage(item) + '%' }">
                      </div>
                    </div>
                    <span class="profile__progress-text">{{ Math.round(getProgressPercentage(item)) }}%</span>
                  </div>
                </div>
              </nuxt-link>
            </div>
          </div>
          <div v-else class="profile__empty">
            <p>No recent activity to show.</p>
          </div>
        </div>
      </div>

      <!-- Watchlist Tab -->
      <div v-if="activeTab === 'watchlist'" class="profile__tab">
        <div class="profile__tab-header">
          <h2 class="profile__section-title">My Watchlist</h2>
          <div class="profile__tab-actions">
            <select v-model="watchlistFilter" class="profile__filter">
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>
        </div>

        <div v-if="filteredWatchlist.length > 0" class="profile__watchlist">
          <div 
            v-for="item in filteredWatchlist" 
            :key="`${item.media_type}-${item.media_id}`"
            class="profile__watchlist-item">
            <nuxt-link 
              :to="getItemUrl(item)"
              class="profile__watchlist-link">
              <div class="profile__watchlist-img">
                <img 
                  v-if="item.media_poster_path"
                  :src="getPosterUrl(item.media_poster_path)"
                  :alt="item.media_title" />
              </div>
              <div class="profile__watchlist-info">
                <h3 class="profile__watchlist-title">{{ item.media_title }}</h3>
                <p class="profile__watchlist-type">{{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                <p class="profile__watchlist-date">Added {{ formatDate(item.added_at) }}</p>
              </div>
            </nuxt-link>
            <button 
              class="profile__watchlist-remove"
              @click="removeFromWatchlist(item)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div v-else class="profile__empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies and TV shows you want to watch later.</p>
          <nuxt-link to="/" class="profile__cta-btn">Browse Content</nuxt-link>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="profile__tab">
        <div class="profile__tab-header">
          <h2 class="profile__section-title">Viewing History</h2>
          <div class="profile__tab-actions">
            <select v-model="historyFilter" class="profile__filter">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>

        <div v-if="filteredHistory.length > 0" class="profile__history">
          <div 
            v-for="item in filteredHistory" 
            :key="`${item.media_type}-${item.media_id}-${item.season_number}-${item.episode_number}`"
            class="profile__history-item">
            <nuxt-link 
              :to="getItemUrl(item)"
              class="profile__history-link">
              <div class="profile__history-img">
                <img 
                  v-if="item.media_poster_path"
                  :src="getPosterUrl(item.media_poster_path)"
                  :alt="item.media_title" />
                <div v-if="item.completed" class="profile__history-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
              </div>
              <div class="profile__history-info">
                <h3 class="profile__history-title">{{ getItemTitle(item) }}</h3>
                <p class="profile__history-date">Last watched {{ formatDate(item.last_watched_at) }}</p>
                <div v-if="!item.completed" class="profile__history-progress">
                  <div class="profile__progress-bar">
                    <div 
                      class="profile__progress-fill"
                      :style="{ width: getProgressPercentage(item) + '%' }">
                    </div>
                  </div>
                  <span class="profile__progress-text">{{ Math.round(getProgressPercentage(item)) }}%</span>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
        <div v-else class="profile__empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h3>No viewing history</h3>
          <p>Start watching movies and TV shows to see your history here.</p>
          <nuxt-link to="/" class="profile__cta-btn">Start Watching</nuxt-link>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="profile__tab">
        <h2 class="profile__section-title">Account Settings</h2>
        
        <div class="profile__settings">
          <div class="profile__setting-group">
            <h3 class="profile__setting-title">Profile Information</h3>
            <div class="profile__setting-item">
              <label class="profile__setting-label">Display Name</label>
              <input 
                v-model="profileForm.display_name"
                type="text"
                class="profile__setting-input"
                placeholder="Enter display name" />
            </div>
            <div class="profile__setting-item">
              <label class="profile__setting-label">Email</label>
              <input 
                :value="currentUser?.email"
                type="email"
                class="profile__setting-input"
                disabled />
            </div>
            <button 
              @click="updateProfile"
              :disabled="profileLoading"
              class="profile__setting-btn">
              {{ profileLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>

          <div class="profile__setting-group">
            <h3 class="profile__setting-title">Account Actions</h3>
            <button 
              @click="signOut"
              class="profile__setting-btn profile__setting-btn--danger">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { apiImgUrl } from '~/api'

export default {
  name: 'Profile',
  
  middleware: 'auth',
  
  data() {
    return {
      activeTab: 'overview',
      watchlistFilter: 'all',
      historyFilter: 'all',
      profileForm: {
        display_name: ''
      },
      profileLoading: false
    }
  },

  computed: {
    ...mapGetters('auth', ['currentUser', 'currentProfile']),
    ...mapGetters('watchlist', ['getWatchlist']),
    ...mapGetters('viewingHistory', ['getHistory']),

    userInitials() {
      if (!this.currentProfile?.display_name) return 'U'
      return this.currentProfile.display_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    watchlistCount() {
      return this.getWatchlist.length
    },

    historyCount() {
      return this.getHistory.length
    },

    completedCount() {
      return this.getHistory.filter(item => item.completed).length
    },

    recentHistory() {
      return this.getHistory.slice(0, 10)
    },

    filteredWatchlist() {
      if (this.watchlistFilter === 'all') return [...this.getWatchlist]
      return this.getWatchlist.filter(item => item.media_type === this.watchlistFilter)
    },

    filteredHistory() {
      // Create a copy to avoid mutating Vuex state
      let filtered = [...this.getHistory]
      if (this.historyFilter === 'completed') {
        filtered = filtered.filter(item => item.completed)
      } else if (this.historyFilter === 'in-progress') {
        filtered = filtered.filter(item => !item.completed)
      }
      return filtered
    }
  },

  mounted() {
    // Initialize form with current profile data
    if (this.currentProfile) {
      this.profileForm.display_name = this.currentProfile.display_name || ''
    }
  },

  methods: {
    ...mapActions('watchlist', ['toggleWatchlist']),
    ...mapActions('auth', ['signOut']),

    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getPosterUrl(posterPath) {
      return `${apiImgUrl}/w370_and_h556_bestv2${posterPath}`
    },

    getItemUrl(item) {
      if (item.media_type === 'tv') {
        return {
          name: 'tv-id',
          params: { id: item.media_id },
          query: { 
            tab: 'watch',
            season: item.season_number,
            episode: item.episode_number
          }
        }
      } else {
        return {
          name: 'movie-id',
          params: { id: item.media_id },
          query: { tab: 'watch' }
        }
      }
    },

    getItemTitle(item) {
      if (item.media_type === 'tv' && item.season_number && item.episode_number) {
        return `${item.media_title} - S${item.season_number}E${item.episode_number}`
      }
      return item.media_title
    },

    getProgressPercentage(item) {
      if (item.total_duration <= 0) return 0
      return (item.watch_duration / item.total_duration) * 100
    },

    async removeFromWatchlist(item) {
      try {
        const mediaData = {
          media_type: item.media_type,
          media_id: item.media_id,
          media_title: item.media_title,
          media_poster_path: item.media_poster_path,
          media_release_date: item.media_release_date,
          media_overview: item.media_overview
        }
        await this.toggleWatchlist(mediaData)
      } catch (error) {
        console.error('Error removing from watchlist:', error)
      }
    },

    async updateProfile() {
      this.profileLoading = true
      try {
        // Update profile logic would go here
        // For now, just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Profile updated:', this.profileForm)
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        this.profileLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/utilities/_variables.scss';

.profile {
  min-height: 100vh;
  background: $base-bg;
  color: #fff;
}

.profile__header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  padding: 4rem 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile__hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile__avatar {
  flex-shrink: 0;
}

.profile__avatar-img {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid $primary-color;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile__avatar-placeholder {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
}

.profile__info {
  flex: 1;
}

.profile__name {
  font-size: 3.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
}

.profile__email {
  font-size: 1.6rem;
  color: #b3b3b3;
  margin-bottom: 0.5rem;
}

.profile__member-since {
  font-size: 1.4rem;
  color: #666;
}

.profile__nav {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 6.8rem;
  z-index: 100;
}

.profile__nav-container {
  display: flex;
  gap: 0;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile__nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.6rem 2rem;
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: $primary-color;
    border-bottom-color: $primary-color;
    background: rgba($primary-color, 0.1);
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.profile__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.profile__tab {
  min-height: 50vh;
}

.profile__section-title {
  font-size: 2.4rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #fff;
}

.profile__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.profile__stat {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile__stat-number {
  font-size: 3.2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 0.5rem;
}

.profile__stat-label {
  font-size: 1.4rem;
  color: #b3b3b3;
}

.profile__recent {
  margin-top: 3rem;
}

.profile__recent-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile__recent-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
}

.profile__recent-link {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.profile__recent-img {
  width: 8rem;
  height: 12rem;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile__recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.profile__recent-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.profile__recent-date {
  font-size: 1.2rem;
  color: #666;
}

.profile__recent-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.profile__progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.profile__progress-fill {
  height: 100%;
  background: $primary-color;
  transition: width 0.3s ease;
}

.profile__progress-text {
  font-size: 1.2rem;
  color: $primary-color;
  font-weight: 500;
}

.profile__tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.profile__tab-actions {
  display: flex;
  gap: 1rem;
}

.profile__filter {
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 1.4rem;
  outline: none;

  &:focus {
    border-color: $primary-color;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
}

.profile__watchlist,
.profile__history {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.profile__watchlist-item,
.profile__history-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
}

.profile__watchlist-link,
.profile__history-link {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.profile__watchlist-img,
.profile__history-img {
  width: 100%;
  height: 20rem;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile__history-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3.2rem;
  height: 3.2rem;
  background: $primary-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.profile__watchlist-info,
.profile__history-info {
  padding: 0 0.5rem;
}

.profile__watchlist-title,
.profile__history-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.profile__watchlist-type,
.profile__watchlist-date,
.profile__history-date {
  font-size: 1.2rem;
  color: #b3b3b3;
  margin-bottom: 0.3rem;
}

.profile__watchlist-remove {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3.2rem;
  height: 3.2rem;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
}

.profile__watchlist-item:hover .profile__watchlist-remove {
  opacity: 1;
}

.profile__history-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.profile__empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  svg {
    margin-bottom: 2rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 2rem;
    color: #b3b3b3;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }
}

.profile__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, lighten($primary-color, 5%) 0%, $primary-color 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($primary-color, 0.4);
  }
}

.profile__settings {
  max-width: 600px;
}

.profile__setting-group {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile__setting-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2rem;
}

.profile__setting-item {
  margin-bottom: 2rem;
}

.profile__setting-label {
  display: block;
  font-size: 1.4rem;
  font-weight: 500;
  color: #b3b3b3;
  margin-bottom: 0.8rem;
}

.profile__setting-input {
  width: 100%;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 1.4rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: $primary-color;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #666;
  }
}

.profile__setting-btn {
  padding: 1.2rem 2.4rem;
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, lighten($primary-color, 5%) 0%, $primary-color 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($primary-color, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &--danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e74c3c 0%, #dc3545 100%);
      box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
    }
  }
}

@media (max-width: $breakpoint-medium) {
  .profile__hero {
    flex-direction: column;
    text-align: center;
  }

  .profile__nav-container {
    overflow-x: auto;
    padding: 0 1rem;
  }

  .profile__nav-item {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .profile__content {
    padding: 2rem 1rem;
  }

  .profile__watchlist,
  .profile__history {
    grid-template-columns: 1fr;
  }
}
</style>
