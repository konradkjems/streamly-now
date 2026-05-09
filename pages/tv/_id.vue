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

    <WatchOverlay
      :visible="watchOpen"
      :media-id="item.id"
      :title="name"
      :poster-path="item.poster_path"
      type="tv"
      :seasons="seasonsMeta"
      :initial-season="initialSeason"
      :initial-episode="initialEpisode"
      @close="closeWatch" />
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import { apiImgUrl, getTvShow, getTvShowRecommended } from '~/api';
import { name, yearStart, yearEnd } from '~/mixins/Details';
import TopNav from '~/components/global/TopNav';
import Hero from '~/components/Hero';
import MediaNav from '~/components/MediaNav';
import TvInfo from '~/components/tv/TvInfo';
import WatchOverlay from '~/components/WatchOverlay';
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
    WatchOverlay,
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
      watchOpen: false,
      // Season/episode the overlay should open with - populated when watchOpen flips on
      initialSeason: 1,
      initialEpisode: 1,
    };
  },

  computed: {
    ...mapGetters('viewingHistory', ['lastWatchedForMedia']),

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

    // Real seasons metadata from TMDb. Filter out season 0 (specials).
    // Each entry: { season_number, episode_count, name }
    seasonsMeta () {
      if (!this.item.seasons || !this.item.seasons.length) {
        // Fallback if API didn't return seasons[] - synthesize from number_of_seasons
        const total = this.item.number_of_seasons || 1;
        const fallback = [];
        for (let i = 1; i <= total; i++) {
          fallback.push({ season_number: i, episode_count: 0, name: `Season ${i}` });
        }
        return fallback;
      }
      return this.item.seasons
        .filter((s) => s.season_number > 0)
        .map((s) => ({
          season_number: s.season_number,
          episode_count: s.episode_count,
          name: s.name,
        }));
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
  },

  mounted () {
    this.checkWatchQuery();
  },

  watch: {
    '$route.query.tab' () {
      this.checkWatchQuery();
    },
    '$route.query.s' () {
      this.checkWatchQuery();
    },
    '$route.query.e' () {
      this.checkWatchQuery();
    },
  },

  methods: {
    checkWatchQuery () {
      const opening = this.$route.query.tab === 'watch';
      if (opening) {
        const { season, episode } = this.resolveStartingEpisode();
        this.initialSeason = season;
        this.initialEpisode = episode;
      }
      this.watchOpen = opening;
    },

    // Pick where the overlay should start: explicit ?s=&e= wins, then most recent
    // viewing history for this show, else S1:E1.
    resolveStartingEpisode () {
      const qs = parseInt(this.$route.query.s, 10);
      const qe = parseInt(this.$route.query.e, 10);
      if (!isNaN(qs) && !isNaN(qe)) {
        return { season: qs, episode: qe };
      }
      const last = this.lastWatchedForMedia({ media_type: 'tv', media_id: this.item.id });
      if (last && last.season_number && last.episode_number) {
        return { season: Number(last.season_number), episode: Number(last.episode_number) };
      }
      return { season: 1, episode: 1 };
    },

    closeWatch () {
      this.watchOpen = false;
      const query = { ...this.$route.query };
      delete query.tab;
      delete query.s;
      delete query.e;
      this.$router.replace({ path: this.$route.path, query }).catch(() => {});
    },

    truncate (string, length) {
      return this.$options.filters.truncate(string, length);
    },

    createMenu () {
      const menu = [];

      menu.push('Overview');

      if (this.showEpisodes) menu.push('Episodes');

      if (this.showVideos) menu.push('Videos');

      if (this.showImages) menu.push('Photos');

      this.menu = menu;
    },

    navClicked (label) {
      this.activeMenu = label;
    },

    initRecommended () {
      if (this.recommended !== null) return;

      getTvShowRecommended(this.$route.params.id).then((response) => {
        this.recommended = response;
      });
    },

    onPlayEpisode (episodeData) {
      // Open the overlay at the requested episode
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          tab: 'watch',
          s: episodeData.seasonNumber,
          e: episodeData.episodeNumber,
        },
      }).catch(() => {});
    },
  },
};
</script>
