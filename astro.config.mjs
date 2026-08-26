// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://festivalwishesindia.com',
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
});
