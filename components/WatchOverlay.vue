<template>
  <transition name="watch-overlay">
    <div
      v-if="visible"
      :class="$style.overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="dialogLabel">
      <header :class="$style.topBar">
        <button
          type="button"
          :class="$style.iconBtn"
          aria-label="Close player"
          @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div :class="$style.titleStack">
          <div :class="$style.kicker">{{ kicker }}</div>
          <div :class="$style.title">{{ headerTitle }}</div>
        </div>

        <button
          type="button"
          :class="$style.iconBtn"
          aria-label="Close"
          @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div :class="$style.stage">
        <VidKingPlayer
          ref="player"
          :movie-id="mediaId"
          :title="title"
          :poster-path="posterPath"
          :type="type"
          :season="type === 'tv' ? activeSeason : null"
          :episode="type === 'tv' ? activeEpisode : null"
          :fullscreen="true"
          @ended="onEnded"
          @playing="onPlaying"
          @paused="onPaused" />

        <UpNextOverlay
          v-if="type === 'tv'"
          :visible="upNextVisible"
          :next-episode="nextEpisodeData"
          :next-season="nextSeason"
          :next-episode-number="nextEpisodeNumber"
          @play-next="playNext"
          @cancel="upNextVisible = false" />
      </div>

      <EpisodeRail
        v-if="type === 'tv' && railVisible"
        :class="$style.rail"
        :tv-show-id="mediaId"
        :seasons="seasons"
        :initial-season="activeSeason"
        :current-season="activeSeason"
        :current-episode="activeEpisode"
        @play-episode="onPlayEpisode" />
    </div>
  </transition>
</template>

<script>
import VidKingPlayer from '~/components/VidKingPlayer';
import UpNextOverlay from '~/components/UpNextOverlay';
import EpisodeRail from '~/components/tv/EpisodeRail';
import { getTvShowEpisodes } from '~/api';

