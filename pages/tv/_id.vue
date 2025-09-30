<template>
  <main class="main">
    <TopNav
      :title="metaTitle" />

    <Hero
      :item="item" />

    <MediaNav
      :menu="menu"
      @clicked="navClicked" />

    <template v-if="activeMenu === 'overview'">
      <TvInfo
        :item="item" />

      <Credits
        v-if="showCredits"
        :people="item.credits.cast" />
    </template>

    <template v-if="activeMenu === 'watch'">
      <div class="watch-section">
        <div class="season-episode-selector">
          <div class="selector-group">
            <label for="season-select">Season:</label>
            <select 
              id="season-select"
              v-model="selectedSeason" 
              @change="onSeasonChange"
              class="selector">
              <option 
                v-for="season in availableSeasons" 
                :key="season" 
                :value="season">
                Season {{ season }}
              </option>
            </select>
          </div>
          
          <div class="selector-group">
            <label for="episode-select">Episode:</label>
            <select 
              id="episode-select"
              v-model="selectedEpisode" 
              @change="onEpisodeChange"
              class="selector">
              <option 
                v-for="episode in availableEpisodes" 
                :key="episode" 
                :value="episode">
                Episode {{ episode }}
              </option>
            </select>
          </div>
        </div>
        
        <VidKingPlayer
          :movie-id="item.id"
          :title="name"
          :poster-path="item.poster_path"
          type="tv"
          :season="selectedSeason"
          :episode="selectedEpisode" />
      </div>
    </template>

    <template v-if="activeMenu === 'episodes' && showEpisodes">
      <Episodes
        :number-of-seasons="item.number_of_seasons"
        :tv-show-id="item.id"
        @play-episode="onPlayEpisode" />
    </template>

    <template v-if="activeMenu === 'videos' && showVideos">
      <Videos
        :videos="item.videos.results" />
    </template>

    <template v-if="activeMenu === 'photos' && showImages">
      <Images
        v-if="item.images.backdrops.length"
        title="Backdrops"
        type="backdrop"
        :images="item.images.backdrops" />

      <Images
        v-if="item.images.posters.length"
        title="Posters"
        type="poster"
        :images="item.images.posters" />
    </template>

    <ListingCarousel
      v-if="recommended && recommended.results.length"
      title="More Like This"
      :items="recommended" />
  </main>
</template>

<script>
import { apiImgUrl, getTvShow, getTvShowRecommended } from '~/api';
import { name, yearStart, yearEnd } from '~/mixins/Details';
import TopNav from '~/components/global/TopNav';
import Hero from '~/components/Hero';
import MediaNav from '~/components/MediaNav';
import TvInfo from '~/components/tv/TvInfo';
import VidKingPlayer from '~/components/VidKingPlayer';
import Videos from '~/components/Videos';
import Images from '~/components/Images';
import Credits from '~/components/Credits';
import Episodes from '~/components/tv/Episodes';
import ListingCarousel from '~/components/ListingCarousel';

