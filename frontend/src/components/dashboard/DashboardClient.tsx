'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DitherCanvas from '@/components/dither/DitherCanvas';
import Reveal from '@/components/ui/Reveal';
import type { CoverStyle } from '@/components/dither/dither';

interface Playlist {
  id: string;
  name: string;
  tracks: number;
  tag: string;
  coverStyle: CoverStyle;
  coverSeed: number;
  owned: boolean;
  imageUrl?: string;
}

const COVER_STYLES: CoverStyle[] = ['radial', 'linear', 'sphere', 'wave', 'rings', 'grid'];

function playlistToCover(index: number): { style: CoverStyle; seed: number } {
  return {
    style: COVER_STYLES[index % COVER_STYLES.length],
    seed: ((index * 0.17 + 0.1) % 1),
  };
}

interface SpotifyPlaylistRaw {
  id: string;
  name: string;
  tracks: { total: number };
  images: Array<{ url: string }>;
  owner?: { id?: string; display_name?: string };
}

function getTag(playlist: SpotifyPlaylistRaw): string {
  const owner = playlist.owner?.display_name || '';
  if (owner === 'Spotify') return 'Spotify';
  if (owner.includes('+') || owner.includes('Blend')) return 'Blend';
  return 'Owned';
}

const FILTERS = ['all', 'owned', 'spotify', 'blend'] as const;
type Filter = (typeof FILTERS)[number];

