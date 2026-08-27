import type { Locale } from './i18n';

export interface RelationTab {
  slug: string;
  label: Record<Locale, string>;
}

// Single source of truth for the relation-tab bar shown on both the festival hub
// ([festival]/index.astro) and every collection subpage ([collection].astro) — keeping this in
// one place avoids the two staying out of sync (which is what caused an earlier missing-tabs bug).
export const relationTabs: RelationTab[] = [
  { slug: 'brother-wishes', label: { en: 'Brother', hi: 'भाई', hinglish: 'Bhai' } },
  { slug: 'sister-wishes', label: { en: 'Sister', hi: 'बहन', hinglish: 'Behen' } },
  { slug: 'bhaiya-bhabhi-wishes', label: { en: 'Bhaiya-Bhabhi', hi: 'भैया-भाभी', hinglish: 'Bhaiya-Bhabhi' } },
  { slug: 'family-wishes', label: { en: 'Family', hi: 'परिवार', hinglish: 'Family' } },
  { slug: 'friend-wishes', label: { en: 'Friend', hi: 'दोस्त', hinglish: 'Dost' } },
  { slug: 'parent-wishes', label: { en: 'Parents', hi: 'माता-पिता', hinglish: 'Parents' } },
  { slug: 'spouse-wishes', label: { en: 'Spouse', hi: 'जीवनसाथी', hinglish: 'Spouse' } },
  { slug: 'short-wishes', label: { en: 'Short', hi: 'छोटी', hinglish: 'Short' } },
  { slug: 'whatsapp-messages', label: { en: 'WhatsApp', hi: 'व्हाट्सएप', hinglish: 'WhatsApp' } },
];
