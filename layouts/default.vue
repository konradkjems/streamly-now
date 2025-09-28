<template>
  <div>
    <CookieConsent />
    <InstallPrompt />

    <transition name="slidedown">
      <SearchForm v-if="searchOpen" />
    </transition>

    <Nav />
    <main class="main-content">
      <nuxt />
    </main>
    <Footer class="footer-desktop" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CookieConsent from '~/components/global/CookieConsent';
import InstallPrompt from '~/components/global/InstallPrompt';
import SearchForm from '~/components/global/SearchForm';
import Nav from '~/components/global/Nav';
import Footer from '~/components/global/Footer';

export default {
  components: {
    CookieConsent,
    InstallPrompt,
    SearchForm,
    Nav,
    Footer,
  },

  computed: {
    ...mapState('search', [
      'searchOpen',
    ]),
  },

  async mounted() {
    // Auth initialization is now handled in the Supabase plugin
    // Just ensure we fetch user data if already authenticated
    if (this.$store.getters['auth/isAuthenticated']) {
      await this.$store.dispatch('watchlist/fetchWatchlist')
      await this.$store.dispatch('viewingHistory/fetchHistory')
    }
  },
};
</script>

<style lang="scss">
@import '~/assets/css/utilities/_variables.scss';

.main-content {
  padding-top: 6.8rem; // Account for fixed navigation height
  min-height: 100vh;

  @media (max-width: $breakpoint-small) {
    padding-top: 6rem; // Smaller padding for mobile
    padding-bottom: 8rem; // Space for mobile bottom navigation
  }
}

.footer-desktop {
  @media (max-width: $breakpoint-small) {
    display: none; // Hide footer on mobile since we have bottom navigation
  }
}
</style>
