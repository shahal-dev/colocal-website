import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/eslint', '@nuxtjs/mdc'],

  fonts: {
    families: [
      {
        name: 'Open Sans',
        provider: 'google',
        weights: [400, 600, 700],
      },
      {
        name: 'Poppins',
        provider: 'google',
        weights: [400, 600, 700],
      },
    ],
  },

  // Runtime config for Strapi
  runtimeConfig: {
    strapi: {
      url: 'http://localhost:1337', // can be overridden by NUXT_STRAPI_URL
      token: '', // read-only API token; override via NUXT_STRAPI_TOKEN
    },
    public: {
      // expose only the URL if needed client-side; keep token private
      strapiUrl: 'http://localhost:1337',
    },
  },
});