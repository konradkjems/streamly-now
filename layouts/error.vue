<template>
  <div :class="$style.block">
    <div :class="$style.error">
      <!-- Netflix-style error illustration -->
      <div :class="$style.illustration">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#E50914" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>

      <div :class="$style.title">
        {{ getTitle() }}
      </div>

      <!-- eslint-disable -->
      <div :class="$style.message">
        <p v-if="error.statusCode === 504">
          Looks like we're having trouble connecting to our servers. Please check your internet connection and try again.
        </p>
        <p v-else-if="error.statusCode === 404">
          Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
        </p>
        <p v-else>
          Something went wrong. Please try again or contact support if the problem persists.
        </p>
        
        <div :class="$style.actions">
          <nuxt-link :class="$style.homeBtn" to="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Go Home
          </nuxt-link>
          
          <button :class="$style.backBtn" @click="$router.go(-1)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Go Back
          </button>
        </div>
      </div>
      <!-- eslint-enable -->
    </div>
  </div>
</template>

<script>
export default {
  layout: 'no-footer',

  props: {
    error: {
      type: Object,
      required: true,
    },
  },

  head () {
    return {
      title: this.message,
    };
  },

  computed: {
    message () {
      return this.error.message || `An error occurred`;
    },
  },

  methods: {
    getTitle() {
      switch (this.error.statusCode) {
        case 404:
          return 'Page Not Found'
        case 504:
          return 'Connection Error'
        case 500:
          return 'Server Error'
        default:
          return 'Something Went Wrong'
      }
    }
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.block {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
}

.error {
  max-width: 500px;
  width: 100%;
}

.illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  
  svg {
    opacity: 0.8;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

.title {
  margin-bottom: 1.5rem;
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;

  @media (min-width: $breakpoint-large) {
    font-size: 3rem;
  }
}

.message {
  margin-bottom: 2.5rem;
  font-size: 1.6rem;
  color: #b3b3b3;
  line-height: 1.6;

  p {
    margin-bottom: 1rem;
  }
}

.actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.homeBtn, .backBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.homeBtn {
  background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, lighten($primary-color, 5%) 0%, $primary-color 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($primary-color, 0.4);
  }
}

.backBtn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
}

@media (max-width: $breakpoint-small) {
  .actions {
    flex-direction: column;
    align-items: center;
  }

  .homeBtn, .backBtn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}
</style>
