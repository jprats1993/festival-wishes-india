// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://festivalwishesindia.com',

  integrations: [sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en',
        hi: 'hi',
        hinglish: 'hi-Latn',
      },
    },
    filter: (page) => {
      // noindex pages should not be in sitemap
      return !page.includes('/thin-') && !page.includes('/search');
    },
  })],

  i18n: {
    locales: ['en', 'hi', 'hinglish'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },

  build: {
    format: 'directory',
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});