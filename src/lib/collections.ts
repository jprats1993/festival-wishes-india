export const collectionMap: Record<string, string[]> = {
  'short-wishes': [],
  'brother-wishes': ['brother'],
  'sister-wishes': ['sister'],
  'bhaiya-bhabhi-wishes': ['bhaiya-bhabhi'],
  'whatsapp-messages': [],
  'family-wishes': ['family'],
};

export const collections = {
  getCollectionSlugs: () => Object.keys(collectionMap),
  getRelationsForCollection: (slug: string) => collectionMap[slug] || [],
};
