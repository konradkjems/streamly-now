<template>
  <div :class="$style.rail">
    <div :class="$style.head">
      <h3 :class="$style.title">Episodes</h3>
      <div :class="$style.seasonPicker">
        <label for="rail-season-select" :class="$style.seasonLabel">Season</label>
        <select
          id="rail-season-select"
          v-model.number="activeSeason"
          :class="$style.seasonSelect"
          @change="loadEpisodes">
          <option
            v-for="season in seasons"
            :key="`rail-season-${season}`"
            :value="season">
            Season {{ season }}
          </option>
        </select>
      </div>
    </div>

    <div :class="$style.scroller">
      <button
        v-for="episode in episodes"
        :key="`rail-ep-${episode.id || episode.episode_number}`"
        type="button"
        :class="[
          $style.card,
          { [$style.cardActive]: isActive(episode), [$style.cardCompleted]: isCompleted(episode) }
        ]"
        :aria-current="isActive(episode) ? 'true' : 'false'"
        :aria-label="`Play Season ${activeSeason} Episode ${episode.episode_number}: ${episode.name}`"
        @click="play(episode)">
        <div :class="$style.thumb">
          <img
            v-if="episode.still_path"
            :src="`${apiImgUrl}/w300${episode.still_path}`"
            :alt="episode.name"
            loading="lazy">
          <span v-else :class="$style.thumbFallback">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M8 5v14l11-7z"/></svg>
          </span>

          <div :class="$style.playOverlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
          </div>

          <div v-if="progressPercent(episode) > 0" :class="$style.progressBar">
            <div :style="{ width: progressPercent(episode) + '%' }" />
          </div>
        </div>

        <div :class="$style.meta">
          <div :class="$style.epNumber">
            <span v-if="isActive(episode)" :class="$style.nowDot" aria-hidden="true">●</span>
            E{{ episode.episode_number | numberWithDoubleDigits }}
          </div>
          <div :class="$style.epName">{{ episode.name }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { apiImgUrl, getTvShowEpisodes } from '~/api';

export default {
  props: {
    tvShowId: {
      type: [String, Number],
      required: true,
    },
    seasons: {
      type: Array,
      required: true, // [1, 2, 3, ...]
    },
    initialSeason: {
      type: Number,
      default: 1,
    },
    currentSeason: {
      type: Number,
      default: null,
    },
    currentEpisode: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      apiImgUrl,
      activeSeason: this.initialSeason,
      episodesBySeason: {},
    };
  },

  computed: {
    ...mapGetters('viewingHistory', ['watchProgress']),

    episodes() {
      return this.episodesBySeason[this.activeSeason] || [];
    },
  },

  watch: {
    currentSeason(newVal) {
      if (newVal && newVal !== this.activeSeason) {
        this.activeSeason = newVal;
        this.loadEpisodes();
      }
    },
  },

  mounted() {
    this.loadEpisodes();
  },

  methods: {
    loadEpisodes() {
      if (this.episodesBySeason[this.activeSeason]) return;
      getTvShowEpisodes(this.tvShowId, this.activeSeason).then((response) => {
        this.$set(this.episodesBySeason, this.activeSeason, response.episodes || []);
      });
    },

    isActive(episode) {
      return Number(this.currentSeason) === Number(this.activeSeason)
        && Number(this.currentEpisode) === Number(episode.episode_number);
    },

    progressPercent(episode) {
      const progress = this.watchProgress({
        media_type: 'tv',
        media_id: Number(this.tvShowId),
        season_number: Number(this.activeSeason),
        episode_number: Number(episode.episode_number),
      });
      if (!progress) return 0;
      if (progress.completed) return 100;
      return Math.min(99, Math.max(0, progress.progress_percentage || 0));
    },

    isCompleted(episode) {
      const progress = this.watchProgress({
        media_type: 'tv',
        media_id: Number(this.tvShowId),
        season_number: Number(this.activeSeason),
        episode_number: Number(episode.episode_number),
      });
      return progress && progress.completed;
    },

    play(episode) {
      this.$emit('play-episode', {
        seasonNumber: Number(this.activeSeason),
        episodeNumber: Number(episode.episode_number),
        episodeName: episode.name,
      });
    },
  },
};
</script>

<style lang="scss" module>
.rail {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 60%, rgba(0, 0, 0, 0.4) 100%);
  padding: 1.6rem 2.4rem 2rem;
  color: #fff;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  gap: 1.6rem;
}

.title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.seasonPicker {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.seasonLabel {
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
}

.seasonSelect {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;

  &:focus {
    outline: 2px solid rgba(229, 9, 20, 0.6);
    outline-offset: 2px;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
}

.scroller {
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding-bottom: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
}

.card {
  flex: 0 0 22rem;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  scroll-snap-align: start;
  transition: transform 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    outline: none;
  }

  &:focus-visible .thumb {
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.8);
  }
}

.thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #111;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.8rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumbFallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card:hover .playOverlay,
.card:focus-visible .playOverlay {
  opacity: 1;
}

.progressBar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.4rem;
  background: rgba(255, 255, 255, 0.3);

  > div {
    height: 100%;
    background: #e50914;
  }
}

.cardActive .thumb {
  outline: 2px solid #e50914;
  outline-offset: 2px;
}

.cardCompleted .thumb::after {
  content: '✓ Watched';
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  padding: 0.2rem 0.6rem;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 1rem;
  border-radius: 2px;
  letter-spacing: 0.4px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.epNumber {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nowDot {
  color: #e50914;
  font-size: 0.8rem;
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.epName {
  font-size: 1.4rem;
  color: #fff;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .rail {
    padding: 1.2rem 1.2rem 1.6rem;
  }

  .card {
    flex: 0 0 16rem;
  }
}
</style>
