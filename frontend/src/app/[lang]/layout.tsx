import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import { hasLocale, LOCALES } from '@/lib/locales';
import type { Locale } from '@/lib/locales';
import { TranslationsProvider } from '@/lib/translations';
import { SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'sortify — sort your Spotify playlists by genre',
    template: '%s · sortify',
  },
  description:
    'Free, open-source utility that reads your Spotify playlists, detects genres via Last.fm tags, and splits them into clean new playlists. No signup, no ads.',
  keywords: ['spotify', 'playlist', 'genre', 'sort', 'music', 'organizer', 'free', 'open source'],
  authors: [
    { name: 'Hugo Galan', url: 'https://hgalan.dev' },
    { name: 'Simon Bandiera', url: 'https://sbandiera.dev' },
  ],
  openGraph: {
    title: 'sortify — sort your Spotify playlists by genre',
    description: 'Reads your playlists, detects genres, splits them into new clean ones. Free and open source.',
    siteName: 'sortify',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <TranslationsProvider dict={dict}>
      {children}
    </TranslationsProvider>
  );
}
