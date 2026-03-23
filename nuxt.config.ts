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
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5037/api',
    },
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      standalone: false,
    },
  },
})
