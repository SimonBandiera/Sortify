import type { MetadataRoute } from 'next';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/locales';
import { SITE_URL } from '@/lib/site';

// The only publicly indexable surface is the localized landing page; the
// dashboard / sort / create / finish flows are behind Spotify auth.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // hreflang alternates so search engines understand the localized variants.
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}`]),
  );

  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: locale === DEFAULT_LOCALE ? 1 : 0.8,
    alternates: { languages },
  }));
}
