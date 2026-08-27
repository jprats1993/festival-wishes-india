// Below this many matching wishes, a collection page is too thin to index
// (see [collection].astro's `noindex` and the sitemap filter in astro.config.mjs).
export const NOINDEX_THRESHOLD = 3;

export const collectionMap: Record<string, string[]> = {
  'short-wishes': [],
  'brother-wishes': ['brother'],
  'sister-wishes': ['sister'],
  'bhaiya-bhabhi-wishes': ['bhaiya-bhabhi'],
  'whatsapp-messages': [],
  'family-wishes': ['family'],
  'friend-wishes': ['friend'],
  'parent-wishes': ['parent'],
};

// Collections that filter by tone/format instead of (or in addition to) relation.
export const collectionToneMap: Record<string, string> = {
  'short-wishes': 'short',
};
export const collectionFormatMap: Record<string, string> = {
  'whatsapp-messages': 'status',
};

export const collections = {
  getCollectionSlugs: () => Object.keys(collectionMap),
  getRelationsForCollection: (slug: string) => collectionMap[slug] || [],
  getToneForCollection: (slug: string) => collectionToneMap[slug],
  getFormatForCollection: (slug: string) => collectionFormatMap[slug],
};
