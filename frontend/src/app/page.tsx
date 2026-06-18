import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Demo from '@/components/landing/Demo';
import Stats from '@/components/landing/Stats';
import GenreGrid from '@/components/landing/GenreGrid';
import FAQ from '@/components/landing/FAQ';
import OpenSourceCTA from '@/components/landing/OpenSourceCTA';
import { getSpotifyAuthUrl } from '@/lib/spotify-auth';

export default function Home() {
  const authUrl = getSpotifyAuthUrl();

  return (
    <>
      <Nav variant="landing" spotifyAuthUrl={authUrl} />
      <Hero spotifyAuthUrl={authUrl} />
      <HowItWorks />
      <Demo />
      <Stats />
      <GenreGrid />
      <FAQ />
      <OpenSourceCTA spotifyAuthUrl={authUrl} />
      <Footer />
    </>
  );
}
