<template>
  <transition name="upnext-fade">
    <div v-if="visible" :class="$style.backdrop" role="dialog" aria-modal="true" aria-labelledby="upnext-title">
      <div :class="$style.card">
        <div :class="$style.eyebrow" id="upnext-title">
          Up next in <span :class="$style.countdown">{{ remaining }}</span>s
        </div>

        <div :class="$style.body">
          <div :class="$style.thumb">
            <img
              v-if="nextEpisode && nextEpisode.still_path"
              :src="`${apiImgUrl}/w400${nextEpisode.still_path}`"
              :alt="nextEpisode.name">
            <div v-else :class="$style.thumbFallback">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>

          <div :class="$style.info">
            <div :class="$style.label">
              S{{ nextSeason }}:E{{ nextEpisodeNumber | numberWithDoubleDigits }}
            </div>
            <h3 :class="$style.title">{{ nextEpisode ? nextEpisode.name : 'Next episode' }}</h3>
            <p v-if="nextEpisode && nextEpisode.overview" :class="$style.overview">
              {{ nextEpisode.overview | truncate(180) }}
            </p>
          </div>
        </div>

        <div :class="$style.actions">
          <button type="button" :class="[$style.btn, $style.btnPrimary]" @click="playNow">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Play now
          </button>
          <button type="button" :class="[$style.btn, $style.btnGhost]" @click="cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { apiImgUrl } from '~/api';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    nextEpisode: {
      type: Object,
      default: null,
    },
    nextSeason: {
      type: Number,
      default: null,
    },
    nextEpisodeNumber: {
      type: Number,
      default: null,
    },
    countdownSeconds: {
      type: Number,
      default: 5,
    },
  },

  data() {
    return {
      apiImgUrl,
      remaining: this.countdownSeconds,
      timer: null,
    };
  },

  watch: {
    visible(open) {
      if (open) {
        this.startCountdown();
      } else {
        this.stopCountdown();
      }
    },
  },

  beforeDestroy() {
    this.stopCountdown();
  },

  methods: {
    startCountdown() {
      this.remaining = this.countdownSeconds;
      this.stopCountdown();
      this.timer = setInterval(() => {
        this.remaining -= 1;
        if (this.remaining <= 0) {
          this.stopCountdown();
          this.playNow();
        }
      }, 1000);
    },

    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    playNow() {
      this.stopCountdown();
      this.$emit('play-next');
    },

    cancel() {
      this.stopCountdown();
      this.$emit('cancel');
    },
  },
};
</script>

<style lang="scss" module>
.backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 30;
  padding: 2rem;
}

.card {
  width: 100%;
  max-width: 56rem;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 2.4rem;
  color: #fff;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.eyebrow {
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 1.6rem;
}

.countdown {
  display: inline-block;
  min-width: 2ch;
  color: #e50914;
  font-weight: 700;
  font-size: 1.4rem;
}

.body {
  display: flex;
  gap: 1.6rem;
  margin-bottom: 2rem;
}

.thumb {
  flex: 0 0 16rem;
  aspect-ratio: 16 / 9;
  background: #0a0a0a;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

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

.info {
  flex: 1;
  min-width: 0;
}

.label {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.6rem;
}

.title {
  margin: 0 0 0.8rem;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
}

.overview {
  margin: 0;
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 1.2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  border: 0;
  border-radius: 4px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  min-height: 4.4rem;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
}

.btnPrimary {
  background: #fff;
  color: #000;

  &:hover {
    background: rgba(255, 255, 255, 0.85);
  }
}

.btnGhost {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

.upnext-fade-enter-active,
.upnext-fade-leave-active {
  transition: opacity 0.25s ease;
}

.upnext-fade-enter,
.upnext-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .body {
    flex-direction: column;
  }

  .thumb {
    flex: 0 0 auto;
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