export default {
  components: {
    TopNav,
    Hero,
    MediaNav,
    TvInfo,
    VidKingPlayer,
    Videos,
    Images,
    Credits,
    Episodes,
    ListingCarousel,
  },

  mixins: [
    name,
    yearStart,
    yearEnd,
  ],

  head () {
    return {
      title: this.metaTitle,
      meta: [
        { hid: 'og:title', property: 'og:title', content: this.metaTitle },
        { hid: 'og:description', property: 'og:description', content: this.metaDescription },
        { hid: 'description', name: 'description', content: this.metaDescription },
        { hid: 'og:image', property: 'og:image', content: this.metaImage },
        { hid: 'og:url', property: 'og:url', content: `${process.env.FRONTEND_URL}${this.$route.path}` },
      ],
      bodyAttrs: {
        class: 'topnav-active',
      },
    };
  },

  data () {
    return {
      menu: [],
      activeMenu: 'overview',
      recommended: null,
      selectedSeason: 1,
      selectedEpisode: 1,
    };
  },

  computed: {
    metaTitle () {
      if (this.item.status === 'Ended' && this.yearStart && this.yearEnd) {
        return `${this.name} (TV Series ${this.yearStart}-${this.yearEnd})`;
      } else if (this.yearStart) {
        return `${this.name} (TV Series ${this.yearStart}-)`;
      } else {
        return `${this.name} (TV Series)`;
      }
    },

    metaDescription () {
      if (this.item.overview) {
        return this.truncate(this.item.overview, 200);
      } else {
        return '';
      }
    },

    metaImage () {
      if (this.item.poster_path) {
        return `${apiImgUrl}/w500${this.item.poster_path}`;
      } else {
        return '';
      }
    },

    showCredits () {
      const credits = this.item.credits;
      return credits && credits.cast && credits.cast.length;
    },

    showEpisodes () {
      return this.item.number_of_seasons;
    },

    showVideos () {
      const videos = this.item.videos;
      return videos && videos.results && videos.results.length;
    },

    showImages () {
      const images = this.item.images;
      return images && ((images.backdrops && images.backdrops.length) || (images.posters && images.posters.length));
    },

    availableSeasons () {
      const seasons = [];
      const totalSeasons = this.item.number_of_seasons || 1;
      for (let i = 1; i <= totalSeasons; i++) {
        seasons.push(i);
      }
      return seasons;
    },

    availableEpisodes () {
      const episodes = [];
      // Default to 10 episodes per season if not specified
      const episodesPerSeason = 10;
      for (let i = 1; i <= episodesPerSeason; i++) {
        episodes.push(i);
      }
      return episodes;
    },
  },

  async asyncData ({ params, error }) {
    try {
      const item = await getTvShow(params.id);

      if (item.adult) {
        error({ message: 'This tv show is not available' });
      } else {
        return { item };
      }
    } catch {
      error({ message: 'Page not found' });
    }
  },

  created () {
    this.createMenu();
    this.initRecommended();
    
    // Check if we should switch to watch tab
    this.checkWatchTab();
  },

  watch: {
    '$route.query.tab' () {
      this.checkWatchTab();
    },
  },

  methods: {
    checkWatchTab () {
      if (this.$route.query.tab === 'watch') {
        this.activeMenu = 'watch';
      }
    },

    truncate (string, length) {
      return this.$options.filters.truncate(string, length);
    },

    createMenu () {
      const menu = [];

      // overview
      menu.push('Overview');

      // watch
      menu.push('Watch');

      // episodes
      if (this.showEpisodes) menu.push('Episodes');

      // videos
      if (this.showVideos) menu.push('Videos');

      // images
      if (this.showImages) menu.push('Photos');

      this.menu = menu;
    },

    navClicked (label) {
      this.activeMenu = label;
    },

    initRecommended () {
      // if recommended don't exist, retreive them
      if (this.recommended !== null) return;

      getTvShowRecommended(this.$route.params.id).then((response) => {
        this.recommended = response;
      });
    },

    onSeasonChange () {
      // Reset episode to 1 when season changes
      this.selectedEpisode = 1;
    },

    onEpisodeChange () {
      // Episode changed, player will update automatically
    },

    onPlayEpisode (episodeData) {
      // Switch to watch tab and set the selected season/episode
      this.selectedSeason = episodeData.seasonNumber;
      this.selectedEpisode = episodeData.episodeNumber;
      this.activeMenu = 'watch';
    },
  },
};
</script>

<style lang="scss" scoped>
.watch-section {
  padding: 2rem 0;
}

.season-episode-selector {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.selector-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selector {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.selector:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.selector:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.selector option {
  background: #1a1a1a;
  color: #fff;
  padding: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .season-episode-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .selector-group {
    min-width: auto;
  }
  
  .selector {
    min-width: auto;
    width: 100%;
  }
}
</style>
