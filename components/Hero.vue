<template>
  <div>
    <div :class="$style.hero">
      <div :class="$style.backdrop">
        <div>
          <button
            :class="$style.play"
            type="button"
            aria-label="Watch Now"
            @click="watchNow">
            <!-- eslint-disable-next-line -->
            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55"><circle cx="27.5" cy="27.5" r="26.75" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.97 40.81L40.64 27.5 20.97 14.19v26.62z"/></svg>
          </button>

          <img
            v-if="backdrop"
            v-lazyload="backdrop"
            class="lazyload"
            :class="$style.image"
            :alt="name">
        </div>
      </div>

      <div :class="$style.pane">
        <transition
          appear
          name="hero">
          <div>
            <h1 :class="$style.name">
              <template v-if="isSingle">
                {{ name }}
              </template>

              <template v-else>
                <nuxt-link :to="{ name: `${type}-id`, params: { id: item.id } }">
                  {{ name }}
                </nuxt-link>
              </template>
            </h1>

            <div :class="$style.meta">
              <div
                v-if="stars || item.vote_count"
                :class="$style.rating">
                <div
                  v-if="stars"
                  :class="$style.stars">
                  <div :style="{ width: `${stars}%` }" />
                </div>

                <div v-if="item.vote_count > 0">
                  {{ item.vote_count | numberWithCommas }} Reviews
                </div>
              </div>

              <div :class="$style.info">
                <span v-if="item.number_of_seasons">Season {{ item.number_of_seasons }}</span>
                <span v-if="yearStart">{{ yearStart }}</span>
                <span v-if="item.runtime">{{ item.runtime | runtime }}</span>
                <span v-if="cert">Cert. {{ cert }}</span>
              </div>
            </div>

            <div :class="$style.desc">
              {{ item.overview | truncate(200) }}
            </div>

            <div :class="$style.buttons">
              <button
                class="button button--primary"
                :class="$style.watchNow"
                type="button"
                @click="watchNow">
                <!-- eslint-disable-next-line -->
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>
                <span class="txt">{{ watchCtaLabel }}</span>
                <span
                  v-if="watchCtaSublabel"
                  :class="$style.watchSub">{{ watchCtaSublabel }}</span>
              </button>

              <WatchlistButton :item="item" :show-text="true" />

              <button
                v-if="trailer"
                class="button button--icon"
                :class="$style.trailer"
                type="button"
                @click="openModal">
                <!-- eslint-disable-next-line -->
                <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M3 22v-20l18 10-18 10z"/></svg></span>
                <span class="txt">Watch Trailer</span>
              </button>
            </div>

            <button
              v-if="resumeRecord && !resumeRecord.completed"
              type="button"
              :class="$style.startOver"
              @click="watchFromBeginning">
              Start from beginning
            </button>
          </div>
        </transition>
      </div>
    </div>

    <Modal
      v-if="modalVisible"
      :data="trailer"
      type="iframe"
      @close="closeModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { name, stars, yearStart, cert, backdrop, trailer } from '~/mixins/Details';
import Modal from '~/components/Modal';
import WatchlistButton from '~/components/WatchlistButton';
import ViewingTracker from '~/mixins/ViewingTracker';

