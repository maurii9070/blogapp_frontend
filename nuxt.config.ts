// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
  ],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
    '/posts': { prerender: true },
    '/login': { ssr: false },
    '/profile': { ssr: false },
    '/me/profile': { ssr: false },
    '/posts/create': { ssr: false },
    '/posts/**/edit': { ssr: false },
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5238/api',
    },
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      standalone: false,
    },
  },
})
