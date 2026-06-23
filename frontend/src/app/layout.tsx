import { cookies } from 'next/headers';
import Script from 'next/script';
import { hasLocale, DEFAULT_LOCALE } from '@/lib/locales';

// Plausible analytics. The instance is hosted elsewhere, so both the script
// URL and the tracked domain are configurable via env (defaults below).
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'sortify.fr';
const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? 'https://plausible.hgalan.dev/js/script.js';

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
      <body>
        {children}
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src={PLAUSIBLE_SRC}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
