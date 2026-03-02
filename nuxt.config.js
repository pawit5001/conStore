export default defineNuxtConfig({
  css: ['@/assets/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
  ],
  ssr: false,
  router: {
    middleware: ['auth']
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/conStore-logo.jpg' }
      ]
    }
  }
});
