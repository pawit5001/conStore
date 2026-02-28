// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{vue,js}',
    './components/**/*.{vue,js}',
    './layouts/**/*.{vue,js}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ['Prompt', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
