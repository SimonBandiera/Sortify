import { cookies } from 'next/headers';
import { hasLocale, DEFAULT_LOCALE } from '@/lib/locales';

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
      <body>{children}</body>
    </html>
  );
}
