import { mapGetters } from 'vuex'

export default function ({ app, store }, inject) {
  // Notification system
  class NotificationService {
    constructor() {
      this.permission = null
      this.checkPermission()
    }

    async checkPermission() {
      if ('Notification' in window) {
        this.permission = Notification.permission
      }
    }

    async requestPermission() {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications')
        return false
      }

      if (Notification.permission === 'granted') {
        return true
      }

      if (Notification.permission === 'denied') {
        console.warn('Notification permission denied')
        return false
      }

      // Request permission
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    async showNotification(title, options = {}) {
      // Check if user has notifications enabled
      const preferences = store.getters['auth/currentPreferences']
      if (!preferences || !preferences.push_notifications) {
        console.log('Push notifications disabled by user preference')
        return
      }

      // Check browser permission
      if (this.permission !== 'granted') {
        const hasPermission = await this.requestPermission()
        if (!hasPermission) {
          console.warn('Cannot show notification: permission denied')
          return
        }
      }

      // Default notification options
      const defaultOptions = {
        icon: '/icon.png',
        badge: '/icon-medium.png',
        requireInteraction: false,
        silent: false,
        ...options
      }

      // Show notification
      const notification = new Notification(title, defaultOptions)

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }

    // Specific notification methods
    async showNewReleaseNotification(title, type) {
      await this.showNotification(
        `New ${type} Available!`,
        {
          body: `${title} is now available to watch`,
          tag: `new-release-${type}`,
          data: { type, title }
        }
      )
    }

    async showRecommendationNotification(title, basedOn) {
      await this.showNotification(
        'Recommended for You',
        {
          body: `Because you watched ${basedOn}, we think you'll like ${title}`,
          tag: `recommendation-${title}`,
          data: { type: 'recommendation', title, basedOn }
        }
      )
    }

    async showWatchlistNotification(title, type) {
      await this.showNotification(
        'Added to Watchlist',
        {
          body: `${title} has been added to your watchlist`,
          tag: `watchlist-${title}`,
          data: { type: 'watchlist', title, mediaType: type }
        }
      )
    }

    async showContinueWatchingNotification(title, progress) {
      const progressPercent = Math.round(progress)
      await this.showNotification(
        'Continue Watching',
        {
          body: `You were ${progressPercent}% through ${title}`,
          tag: `continue-${title}`,
          data: { type: 'continue', title, progress }
        }
      )
    }
  }

  // Create instance and inject
  const notificationService = new NotificationService()
  inject('notifications', notificationService)
}
