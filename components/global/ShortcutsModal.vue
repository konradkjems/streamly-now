<template>
  <transition name="modal">
    <div v-if="show" class="shortcuts-modal" @click.self="closeModal">
      <div class="shortcuts-modal__content">
        <div class="shortcuts-modal__header">
          <h2 class="shortcuts-modal__title">Keyboard Shortcuts</h2>
          <button @click="closeModal" class="shortcuts-modal__close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="shortcuts-modal__body">
          <!-- Player Controls -->
          <div class="shortcuts-section">
            <h3 class="shortcuts-section__title">Player Controls</h3>
            <div class="shortcuts-list">
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>Space</kbd>
                </div>
                <div class="shortcut-item__description">Play / Pause</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>M</kbd>
                </div>
                <div class="shortcut-item__description">Mute / Unmute</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>F</kbd>
                </div>
                <div class="shortcut-item__description">Fullscreen</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>J</kbd>
                </div>
                <div class="shortcut-item__description">Seek Backward 10s</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>L</kbd>
                </div>
                <div class="shortcut-item__description">Seek Forward 10s</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>S</kbd>
                </div>
                <div class="shortcut-item__description">Skip Intro</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>Shift</kbd> + <kbd>↑</kbd>
                </div>
                <div class="shortcut-item__description">Volume Up</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>Shift</kbd> + <kbd>↓</kbd>
                </div>
                <div class="shortcut-item__description">Volume Down</div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="shortcuts-section">
            <h3 class="shortcuts-section__title">Navigation</h3>
            <div class="shortcuts-list">
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>/</kbd>
                </div>
                <div class="shortcut-item__description">Focus Search</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>←</kbd>
                </div>
                <div class="shortcut-item__description">Previous Carousel</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>→</kbd>
                </div>
                <div class="shortcut-item__description">Next Carousel</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>Esc</kbd>
                </div>
                <div class="shortcut-item__description">Close Modal / Exit Fullscreen</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="shortcuts-section">
            <h3 class="shortcuts-section__title">Quick Actions</h3>
            <div class="shortcuts-list">
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>W</kbd>
                </div>
                <div class="shortcut-item__description">Toggle Watchlist</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-item__keys">
                  <kbd>?</kbd>
                </div>
                <div class="shortcut-item__description">Show / Hide Shortcuts</div>
              </div>
            </div>
          </div>
        </div>

        <div class="shortcuts-modal__footer">
          <p class="shortcuts-modal__hint">
            Press <kbd>Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ShortcutsModal',
  
  data() {
    return {
      show: false
    }
  },
  
  mounted() {
    this.$nuxt.$on('toggle-shortcuts-modal', this.toggleModal)
  },
  
  beforeDestroy() {
    this.$nuxt.$off('toggle-shortcuts-modal', this.toggleModal)
  },
  
  methods: {
    toggleModal() {
      this.show = !this.show
    },
    
    closeModal() {
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcuts-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.shortcuts-modal__content {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(30, 30, 30, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.shortcuts-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-modal__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
}

.shortcuts-modal__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.shortcuts-modal__body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.shortcuts-section {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.shortcuts-section__title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e50914;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.shortcut-item__keys {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.shortcut-item__description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  text-align: right;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.shortcuts-modal__footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.shortcuts-modal__hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .shortcuts-modal__content,
.modal-leave-active .shortcuts-modal__content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter .shortcuts-modal__content,
.modal-leave-to .shortcuts-modal__content {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .shortcuts-modal {
    padding: 1rem;
  }
  
  .shortcuts-modal__header {
    padding: 1.5rem;
  }
  
  .shortcuts-modal__title {
    font-size: 1.5rem;
  }
  
  .shortcuts-modal__body {
    padding: 1.5rem;
  }
  
  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .shortcut-item__description {
    text-align: left;
  }
}
</style>

