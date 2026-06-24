import { cookies } from 'next/headers';
import Script from 'next/script';
import { hasLocale, DEFAULT_LOCALE } from '@/lib/locales';
import PlausibleTracker from '@/components/PlausibleTracker';

// Plausible analytics. The instance is hosted elsewhere, so both the script
// URL and the tracked domain are configurable via env (defaults below).
// We use the `manual` variant so PlausibleTracker can report normalized URLs
// (collapsing playlist ids on the create/finish/sort flows) instead of the
// raw high-cardinality paths.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'sortify.fr';
const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ??
  'https://plausible.hgalan.dev/js/script.manual.js';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('NEXT_LOCALE')?.value;
  const lang = cookieLang && hasLocale(cookieLang) ? cookieLang : DEFAULT_LOCALE;

  return (
    <html lang={lang}>
      {/* Browser extensions (e.g. ColorZilla's `cz-shortcut-listen`) mutate
          <body> before hydration; suppress the resulting attribute mismatch. */}
      <body suppressHydrationWarning>
        {children}
        {/* Queue stub so pageviews fired before the script loads aren't lost. */}
        <Script id="plausible-init" strategy="beforeInteractive">
          {`window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src={PLAUSIBLE_SRC}
          strategy="afterInteractive"
        />
        <PlausibleTracker />
      </body>
    </html>
  );
}