export default {
  components: {
    Modal,
    WatchlistButton,
  },

  mixins: [
    name,
    stars,
    yearStart,
    cert,
    backdrop,
    trailer,
    ViewingTracker,
  ],

  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      isSingle: this.item.id === this.$route.params.id,
      modalVisible: false,
    };
  },

  computed: {
    ...mapGetters('viewingHistory', ['lastWatchedForMedia']),

    type () {
      return this.item.title ? 'movie' : 'tv';
    },

    resumeRecord () {
      // Only show Resume when this Hero is for the current detail page, not
      // when it's used as a featured promo on listings. Compare by route name +
      // id (coerced - route params are strings, item.id is numeric from TMDb).
      const expectedRoute = `${this.type}-id`;
      if (this.$route.name !== expectedRoute) return null;
      if (Number(this.$route.params.id) !== Number(this.item.id)) return null;
      return this.lastWatchedForMedia({
        media_type: this.type,
        media_id: this.item.id,
      });
    },

    watchCtaLabel () {
      const r = this.resumeRecord;
      if (!r) {
        return this.type === 'tv' ? 'Play S1:E1' : 'Play';
      }
      if (r.completed && this.type === 'movie') {
        return 'Watch again';
      }
      if (this.type === 'tv') {
        if (r.completed) {
          // user finished this episode - default to Resume next-up if any
          return `Resume S${r.season_number}:E${r.episode_number}`;
        }
        return `Resume S${r.season_number}:E${r.episode_number}`;
      }
      return 'Resume';
    },

    watchCtaSublabel () {
      const r = this.resumeRecord;
      if (!r || r.completed) return null;
      const remainingSec = (r.total_duration || 0) - (r.watch_duration || 0);
      if (remainingSec <= 0) return null;
      const mins = Math.max(1, Math.round(remainingSec / 60));
      if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m ? `${h}h ${m}m left` : `${h}h left`;
      }
      return `${mins}m left`;
    },
  },

  methods: {
    openModal () {
      this.modalVisible = true;
    },

    closeModal () {
      this.modalVisible = false;
    },

    buildWatchQuery (override = {}) {
      const r = this.resumeRecord;
      const q = { tab: 'watch' };
      if (this.type === 'tv') {
        if (r && !override.fromStart) {
          q.s = r.season_number;
          q.e = r.episode_number;
        } else {
          q.s = 1;
          q.e = 1;
        }
      }
      return q;
    },

    async watchNow () {
      await this.trackViewingStart(this.item);
      this.$router.push({
        name: `${this.type}-id`,
        params: { id: this.item.id },
        query: this.buildWatchQuery(),
      });
    },

    async watchFromBeginning () {
      await this.trackViewingStart(this.item);
      this.$router.push({
        name: `${this.type}-id`,
        params: { id: this.item.id },
        query: this.buildWatchQuery({ fromStart: true }),
      });
    },
  },
};
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 50rem;
  color: #999;
  background-color: #000;
  position: relative;
  overflow: hidden;

  @media (min-width: $breakpoint-xsmall) {
    height: 60rem;
  }

  @media (min-width: $breakpoint-medium) {
    position: relative;
    display: block;
    height: 0;
    padding-bottom: 56.25%; // 16:9 aspect ratio
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(229, 9, 20, 0.15) 0%, transparent 60%);
    pointer-events: none;
    z-index: 1;
  }
}

.backdrop {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;

  @media (min-width: $breakpoint-medium) {
    position: absolute;
    top: 0;
    right: 0;
    display: block;
    width: 71.1%;
    height: 100%;
  }

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    content: '';
    background: linear-gradient(to top, 
      rgba(0, 0, 0, 1) 0%, 
      rgba(0, 0, 0, 0.8) 20%,
      rgba(0, 0, 0, 0.4) 50%, 
      rgba(0, 0, 0, 0.2) 70%,
      rgba(0, 0, 0, 0.1) 100%
    );
    z-index: 1;

    @media (min-width: $breakpoint-medium) {
      background: linear-gradient(to right, 
        rgba(0, 0, 0, 1) 0%, 
        rgba(0, 0, 0, 0.95) 10%,
        rgba(0, 0, 0, 0.8) 25%, 
        rgba(0, 0, 0, 0.3) 50%, 
        transparent 70%, 
        transparent 100%
      );
    }
  }

  > div {
    width: 100%;

    @media (min-width: $breakpoint-medium) {
      display: inline;
    }
  }
}

.play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  padding: 2rem;
  margin: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (min-width: $breakpoint-medium) {
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary-color, #B81D13);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
  }

  &:hover {
    background: rgba(229, 9, 20, 0.95);
    border-color: transparent;
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 12px 48px rgba(229, 9, 20, 0.6);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translate(-50%, -50%) scale(1.05);
  }

  svg {
    display: block;
    width: 4rem;
    height: 4rem;
    
    circle, path {
      transition: all 0.3s ease;
    }
  }

  &:hover svg {
    circle {
      stroke: #fff;
    }
    path {
      stroke: #fff;
      fill: #fff;
    }
  }
}

