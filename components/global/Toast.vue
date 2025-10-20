<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
      @click="removeToast(toast.id)"
    >
      <div class="toast-icon">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else-if="toast.type === 'error'">✕</span>
        <span v-else-if="toast.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        <p class="toast-title">{{ toast.title }}</p>
        <p v-if="toast.message" class="toast-message">{{ toast.message }}</p>
      </div>
      <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
      <div v-if="toast.undo" class="toast-undo">
        <button @click.stop="handleUndo(toast)">Undo</button>
      </div>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'Toast',
  
  data() {
    return {
      toasts: []
    }
  },
  
  mounted() {
    // Listen for toast events
    this.$nuxt.$on('toast', this.showToast)
  },
  
  beforeDestroy() {
    this.$nuxt.$off('toast', this.showToast)
  },
  
  methods: {
    showToast(toast) {
      const id = Date.now() + Math.random()
      const newToast = {
        id,
        type: toast.type || 'info',
        title: toast.title,
        message: toast.message,
        duration: toast.duration || 5000,
        undo: toast.undo || null
      }
      
      this.toasts.push(newToast)
      
      // Auto-dismiss after duration
      if (newToast.duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, newToast.duration)
      }
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },
    
    handleUndo(toast) {
      if (toast.undo && typeof toast.undo === 'function') {
        toast.undo()
      }
      this.removeToast(toast.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }
  
  &.toast-success {
    border-left: 4px solid #00ff88;
    
    .toast-icon {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }
  }
  
  &.toast-error {
    border-left: 4px solid #e50914;
    
    .toast-icon {
      background: rgba(229, 9, 20, 0.2);
      color: #e50914;
    }
  }
  
  &.toast-warning {
    border-left: 4px solid #ffa500;
    
    .toast-icon {
      background: rgba(255, 165, 0, 0.2);
      color: #ffa500;
    }
  }
  
  &.toast-info {
    border-left: 4px solid #00d9ff;
    
    .toast-icon {
      background: rgba(0, 217, 255, 0.2);
      color: #00d9ff;
    }
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.toast-message {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #fff;
  }
}

.toast-undo {
  margin-top: 0.5rem;
  
  button {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #fff;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.4s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .toast {
    padding: 0.875rem 1rem;
  }
  
  .toast-icon {
    width: 28px;
    height: 28px;
    font-size: 1.1rem;
  }
  
  .toast-title {
    font-size: 0.9rem;
  }
  
  .toast-message {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: 5px;
    right: 5px;
    left: 5px;
  }
  
  .toast {
    padding: 0.75rem;
  }
}
</style>

