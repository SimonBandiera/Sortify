import 'server-only';
import { LOCALES, type Locale } from './locales';

export type { Locale };
export { LOCALES };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('../dictionaries/en.json').then((m) => m.default),
  de: () => import('../dictionaries/de.json').then((m) => m.default),
  es: () => import('../dictionaries/es.json').then((m) => m.default),
  fr: () => import('../dictionaries/fr.json').then((m) => m.default),
  id: () => import('../dictionaries/id.json').then((m) => m.default),
  it: () => import('../dictionaries/it.json').then((m) => m.default),
  ja: () => import('../dictionaries/ja.json').then((m) => m.default),
  nl: () => import('../dictionaries/nl.json').then((m) => m.default),
  pl: () => import('../dictionaries/pl.json').then((m) => m.default),
  pt: () => import('../dictionaries/pt.json').then((m) => m.default),
  ru: () => import('../dictionaries/ru.json').then((m) => m.default),
  tr: () => import('../dictionaries/tr.json').then((m) => m.default),
  vi: () => import('../dictionaries/vi.json').then((m) => m.default),
  zh: () => import('../dictionaries/zh.json').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
