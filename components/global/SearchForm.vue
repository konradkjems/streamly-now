<template>
  <div :class="$style.form">
    <form
      autocomplete="off"
      @submit.prevent>
      <label
        class="visuallyhidden"
        for="search">Search</label>

      <div :class="$style.field">
        <input
          id="search"
          ref="input"
          v-model.trim="query"
          name="search"
          type="text"
          placeholder="Search for a movie, tv show or person..."
          @keyup="goToRoute"
          @blur="unFocus">

        <div :class="$style.actions">
          <button
            type="button"
            :class="$style.advancedBtn"
            aria-label="Advanced Search"
            @click="openAdvancedSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          <button
            v-if="showButton"
            type="button"
            aria-label="Close"
            @click="goBack">
            <!-- eslint-disable-next-line -->
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"><path d="M.75.75l13.5 13.5M14.25.75L.75 14.25"/></g></svg>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data () {
    return {
      query: this.$route.query.q ? this.$route.query.q : '',
    };
  },

  computed: {
    showButton () {
      return this.$route.name === 'search';
    },

    ...mapState('search', [
      'fromPage',
    ]),
  },

  mounted () {
    this.$refs.input.focus();
  },

  methods: {
    goToRoute () {
      if (this.query) {
        this.$router.push({
          name: 'search',
          query: { q: this.query },
        });
      } else {
        this.$router.push({
          path: this.fromPage,
        });
      }
    },

    goBack () {
      this.query = '';

      this.$router.push({
        path: this.fromPage,
      });
    },

    unFocus (e) {
      if (this.$route.name !== 'search') {
        const target = e.relatedTarget;

        if (!target || !target.classList.contains('search-toggle')) {
          this.query = '';
          this.$store.commit('search/closeSearch');
        }
      }
    },

    openAdvancedSearch() {
      this.$emit('open-advanced-search');
    }
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.form {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100vw;
  z-index: 1001;

  // Remove any left offset at large screens to ensure full width
  @media (min-width: $breakpoint-large) {
    left: 0;
    width: 100vw;
  }

  input[type='text'] {
    flex: 1;
    height: 6rem;
    padding: 2.1rem 1.5rem;
    font-size: 1.6rem;
    color: #fff;
    background: none;
    border: 0;
    outline: 0;

    @media (min-width: $breakpoint-large) {
      height: 8rem;
      padding: 3.1rem 5rem;
    }
  }

  button {
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    background: none;

    @media (min-width: $breakpoint-large) {
      padding: 0 5rem;
    }
  }
}

.field {
  display: flex;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.advancedBtn {
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
</style>
