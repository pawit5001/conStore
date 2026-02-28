export default defineNuxtConfig({
  css: ['@/assets/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
  ],
  ssr: false,
  router: {
    middleware: ['auth']
  }
});
