<template>
  <div>
    <!-- Desktop Navigation -->
    <nav :class="[$style.nav, $style.navDesktop]">
      <div :class="$style.navContent">
        <!-- Netflix-style Logo -->
        <div :class="$style.logo">
          <nuxt-link
            exact
            :to="{ name: 'index' }"
            aria-label="Home">
            <span :class="$style.logoText">STREAMLY</span>
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

    <!-- Mobile Header with Logo -->
    <header :class="$style.mobileHeader">
      <div :class="$style.mobileHeaderContent">
        <!-- Mobile Logo -->
        <div :class="$style.mobileLogo">
          <nuxt-link
            exact
            :to="{ name: 'index' }"
            aria-label="Home">
            <span :class="$style.mobileLogoText">STREAMLY</span>
          </nuxt-link>
        </div>
        
        <!-- Mobile Header Actions -->
        <div :class="$style.mobileHeaderActions">
          <!-- Search Button -->
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
          
          <!-- User Menu (Mobile) -->
          <div v-if="isAuthenticated" :class="$style.mobileUserMenu">
            <button
              :class="$style.userBtn"
              type="button"
              aria-label="User Menu"
              @click="toggleUserMenu">
              <span :class="$style.userAvatar">
                {{ userInitials }}
              </span>
            </button>
            
            <!-- User Dropdown (Mobile) -->
            <div v-if="userMenuOpen" :class="$style.mobileUserDropdown">
              <div :class="$style.userInfo">
                <div :class="$style.userName">{{ currentProfile?.display_name || 'User' }}</div>
                <div :class="$style.userEmail">{{ currentUser?.email }}</div>
              </div>
              <div :class="$style.userActions">
                <nuxt-link :to="{ name: 'profile' }" :class="$style.userLink" @click="closeUserMenu">
                  Profile
                </nuxt-link>
                <nuxt-link :to="{ name: 'watchlist' }" :class="$style.userLink" @click="closeUserMenu">
                  My Watchlist
                </nuxt-link>
                <button :class="$style.userLink" type="button" @click="handleSignOut">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <!-- Auth Buttons (Mobile) -->
          <div v-else :class="$style.mobileAuthButtons">
            <nuxt-link :to="{ name: 'auth-signin' }" :class="$style.mobileAuthBtn">
              Sign In
            </nuxt-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <nav :class="$style.mobileBottomNav">
      <div :class="$style.mobileNavContent">
        <!-- Home -->
        <nuxt-link
          exact
          :to="{ name: 'index' }"
          :class="[$style.mobileNavItem, { [$style.active]: $route.name === 'index' }]"
          @click.native="closeMobileMenu">
          <svg :class="$style.mobileNavIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span :class="$style.mobileNavLabel">Home</span>
        </nuxt-link>

        <!-- Movies -->
        <nuxt-link
          :to="{ name: 'movie' }"
          :class="[$style.mobileNavItem, { [$style.active]: $route.name === 'movie' || $route.name === 'movie-id' }]"
          @click.native="closeMobileMenu">
          <svg :class="$style.mobileNavIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span :class="$style.mobileNavLabel">Movies</span>
        </nuxt-link>

        <!-- TV Shows -->
        <nuxt-link
          :to="{ name: 'tv' }"
          :class="[$style.mobileNavItem, { [$style.active]: $route.name === 'tv' || $route.name === 'tv-id' }]"
          @click.native="closeMobileMenu">
          <svg :class="$style.mobileNavIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
            <path d="m17 2-5 5-5-5"/>
          </svg>
          <span :class="$style.mobileNavLabel">TV Shows</span>
        </nuxt-link>

        <!-- Watchlist -->
        <nuxt-link
          v-if="isAuthenticated"
          :to="{ name: 'watchlist' }"
          :class="[$style.mobileNavItem, { [$style.active]: $route.name === 'watchlist' }]"
          @click.native="closeMobileMenu">
          <svg :class="$style.mobileNavIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
          <span :class="$style.mobileNavLabel">Watchlist</span>
        </nuxt-link>

        <!-- Search -->
        <button
          :class="[$style.mobileNavItem, $style.mobileNavButton]"
          type="button"
          aria-label="Search"
          @click="toggleSearch">
          <svg :class="$style.mobileNavIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span :class="$style.mobileNavLabel">Search</span>
        </button>
      </div>
    </nav>
  </div>
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

    closeUserMenu() {
      this.userMenuOpen = false;
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

// Desktop Navigation
.navDesktop {
  @media (max-width: $breakpoint-small) {
    display: none;
  }
}

// Mobile Bottom Navigation
.mobileBottomNav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 0 calc(0.8rem + env(safe-area-inset-bottom));
  margin: 0;
  transform: translateZ(0); // Force hardware acceleration
  -webkit-transform: translateZ(0);

  @media (max-width: $breakpoint-small) {
    display: block;
  }

  // Override any global nav styles
  * {
    box-sizing: border-box;
  }
}

.mobileNavContent {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-around !important;
  align-items: center !important;
  max-width: 100% !important;
  width: 100% !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 1rem !important;
  flex-wrap: nowrap !important;
  overflow: hidden;
}

.mobileNavItem {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.8rem 0.4rem !important;
  text-decoration: none !important;
  color: #b3b3b3 !important;
  transition: all 0.3s ease;
  border-radius: 8px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  flex-shrink: 0 !important;
  outline: 0 !important;
  -webkit-tap-highlight-color: transparent;
  width: auto !important;
  height: auto !important;

  &:hover,
  &:focus {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: $primary-color;
    background: rgba(229, 9, 20, 0.1);

    .mobileNavIcon {
      stroke: $primary-color;
    }

    .mobileNavLabel {
      color: $primary-color;
      font-weight: 600;
    }
  }
}

.mobileNavButton {
  background: none !important;
  border: none !important;
  cursor: pointer !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.8rem 0.4rem !important;
  text-decoration: none !important;
  color: #b3b3b3 !important;
  transition: all 0.3s ease;
  border-radius: 8px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  flex-shrink: 0 !important;
  outline: 0 !important;
  -webkit-tap-highlight-color: transparent;
  width: auto !important;
  height: auto !important;
}

.mobileNavIcon {
  width: 2.4rem;
  height: 2.4rem;
  stroke: currentColor;
  stroke-width: 1.5;
  margin-bottom: 0.4rem;
  transition: all 0.3s ease;
}

.mobileNavLabel {
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
  text-align: center;
  line-height: 1.2;
  transition: all 0.3s ease;
}

// Mobile Header Styles
.mobileHeader {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: $breakpoint-small) {
    display: block;
  }
}

.mobileHeaderContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  max-width: 100%;
}

.mobileLogo {
  flex-shrink: 0;
  
  a {
    text-decoration: none;
    outline: 0;
    -webkit-tap-highlight-color: transparent;
  }
}

.mobileLogoText {
  font-size: 2.4rem;
  font-weight: 700;
  color: $primary-color;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    color: lighten($primary-color, 10%);
    text-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
  }
}

.mobileHeaderActions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.mobileUserMenu {
  position: relative;
  display: flex;
  align-items: center;
}

.mobileUserDropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1002;
  width: 24rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.6rem;
  margin-top: 0.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mobileAuthButtons {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.mobileAuthBtn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
  outline: 0;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }
}

// Adjust main content padding for mobile header and bottom nav
@media (max-width: $breakpoint-small) {
  :global(.main-content) {
    padding-top: 7rem; // Space for mobile header
    padding-bottom: 8rem; // Space for bottom navigation
  }
  
  :global(html), :global(body) {
    position: relative !important;
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

