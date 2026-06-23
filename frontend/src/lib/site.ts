// Canonical public URL of the site, used for SEO (sitemap, robots, metadata).
// Overridable via NEXT_PUBLIC_SITE_URL; defaults to the production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sortify.fr'
).replace(/\/$/, '');
