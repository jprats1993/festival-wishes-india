// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import { collections, NOINDEX_THRESHOLD } from './src/lib/collections.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wishDir = join(__dirname, 'src/content/wish');
const approvedWishes = readdirSync(wishDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(wishDir, f), 'utf-8')))
  .filter((w) => w.reviewStatus === 'approved');

function collectionWishCount(festivalSlug, collectionSlug) {
  const relations = collections.getRelationsForCollection(collectionSlug);
  const tone = collections.getToneForCollection(collectionSlug);
  const format = collections.getFormatForCollection(collectionSlug);
  let filtered = approvedWishes.filter((w) => w.festival === festivalSlug);
  if (relations.length > 0) filtered = filtered.filter((w) => w.relations.some((r) => relations.includes(r)));
  if (tone) filtered = filtered.filter((w) => w.tones?.includes(tone));
  if (format) filtered = filtered.filter((w) => w.formats?.includes(format));
  return filtered.length;
}

const collectionSlugs = new Set(collections.getCollectionSlugs());

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
      // Mirror [collection].astro's noindex logic: exclude collection pages
      // that are too thin to index (matches NOINDEX_THRESHOLD there).
      const parts = new URL(page).pathname.split('/').filter(Boolean);
      const [, festivalSlug, collectionSlug] = parts;
      if (collectionSlug && collectionSlugs.has(collectionSlug)) {
        return collectionWishCount(festivalSlug, collectionSlug) >= NOINDEX_THRESHOLD;
      }
      return true;
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