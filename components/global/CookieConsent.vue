<template>
  <transition name="slide-down">
    <div
      v-if="isOpen"
      :class="$style.cookieBanner"
      class="alert alert--alt">
      <p>We use cookies and other tracking technologies to improve your browsing experience on our website. By using our website, you consent to our use of cookies and other tracking technologies. <a target="_blank" href="https://jason.codes/cookie-policy" rel="noopener">Find out more</a>.</p>

      <div>
        <button
          class="alert__btn alert__btn--secondary button"
          type="button"
          aria-label="Decline cookies"
          @click="decline">
          Decline
        </button>

        <button
          class="alert__btn alert__btn--primary button"
          type="button"
          aria-label="Accept cookies"
          @click="accept">
          Accept
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { get, set } from 'tiny-cookie';
import { supportsLocalStorage } from '~/mixins/Functions';

export default {
  data () {
    return {
      isOpen: false,
      storageName: 'cookieconsent',
    };
  },

  mounted () {
    if (!this.getVisited()) {
      this.isOpen = true;
    }
  },

  methods: {
    getVisited () {
      if (supportsLocalStorage()) {
        return localStorage.getItem(this.storageName);
      } else {
        return get(this.storageName);
      }
    },

    setAccepted () {
      if (supportsLocalStorage()) {
        localStorage.setItem(this.storageName, 'accepted');
      } else {
        set(this.storageName, 'accepted');
      }
    },

    setDeclined () {
      if (supportsLocalStorage()) {
        localStorage.setItem(this.storageName, 'declined');
      } else {
        set(this.storageName, 'declined');
      }
    },

    accept () {
      this.setAccepted();
      this.isOpen = false;
    },

    decline () {
      this.setDeclined();
      this.isOpen = false;
    },
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.cookieBanner {
  position: fixed;
  top: 6.8rem;
  left: 0;
  right: 0;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  background: rgba(20, 20, 20, 0.98) !important;
  border-bottom: 1px solid rgba(229, 9, 20, 0.3);

  @media (max-width: $breakpoint-small) {
    top: 6rem;
  }
}
</style>

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave {
  transform: translateY(0);
  opacity: 1;
}
</style>
