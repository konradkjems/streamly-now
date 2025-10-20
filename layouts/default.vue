<template>
  <div>
    <CookieConsent />
    <InstallPrompt />

    <transition name="slidedown">
      <SearchForm 
        v-if="searchOpen" 
        @open-advanced-search="showAdvancedSearch = true" />
    </transition>

    <!-- Advanced Search Modal -->
    <AdvancedSearchForm 
      v-if="showAdvancedSearch"
      @close="showAdvancedSearch = false"
      @search-completed="handleAdvancedSearchCompleted" />

    <!-- Shortcuts Modal -->
    <ShortcutsModal />

    <!-- Toast Notifications -->
    <Toast />

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
import AdvancedSearchForm from '~/components/search/AdvancedSearchForm';
import ShortcutsModal from '~/components/global/ShortcutsModal';
import Toast from '~/components/global/Toast';
import Nav from '~/components/global/Nav';
import Footer from '~/components/global/Footer';

export default {
  components: {
    CookieConsent,
    InstallPrompt,
    SearchForm,
    AdvancedSearchForm,
    ShortcutsModal,
    Toast,
    Nav,
    Footer,
  },

  data() {
    return {
      showAdvancedSearch: false
    }
  },

  computed: {
    ...mapState('search', [
      'searchOpen',
    ]),
  },

  methods: {
    handleAdvancedSearchCompleted() {
      this.showAdvancedSearch = false
      this.$router.push({ name: 'search' })
    }
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
    padding-top: 7rem; // Space for mobile header with logo
    padding-bottom: 8rem; // Space for mobile bottom navigation
  }
}

.footer-desktop {
  @media (max-width: $breakpoint-small) {
    display: none; // Hide footer on mobile since we have bottom navigation
  }
}
</style>
