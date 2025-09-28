export default {
  // https://nuxtjs.org/deployments/netlify/
  target: "static",

  ssr: false,

  generate: {
    fallback: true,
  },

  // Headers of the page
  head: {
    title: "Streamly - Watch Movies & TV Shows",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Streamly - Watch Movies & TV Shows",
      },
      { hid: "author", name: "author", content: "Jason Ujma-Alvis" },
      { hid: "og:locale", property: "og:locale", content: "en_GB" },
      { hid: "og:title", property: "og:title", content: "Streamly" },
      {
        hid: "og:description",
        property: "og:description",
        content: "Streamly - Watch Movies & TV Shows",
      },
      { hid: "og:type", property: "og:type", content: "website" },
      {
        hid: "og:url",
        property: "og:url",
        content: "https://movies.jason.codes/",
      },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Streamly" },
      {
        name: "twitter:description",
        content: "Streamly - Watch Movies & TV Shows",
      },
      { name: "twitter:site", content: "@jasonujmaalvis" },
      { name: "twitter:creator", content: "@jasonujmaalvis" },
      {
        name: "twitter:image",
        content: "https://movies.jason.codes/icon-medium.png",
      },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "//fonts.googleapis.com/css?family=Roboto:300,400,500",
      },
    ],
  },

  // Security headers for production
  render: {
    csp: {
      hashAlgorithm: 'sha256',
      policies: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://www.vidking.net"
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        'font-src': [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        'img-src': [
          "'self'",
          "data:",
          "https://image.tmdb.org",
          "https://www.vidking.net"
        ],
        'connect-src': [
          "'self'",
          "https://api.themoviedb.org",
          "https://www.google-analytics.com",
          "https://www.vidking.net"
        ],
        'frame-src': [
          "'self'",
          "https://www.vidking.net"
        ],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      }
    }
  },

  // Global CSS
  css: ["@/assets/css/global.scss"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~/plugins/lazyload.js",
    "~/plugins/filters.js",
    "~/plugins/supabase.js",
    { src: "~/plugins/ga.js", ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // Temporarily disabled ESLint to fix parsing errors
    // "@nuxtjs/eslint-module",
  ],

  modules: ["@nuxtjs/dotenv", "@nuxtjs/axios", "@nuxtjs/pwa"],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: "/",
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: "en",
      name: "Streamly",
      short_name: "Streamly",
      description: "Watch Movies & TV Shows",
      theme_color: "#E50914",
      background_color: "#000000",
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  loaders: {
    cssModules: {
      camelCase: true,
      localIdentName: "[local]_[hash:base64:5]",
    },
  },

  vue: {
    config: {
      productionTip: false,
      devtools: false,
    },
  },

  env: {
    FRONTEND_URL: process.env.FRONTEND_URL || "",
    API_KEY: process.env.API_KEY || "",
    API_LANG: process.env.API_LANG || "en-US",
    API_COUNTRY: process.env.API_COUNTRY || "GB",
    API_YOUTUBE_KEY: process.env.API_YOUTUBE_KEY || "",
    GA: process.env.GA || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  },

  // Customize the progress bar color
  loading: {
    color: "#E50914",
  },
};
