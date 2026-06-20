const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000';

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-read-private',
  'user-library-read',
].join(' ');

export function getSpotifyAuthUrl(): string {
  const redirectUri = `${BASE_URL}/spotify/callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
    response_type: 'code',
    redirect_uri: redirectUri,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