export default function DashboardClient() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [syncLabel, setSyncLabel] = useState('just now');
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playlists');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      const items = data.items || [];
      const mapped: Playlist[] = items.map((p: SpotifyPlaylistRaw, i: number) => {
        const cover = playlistToCover(i);
        return {
          id: p.id,
          name: p.name,
          tracks: p.tracks?.total || 0,
          tag: getTag(p),
          coverStyle: cover.style,
          coverSeed: cover.seed,
          owned: getTag(p) === 'Owned',
          imageUrl: p.images?.[0]?.url,
        };
      });
      setPlaylists(mapped);
    } catch {
      // stay on page with empty state
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const filtered = playlists.filter((p) => {
    if (filter === 'owned' && !p.owned) return false;
    if (filter === 'spotify' && p.tag !== 'Spotify') return false;
    if (filter === 'blend' && p.tag !== 'Blend') return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalTracks = playlists.reduce((a, b) => a + b.tracks, 0);

  const handleRefresh = () => {
    setSyncLabel('syncing…');
    fetchPlaylists().then(() => setSyncLabel('just now'));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Demo data fallback
  const displayPlaylists = playlists.length > 0 ? filtered : DEMO_PLAYLISTS.filter((p) => {
    if (filter === 'owned' && !p.owned) return false;
    if (filter === 'spotify' && p.tag !== 'Spotify') return false;
    if (filter === 'blend' && p.tag !== 'Blend') return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const displayTotal = playlists.length > 0 ? playlists.length : DEMO_PLAYLISTS.length;
  const displayTotalTracks = playlists.length > 0 ? totalTracks : DEMO_PLAYLISTS.reduce((a, b) => a + b.tracks, 0);

  return (
    <main className="page">
      <Reveal>
        <div className="dash-head">
          <div>
            <h1>Dashb<span className="lo">oard.</span></h1>
            <p className="sub">
              {'// choose a playlist to sort. sortify will read its tracks, detect genres, and split it into new playlists on your spotify.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', textAlign: 'right' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>last sync</span>
            <span id="lastSync" style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{syncLabel}</span>
            <button className="btn" style={{ padding: '6px 12px', fontSize: 10 }} onClick={handleRefresh}>
              <span>Refresh</span><span className="arrow">↻</span>
            </button>
          </div>
        </div>
      </Reveal>

      <div className="dash-toolbar">
        <div className="left">
          <span className="count"><b>{displayPlaylists.length}</b> / {displayTotal} playlists</span>
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`f-pill ${filter === f ? 'on' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="search">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="5" cy="5" r="3.5" />
            <path d="M8 8 L11 11" />
          </svg>
          <input
            type="text"
            id="searchInput"
            placeholder="search playlists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {loading && playlists.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
          Loading playlists…
        </div>
      ) : (
        <div className="pl-grid">
          {displayPlaylists.map((p, i) => (
            <div
              key={p.id || i}
              className="pl"
              onClick={() => router.push(`/sort/${p.id}`)}
            >
              <div className="pl-cover">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                  />
                ) : (
                  <DitherCanvas
                    coverStyle={p.coverStyle}
                    coverSeed={p.coverSeed}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                )}
                <span className="pl-tag">{p.tag}</span>
                <span className="pl-label">{p.name}</span>
                <div className="pl-hover">
                  <span className="arrow-big">Sort <span>→</span></span>
                </div>
              </div>
              <div className="pl-meta">
                <div className="pl-name">{p.name}</div>
              </div>
              <div className="pl-info">
                <span className="tracks">tracks · <b>{p.tracks.toLocaleString()}</b></span>
                <span className="pl-owner">{p.owned ? 'you' : p.tag.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-foot">
        <span>showing <b style={{ color: 'var(--fg)' }}>{displayPlaylists.length}</b> / {displayTotal} · total tracks <b style={{ color: 'var(--fg)' }}>{displayTotalTracks.toLocaleString()}</b></span>
        <span>sortify · v2.4 · build 04.18.26</span>
      </div>
    </main>
  );
}

const DEMO_PLAYLISTS: Playlist[] = [
  { id: '1', name: 'daylist', tracks: 50, tag: 'Spotify', coverStyle: 'radial', coverSeed: 0.1, owned: false },
  { id: '2', name: 'Your Top Songs 2025', tracks: 101, tag: 'Spotify', coverStyle: 'linear', coverSeed: 0.9, owned: false },
  { id: '3', name: 'Best Saxophone Jazz', tracks: 82, tag: 'Owned', coverStyle: 'sphere', coverSeed: 0.3, owned: true },
  { id: '4', name: 'Bagnole', tracks: 10, tag: 'Owned', coverStyle: 'wave', coverSeed: 0.5, owned: true },
  { id: '5', name: 'YoungSnoww + pooyiggrf', tracks: 50, tag: 'Blend', coverStyle: 'rings', coverSeed: 0.2, owned: false },
  { id: '6', name: 'On Repeat', tracks: 30, tag: 'Spotify', coverStyle: 'rings', coverSeed: 0.7, owned: false },
  { id: '7', name: 'Ça bz', tracks: 12, tag: 'Owned', coverStyle: 'grid', coverSeed: 0.4, owned: true },
  { id: '8', name: 'Chill code', tracks: 58, tag: 'Owned', coverStyle: 'linear', coverSeed: 0.15, owned: true },
  { id: '9', name: 'Les amoureux', tracks: 41, tag: 'Owned', coverStyle: 'radial', coverSeed: 0.8, owned: true },
  { id: '10', name: 'Les amoureuqq', tracks: 50, tag: 'Blend', coverStyle: 'sphere', coverSeed: 0.6, owned: false },
  { id: '11', name: '2024', tracks: 89, tag: 'Owned', coverStyle: 'grid', coverSeed: 0.22, owned: true },
  { id: '12', name: 'Trucs bizarre', tracks: 24, tag: 'Owned', coverStyle: 'wave', coverSeed: 0.44, owned: true },
  { id: '13', name: 'Your Top Songs 2023', tracks: 101, tag: 'Spotify', coverStyle: 'linear', coverSeed: 0.55, owned: false },
  { id: '14', name: 'go intro y', tracks: 33, tag: 'Owned', coverStyle: 'radial', coverSeed: 0.66, owned: true },
  { id: '15', name: 'WITCH', tracks: 18, tag: 'Owned', coverStyle: 'rings', coverSeed: 0.77, owned: true },
  { id: '16', name: 'Driving / night', tracks: 64, tag: 'Owned', coverStyle: 'wave', coverSeed: 0.33, owned: true },
  { id: '17', name: 'mood · blue', tracks: 27, tag: 'Owned', coverStyle: 'sphere', coverSeed: 0.88, owned: true },
  { id: '18', name: 'throwback 2017', tracks: 72, tag: 'Owned', coverStyle: 'grid', coverSeed: 0.11, owned: true },
  { id: '19', name: 'gym · hard', tracks: 45, tag: 'Owned', coverStyle: 'linear', coverSeed: 0.99, owned: true },
  { id: '20', name: 'Discover Weekly', tracks: 30, tag: 'Spotify', coverStyle: 'radial', coverSeed: 0.50, owned: false },
  { id: '21', name: 'Release Radar', tracks: 30, tag: 'Spotify', coverStyle: 'sphere', coverSeed: 0.60, owned: false },
  { id: '22', name: 'Liked Songs', tracks: 1843, tag: 'Owned', coverStyle: 'grid', coverSeed: 0.05, owned: true },
];
