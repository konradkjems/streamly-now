export default ({ app }, inject) => {
  const shortcuts = {
    // Show/hide shortcuts modal
    '?': () => {
      app.$nuxt.$emit('toggle-shortcuts-modal')
    },
    
    // Search
    '/': (e) => {
      e.preventDefault()
      const searchInput = document.getElementById('search')
      if (searchInput) {
        searchInput.focus()
      }
    },
    
    // Navigation
    'ArrowLeft': () => {
      const prevBtn = document.querySelector('.carousel__nav--left:not([disabled])')
      if (prevBtn) {
        prevBtn.click()
      }
    },
    
    'ArrowRight': () => {
      const nextBtn = document.querySelector('.carousel__nav--right:not([disabled])')
      if (nextBtn) {
        nextBtn.click()
      }
    },
    
    // Player controls
    'Space': (e) => {
      e.preventDefault()
      const player = document.querySelector('iframe')
      if (player && player.contentWindow) {
        player.contentWindow.postMessage({ type: 'playPause' }, '*')
      }
    },
    
    'Escape': () => {
      // Close modals
      app.$nuxt.$emit('close-modal')
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    },
    
    // Quick actions
    'w': () => {
      // Toggle watchlist on current item
      app.$nuxt.$emit('toggle-watchlist')
    },
    
    'f': () => {
      // Toggle fullscreen
      const player = document.querySelector('.video-container')
      if (player && !document.fullscreenElement) {
        player.requestFullscreen()
      }
    },
    
    'm': (e) => {
      // Toggle mute
      e.preventDefault()
      const player = document.querySelector('iframe')
      if (player && player.contentWindow) {
        player.contentWindow.postMessage({ type: 'toggleMute' }, '*')
      }
    },
    
    // Volume controls
    'ArrowUp': (e) => {
      if (e.shiftKey) {
        e.preventDefault()
        const player = document.querySelector('iframe')
        if (player && player.contentWindow) {
          player.contentWindow.postMessage({ type: 'volumeUp' }, '*')
        }
      }
    },
    
    'ArrowDown': (e) => {
      if (e.shiftKey) {
        e.preventDefault()
        const player = document.querySelector('iframe')
        if (player && player.contentWindow) {
          player.contentWindow.postMessage({ type: 'volumeDown' }, '*')
        }
      }
    },
    
    // Seek controls
    'j': (e) => {
      e.preventDefault()
      const player = document.querySelector('iframe')
      if (player && player.contentWindow) {
        player.contentWindow.postMessage({ type: 'seek', value: -10 }, '*')
      }
    },
    
    'l': (e) => {
      e.preventDefault()
      const player = document.querySelector('iframe')
      if (player && player.contentWindow) {
        player.contentWindow.postMessage({ type: 'seek', value: 10 }, '*')
      }
    },
    
    // Skip intro
    's': (e) => {
      e.preventDefault()
      const player = document.querySelector('iframe')
      if (player && player.contentWindow) {
        player.contentWindow.postMessage({ type: 'skipIntro' }, '*')
      }
    }
  }

  const handleKeyPress = (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return
    }

    const key = e.key
    const keyCombo = e.shiftKey ? `Shift+${key}` : key

    // Check for exact key match first
    if (shortcuts[key]) {
      shortcuts[key](e)
      return
    }

    // Check for key combo
    if (shortcuts[keyCombo]) {
      shortcuts[keyCombo](e)
    }
  }

  if (process.client) {
    document.addEventListener('keydown', handleKeyPress)
  }

  inject('keyboardShortcuts', shortcuts)
}

