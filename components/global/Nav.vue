<template>
  <nav :class="$style.nav">
    <div :class="$style.navContent">
      <!-- Netflix-style Logo -->
      <div :class="$style.logo">
        <nuxt-link
          exact
          :to="{ name: 'index' }"
          aria-label="Home">
          <span :class="$style.logoText">Streamly</span>
        </nuxt-link>
      </div>

      <!-- Desktop Navigation Links -->
      <ul :class="$style.navLinks">
        <li>
          <nuxt-link
            exact
            :to="{ name: 'index' }"
            :class="$style.navLink">
            Home
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            :to="{ name: 'movie' }"
            :class="$style.navLink">
            Movies
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            :to="{ name: 'tv' }"
            :class="$style.navLink">
            TV Shows
          </nuxt-link>
        </li>
      </ul>

      <!-- Right Side Actions -->
      <div :class="$style.navActions">
        <!-- User Menu (Desktop) -->
        <div v-if="isAuthenticated" :class="$style.userMenu">
          <button
            :class="$style.userBtn"
            type="button"
            aria-label="User Menu"
            @click="toggleUserMenu">
            <span :class="$style.userAvatar">
              {{ userInitials }}
            </span>
          </button>
          
          <!-- User Dropdown -->
          <div v-if="userMenuOpen" :class="$style.userDropdown">
            <div :class="$style.userInfo">
              <div :class="$style.userName">{{ currentProfile?.display_name || 'User' }}</div>
              <div :class="$style.userEmail">{{ currentUser?.email }}</div>
            </div>
            <div :class="$style.userActions">
              <nuxt-link :to="{ name: 'profile' }" :class="$style.userLink">
                Profile
              </nuxt-link>
              <nuxt-link :to="{ name: 'watchlist' }" :class="$style.userLink">
                My Watchlist
              </nuxt-link>
              <button :class="$style.userLink" type="button" @click="handleSignOut">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <!-- Auth Buttons (Not Authenticated) -->
        <div v-else :class="$style.authButtons">
          <nuxt-link :to="{ name: 'auth-signin' }" :class="$style.authBtn">
            Sign In
          </nuxt-link>
          <nuxt-link :to="{ name: 'auth-signup' }" :class="$style.authBtnPrimary">
            Sign Up
          </nuxt-link>
        </div>

        <button
          class="search-toggle"
          :class="$style.searchBtn"
          type="button"
          aria-label="Search"
          aria-haspopup="true"
          :aria-expanded="`${searchOpen}`"
          @click="toggleSearch">
          <!-- eslint-disable-next-line -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-miterlimit="10"><path d="M16.4 16.7l6.3 6.5"/><ellipse cx="10.5" cy="9.8" rx="9.2" ry="9.1"/></g></svg>
        </button>

        <!-- Mobile Menu Button -->
        <button
          :class="$style.mobileMenuBtn"
          type="button"
          aria-label="Menu"
          aria-expanded="`${mobileMenuOpen}`"
          @click="toggleMobileMenu">
          <span :class="[$style.hamburger, { [$style.hamburgerOpen]: mobileMenuOpen }]">
            <span :class="$style.hamburgerLine"></span>
            <span :class="$style.hamburgerLine"></span>
            <span :class="$style.hamburgerLine"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <transition name="mobile-nav">
      <div v-if="mobileMenuOpen" :class="$style.mobileNav">
        <div :class="$style.mobileNavContent">
          <ul :class="$style.mobileNavLinks">
            <li>
              <nuxt-link
                exact
                :to="{ name: 'index' }"
                :class="$style.mobileNavLink"
                @click="closeMobileMenu">
                Home
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                :to="{ name: 'movie' }"
                :class="$style.mobileNavLink"
                @click="closeMobileMenu">
                Movies
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                :to="{ name: 'tv' }"
                :class="$style.mobileNavLink"
                @click="closeMobileMenu">
                TV Shows
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <!-- Mobile Navigation Backdrop -->
    <transition name="mobile-nav-backdrop">
      <div v-if="mobileMenuOpen" :class="$style.mobileNavBackdrop" @click="closeMobileMenu"></div>
    </transition>
  </nav>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
    };
  },

  computed: {
    ...mapState('search', [
      'searchOpen',
    ]),
    ...mapGetters('auth', ['isAuthenticated', 'currentUser', 'currentProfile']),

    userInitials() {
      if (this.currentProfile?.display_name) {
        return this.currentProfile.display_name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return 'U';
    },
  },

  methods: {
    ...mapActions('auth', ['signOut']),

    toggleSearch () {
      if (this.$route.name !== 'search') {
        this.$store.commit('search/toggleSearch');
      }
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      // Prevent body scroll when menu is open
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    },

    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },

    async handleSignOut() {
      try {
        await this.signOut();
        this.userMenuOpen = false;
        this.$router.push('/');
      } catch (error) {
        console.error('Sign out error:', error);
      }
    },
  },

  mounted() {
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.userMenuOpen = false;
      }
    });
  },

  beforeDestroy() {
    // Clean up body overflow when component is destroyed
    document.body.style.overflow = '';
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 6.8rem;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: $breakpoint-small) {
    height: 6rem;
  }

  &:hover {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
  }
}

.navContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 4rem;

  @media (max-width: $breakpoint-medium) {
    padding: 0 2rem;
  }

  @media (max-width: $breakpoint-small) {
    padding: 0 1.6rem;
  }
}

.logo {
  flex-shrink: 0;

  a {
    text-decoration: none;
    outline: 0;
  }
}

.logoText {
  font-size: 2.8rem;
  font-weight: 700;
  color: $primary-color;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  transition: color 0.3s ease;

  @media (max-width: $breakpoint-small) {
    font-size: 2.4rem;
  }

  &:hover {
    color: #fff;
  }
}

.navLinks {
  display: flex;
  align-items: center;
  gap: 2.4rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: $breakpoint-medium) {
    gap: 1.6rem;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}

.navLink {
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  outline: 0;
  padding: 0.8rem 1.2rem;
  border-radius: 4px;
  position: relative;

  &:hover {
    color: $primary-color;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.nuxt-link-active {
    color: $primary-color;
    font-weight: 600;
    background-color: rgba(229, 9, 20, 0.15);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background-color: $primary-color;
    }
  }
}

.navActions {
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.searchBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  svg {
    width: 2rem;
    height: 2rem;
    stroke: #fff;
  }
}

// Mobile Menu Button
.mobileMenuBtn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  outline: 0;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s ease;

  @media (max-width: $breakpoint-small) {
    display: flex;
  }

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
}

// Hamburger Icon
.hamburger {
  position: relative;
  width: 2rem;
  height: 1.4rem;
}

.hamburgerLine {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fff;
  transition: all 0.3s ease;

  &:nth-child(1) {
    top: 0;
  }

  &:nth-child(2) {
    top: 50%;
    transform: translateY(-50%);
  }

  &:nth-child(3) {
    bottom: 0;
  }
}

.hamburgerOpen {
  .hamburgerLine {
    &:nth-child(1) {
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }

    &:nth-child(2) {
      opacity: 0;
    }

    &:nth-child(3) {
      bottom: 50%;
      transform: translateY(50%) rotate(-45deg);
    }
  }
}

// Mobile Navigation Overlay
.mobileNav {
  position: fixed;
  top: 6.8rem;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);

  @media (max-width: $breakpoint-small) {
    top: 6rem;
  }
}

.mobileNavContent {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.6rem;
}

.mobileNavLinks {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobileNavLink {
  display: block;
  padding: 1.6rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:active {
    color: $primary-color;
    background-color: rgba(255, 255, 255, 0.05);
    padding-left: 1rem;
  }

  &.nuxt-link-active {
    color: $primary-color;
    background-color: rgba(229, 9, 20, 0.1);
    padding-left: 1rem;
  }
}

// Mobile Navigation Backdrop
.mobileNavBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.5);
}

// User Menu
.userMenu {
  position: relative;
}

.userBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.userAvatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border-radius: 50%;
}

.userDropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1002;
  width: 24rem;
  margin-top: 0.8rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.userInfo {
  padding: 1.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.userName {
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.4rem;
}

.userEmail {
  font-size: 1.2rem;
  color: #b3b3b3;
}

.userActions {
  padding: 0.8rem 0;
}

.userLink {
  display: block;
  width: 100%;
  padding: 1.2rem 1.6rem;
  font-size: 1.4rem;
  color: #fff;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

// Auth Buttons
.authButtons {
  display: flex;
  align-items: center;
  gap: 1.2rem;

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}

.authBtn {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
  outline: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.authBtnPrimary {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  outline: 0;

  &:hover {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-1px);
  }
}
</style>

<style lang="scss">
// Mobile Navigation Transitions
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-nav-enter,
.mobile-nav-leave-to {
  opacity: 0;
}

.mobile-nav-backdrop-enter-active,
.mobile-nav-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-nav-backdrop-enter,
.mobile-nav-backdrop-leave-to {
  opacity: 0;
}
</style>

