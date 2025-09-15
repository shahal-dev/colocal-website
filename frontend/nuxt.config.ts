import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
  ],

  fonts: {
    families: [
      {
        name: 'Open Sans',
        provider: 'google',
        weights: [400, 600, 700]
      },
      {
        name: 'Poppins',
        provider: 'google',
        weights: [400, 600, 700]
      }
    ]
  },
})