export default {
  components: {
    VidKingPlayer,
    UpNextOverlay,
    EpisodeRail,
  },

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mediaId: {
      type: [String, Number],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: (v) => ['movie', 'tv'].includes(v),
    },
    posterPath: {
      type: String,
      default: null,
    },
    seasons: {
      // [{ season_number, episode_count, name }, ...]
      type: Array,
      default: () => [],
    },
    initialSeason: {
      type: Number,
      default: 1,
    },
    initialEpisode: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      activeSeason: this.initialSeason,
      activeEpisode: this.initialEpisode,
      upNextVisible: false,
      nextEpisodeData: null,
      isPlaying: false,
      idleTimer: null,
      railVisible: true,
    };
  },

  computed: {
    seasonNumbers() {
      return this.seasons.map((s) => s.season_number);
    },

    currentSeasonMeta() {
      return this.seasons.find((s) => s.season_number === this.activeSeason);
    },

    episodesInCurrentSeason() {
      const meta = this.currentSeasonMeta;
      return meta ? meta.episode_count : null;
    },

    nextSeason() {
      if (this.type !== 'tv') return null;
      if (!this.episodesInCurrentSeason) return this.activeSeason;
      if (this.activeEpisode < this.episodesInCurrentSeason) {
        return this.activeSeason;
      }
      // roll over to next season if available
      const idx = this.seasonNumbers.indexOf(this.activeSeason);
      if (idx >= 0 && idx < this.seasonNumbers.length - 1) {
        return this.seasonNumbers[idx + 1];
      }
      return null;
    },

    nextEpisodeNumber() {
      if (this.type !== 'tv') return null;
      if (!this.episodesInCurrentSeason) return this.activeEpisode + 1;
      if (this.activeEpisode < this.episodesInCurrentSeason) {
        return this.activeEpisode + 1;
      }
      // crossing seasons starts at episode 1
      return this.nextSeason ? 1 : null;
    },

    hasNextEpisode() {
      return this.type === 'tv' && this.nextSeason && this.nextEpisodeNumber;
    },

    kicker() {
      if (this.type === 'tv') {
        return `Season ${this.activeSeason} · Episode ${this.activeEpisode}`;
      }
      return 'Now playing';
    },

    headerTitle() {
      return this.title;
    },

    dialogLabel() {
      return `Watching ${this.title}`;
    },
  },

  watch: {
    visible(open) {
      if (open) {
        this.activeSeason = this.initialSeason;
        this.activeEpisode = this.initialEpisode;
        this.upNextVisible = false;
        this.nextEpisodeData = null;
        this.lockScroll();
        this.bindKeys();
        this.scheduleIdleHide();
      } else {
        this.unlockScroll();
        this.unbindKeys();
        this.clearIdleTimer();
        this.railVisible = true;
      }
    },
    initialSeason(v) {
      if (this.visible) this.activeSeason = v;
    },
    initialEpisode(v) {
      if (this.visible) this.activeEpisode = v;
    },
  },

  beforeDestroy() {
    this.unlockScroll();
    this.unbindKeys();
    this.clearIdleTimer();
  },

  methods: {
    close() {
      this.$emit('close');
    },

    onPlayEpisode({ seasonNumber, episodeNumber }) {
      this.upNextVisible = false;
      this.activeSeason = Number(seasonNumber);
      this.activeEpisode = Number(episodeNumber);
    },

    async onEnded() {
      if (!this.hasNextEpisode) return;
      try {
        const seasonData = await getTvShowEpisodes(this.mediaId, this.nextSeason);
        const ep = (seasonData.episodes || []).find(
          (e) => Number(e.episode_number) === Number(this.nextEpisodeNumber)
        );
        this.nextEpisodeData = ep || null;
      } catch (err) {
        console.error('Failed to load next episode metadata:', err);
        this.nextEpisodeData = null;
      }
      this.upNextVisible = true;
    },

    onPlaying() {
      this.isPlaying = true;
      this.scheduleIdleHide();
    },

    onPaused() {
      this.isPlaying = false;
      this.railVisible = true;
      this.clearIdleTimer();
    },

    playNext() {
      const nextS = this.nextSeason;
      const nextE = this.nextEpisodeNumber;
      this.upNextVisible = false;
      this.nextEpisodeData = null;
      if (nextS && nextE) {
        this.activeSeason = nextS;
        this.activeEpisode = nextE;
      }
    },

    scheduleIdleHide() {
      this.clearIdleTimer();
      this.idleTimer = setTimeout(() => {
        if (this.isPlaying) this.railVisible = false;
      }, 4000);
    },

    clearIdleTimer() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;
      }
    },

    onMouseMove() {
      this.railVisible = true;
      if (this.isPlaying) this.scheduleIdleHide();
    },

    handleKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    },

    bindKeys() {
      if (process.client) {
        document.addEventListener('keydown', this.handleKey);
        document.addEventListener('mousemove', this.onMouseMove);
      }
    },

    unbindKeys() {
      if (process.client) {
        document.removeEventListener('keydown', this.handleKey);
        document.removeEventListener('mousemove', this.onMouseMove);
      }
    },

    lockScroll() {
      if (process.client) {
        this.prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    },

    unlockScroll() {
      if (process.client) {
        document.body.style.overflow = this.prevOverflow || '';
      }
    },
  },
};
</script>

<style lang="scss" module>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: #000;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.topBar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 1.6rem 2rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 70%, transparent 100%);
}

.iconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.4rem;
  height: 4.4rem;
  padding: 0;
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.12);
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.6);
  }
}

.titleStack {
  flex: 1;
  min-width: 0;
}

.kicker {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.55);
}

.title {
  font-size: 1.6rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.rail {
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .topBar {
    padding: 1rem 1.2rem;
  }

  .title {
    font-size: 1.4rem;
  }
}

.watch-overlay-enter-active,
.watch-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.watch-overlay-enter,
.watch-overlay-leave-to {
  opacity: 0;
}
</style>