.image {
  display: inline-block;
  max-width: none;
  height: 100%;

  @media (max-width: $breakpoint-medium - 1) {
    width: 100%;
    object-fit: cover;
  }
}

.pane {
  padding: 0 1.5rem 1.5rem;
  position: relative;
  z-index: 2;

  @media (min-width: $breakpoint-small) {
    padding: 0 4rem 4rem;
  }

  @media (min-width: $breakpoint-medium) {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    width: 55%;
    height: 100%;
    padding: 5rem 4rem;
  }

  @media (min-width: $breakpoint-large) {
    padding-right: 5rem;
    padding-left: 5rem;
  }

  @media (min-width: $breakpoint-xlarge) {
    width: 43%;
  }
}

.name {
  margin: 0 0 1.4rem;
  font-size: 2.8rem;
  line-height: 1.1;
  color: #fff;
  letter-spacing: $letter-spacing;

  @media (min-width: $breakpoint-small) {
    margin-bottom: 1.8rem;
  }

  @media (min-width: $breakpoint-large) {
    font-size: 2.4vw;
  }
}

.meta {
  font-size: 1.4rem;

  @media (min-width: $breakpoint-small) {
    display: flex;
  }

  @media (min-width: 1650px) {
    font-size: 0.9vw;
  }
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 1.3rem;

  @media (min-width: $breakpoint-small) {
    margin: 0 1.2rem 0 0;
  }
}

.stars {
  position: relative;
  display: inline-block;
  margin-right: 1rem;
  font-size: 1.4rem;
  color: #ddd;

  @media (min-width: $breakpoint-small) {
    font-size: 1.7rem;
  }

  &::before {
    content: '★★★★★';
    display: block;
  }

  > div {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    color: $primary-color;
    
    &::before {
      content: '★★★★★';
      display: block;
    }
  }
}

.info {
  display: flex;
  align-items: center;

  span {
    margin-right: 0.9rem;
  }
}

.desc {
  display: block;
  margin-top: 2.5rem;
  font-size: 1.5rem;
  color: #fff;

  @media (max-width: $breakpoint-small - 1) {
    display: none;
  }

  @media (min-width: 1650px) {
    font-size: 0.9vw;
  }
}

.buttons {
  display: flex;
  gap: 1.5rem;
  margin-top: 3rem;

  @media (max-width: $breakpoint-medium - 1) {
    display: none;
  }

  @media (min-width: 1650px) {
    font-size: 0.9vw;
  }
}

.watchNow {
  background: linear-gradient(135deg, #E50914 0%, #B81D13 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.watchSub {
  margin-left: 0.4rem;
  padding-left: 0.8rem;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  font-weight: 500;
  font-size: 0.85em;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.9;
}

.startOver {
  display: inline-block;
  margin-top: 1.2rem;
  padding: 0.4rem 0;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.3rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: $letter-spacing;

  &:hover,
  &:focus-visible {
    color: #fff;
    outline: none;
  }

  @media (max-width: $breakpoint-medium - 1) {
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    box-shadow: 0 8px 32px rgba(229, 9, 20, 0.6);
    transform: translateY(-3px);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  .icon {
    margin-right: 0.8rem;
    position: relative;
    z-index: 1;
  }

  .txt {
    position: relative;
    z-index: 1;
  }
}

.trailer {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
}
</style>

<style lang="scss">
.hero-enter-active,
.hero-leave-active {
  transition: transform .75s cubic-bezier(.4, .25, .3, 1), opacity .3s cubic-bezier(.4, .25, .3, 1);
}

.hero-enter,
.hero-leave-to {
  opacity: 0;
  transform: translate3d(0, 2rem, 0);
}

.hero-enter-to,
.hero-leave {
  opacity: 1;
  transform: translateZ(0);
}
</style>
