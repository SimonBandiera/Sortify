export const LOCALES = ['en', 'de', 'es', 'fr', 'id', 'it', 'ja', 'nl', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function hasLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}
