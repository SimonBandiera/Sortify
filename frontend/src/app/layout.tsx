import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
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
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
