// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiKey: process.env.API_KEY || '',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      apiLang: process.env.API_LANG || 'en-US',
      apiCountry: process.env.API_COUNTRY || 'GB',
      youtubeKey: process.env.API_YOUTUBE_KEY || '',
      ga: process.env.GA || ''
    }
  },

  // Axios module configuration
  axios: {
    baseURL: '/'
  },

  // PWA module configuration
  pwa: {
    manifest: {
      lang: 'en',
      name: 'Movies',
      short_name: 'Movies',
      description: 'Browse Movies, TV Shows and People',
      theme_color: '#2196f3',
      background_color: '#000000'
    }
  },

  app: {
    head: {
      title: 'Browse Movies, TV Shows and People',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Browse Movies, TV Shows and People' },
        { name: 'author', content: 'Jason Ujma-Alvis' },
        { property: 'og:locale', content: 'en_GB' },
        { property: 'og:title', content: 'Movies App' },
        { property: 'og:description', content: 'Browse Movies, TV Shows and People' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://movies.jason.codes/' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Movies' },
        { name: 'twitter:description', content: 'Browse Movies, TV Shows and People' },
        { name: 'twitter:site', content: '@jasonujmaalvis' },
        { name: 'twitter:creator', content: '@jasonujmaalvis' },
        { name: 'twitter:image', content: 'https://movies.jason.codes/icon-medium.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:300,400,500' }
      ]
    }
  },

  // Security headers for production
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        }
      }
    }
  }
})
