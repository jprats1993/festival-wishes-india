export type Locale = 'en' | 'hi' | 'hinglish';

export const locales: Locale[] = ['en', 'hi', 'hinglish'];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  hinglish: 'Hinglish',
};

export const localeBcp47: Record<Locale, string> = {
  en: 'en',
  hi: 'hi',
  hinglish: 'hi-Latn',
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeFromSlug(slug: string): Locale | null {
  if (isLocale(slug)) return slug;
  return null;
}
