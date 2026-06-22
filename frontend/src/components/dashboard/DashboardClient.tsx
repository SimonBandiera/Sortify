'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DitherCanvas from '@/components/dither/DitherCanvas';
import Reveal from '@/components/ui/Reveal';
import Nav from '@/components/ui/Nav';
import type { CoverStyle } from '@/components/dither/dither';
import { useT } from '@/lib/translations';
import { useLangPath } from '@/lib/useLocale';

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
  description?: string;
}

function getTag(playlist: SpotifyPlaylistRaw, userId: string | null): string {
  const ownerId = playlist.owner?.id || '';
  const ownerName = playlist.owner?.display_name || '';
  const name = playlist.name || '';
  const desc = playlist.description || '';

  if (ownerId === 'spotify' || ownerName === 'Spotify') {
    if (name.includes('+') || desc.toLowerCase().includes('blend')) return 'Blend';
    return 'Spotify';
  }

  if (userId && ownerId !== userId && ownerId !== '__self__') return 'Followed';

  return 'Owned';
}

const FILTERS = ['all', 'owned', 'followed', 'spotify', 'blend'] as const;
type Filter = (typeof FILTERS)[number];

export default function DashboardClient() {
  const router = useRouter();
  const t = useT();
  const lp = useLangPath();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [syncLabel, setSyncLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('user');
  const [lookupUrl, setLookupUrl] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const mapPlaylists = useCallback((items: SpotifyPlaylistRaw[], userId: string | null): Playlist[] => {
    return items.map((p, i) => {
      const cover = playlistToCover(i);
      const tag = getTag(p, userId);
      return {
        id: p.id,
        name: p.name,
        tracks: p.tracks?.total || 0,
        tag,
        coverStyle: cover.style,
        coverSeed: cover.seed,
        owned: tag === 'Owned',
        imageUrl: p.images?.[0]?.url,
      };
    });
  }, []);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playlists');
      if (res.status === 401) {
        router.push(lp('/'));
        return;
      }
      const data = await res.json();
      const items = data.items || [];
      const userId: string | null = data.user_id || null;
      const mapped = mapPlaylists(items, userId);
      setPlaylists(mapped);
      try { sessionStorage.setItem('sortify_playlists', JSON.stringify({ items, userId })); } catch {}
    } catch {
      // stay on page with empty state
    } finally {
      setLoading(false);
    }
  }, [router, mapPlaylists, lp]);

  useEffect(() => {
    setSyncLabel(t.dash_sync_now);
    try {
      const cached = sessionStorage.getItem('sortify_playlists');
      if (cached) {
        const { items, userId } = JSON.parse(cached);
        setPlaylists(mapPlaylists(items, userId));
        setLoading(false);
      }
    } catch {}
    fetchPlaylists();
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.display_name) setUserName(data.display_name);
      })
      .catch(() => {});
  }, [fetchPlaylists, mapPlaylists, t.dash_sync_now]);

  const filtered = playlists.filter((p) => {
    if (filter === 'owned' && !p.owned) return false;
    if (filter === 'followed' && p.tag !== 'Followed') return false;
    if (filter === 'spotify' && p.tag !== 'Spotify') return false;
    if (filter === 'blend' && p.tag !== 'Blend') return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalTracks = playlists.reduce((a, b) => a + b.tracks, 0);

  const handleRefresh = () => {
    setSyncLabel(t.dash_sync_syncing);
    fetchPlaylists().then(() => setSyncLabel(t.dash_sync_now));
  };

  const navigateToSort = (id: string, name: string) => {
    try { sessionStorage.setItem('sortify_sort_name', name); } catch {}
    router.push(lp(`/sort/${id}`));
  };

  const handleLookup = useCallback(async () => {
    const input = lookupUrl.trim();
    if (!input) return;
    setLookupError('');
    setLookupLoading(true);

    const match = input.match(/playlist[/:]([a-zA-Z0-9]{22})/);
    const playlistId = match ? match[1] : input;

    if (!/^[a-zA-Z0-9]{22}$/.test(playlistId)) {
      setLookupError(t.dash_lookup_error_invalid);
      setLookupLoading(false);
      return;
    }

    const existing = playlists.find((p) => p.id === playlistId);
    if (existing) {
      navigateToSort(existing.id, existing.name);
      return;
    }

    try {
      const res = await fetch(`/api/playlists/lookup/${playlistId}`);
      if (!res.ok) {
        setLookupError(res.status === 404 ? t.dash_lookup_error_not_found : t.dash_lookup_error_generic);
        setLookupLoading(false);
        return;
      }
      const p: SpotifyPlaylistRaw = await res.json();
      const cover = playlistToCover(playlists.length);
      const tag = getTag(p, null);
      setPlaylists((prev) => [...prev, {
        id: p.id,
        name: p.name,
        tracks: p.tracks?.total || 0,
        tag,
        coverStyle: cover.style,
        coverSeed: cover.seed,
        owned: tag === 'Owned',
        imageUrl: p.images?.[0]?.url,
      }]);
      setLookupUrl('');
      navigateToSort(playlistId, p.name);
    } catch {
      setLookupError(t.dash_lookup_error_server);
    } finally {
      setLookupLoading(false);
    }
  }, [lookupUrl, playlists, router, t, lp]);

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

  const displayPlaylists = filtered;
  const displayTotal = playlists.length;
  const displayTotalTracks = totalTracks;

  const filterLabels: Record<Filter, string> = {
    all: t.dash_filter_all,
    owned: t.dash_filter_owned,
    followed: t.dash_filter_followed,
    spotify: t.dash_filter_spotify,
    blend: t.dash_filter_blend,
  };

  return (
    <>
    <Nav variant="dashboard" userName={userName} />
    <main className="page">
      <Reveal>
        <div className="dash-head">
          <div>
            <h1>Dashb<span className="lo">oard.</span></h1>
            <p className="sub">{t.dash_sub}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', textAlign: 'right' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>{t.dash_last_sync}</span>
            <span id="lastSync" style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{syncLabel}</span>
            <button className="btn" style={{ padding: '6px 12px', fontSize: 10 }} onClick={handleRefresh}>
              <span>{t.dash_refresh}</span><span className="arrow">↻</span>
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
                {filterLabels[f]}
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
            placeholder={t.dash_search_placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {loading && playlists.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
          {t.dash_loading}
        </div>
      ) : !loading && displayPlaylists.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span>{playlists.length === 0 ? t.dash_no_playlists : t.dash_no_match}</span>
          <button className="btn" style={{ padding: '8px 16px', fontSize: 11 }} onClick={playlists.length === 0 ? handleRefresh : () => { setFilter('all'); setQuery(''); }}>
            <span>{playlists.length === 0 ? t.dash_refresh : t.dash_clear_filters}</span><span className="arrow">{playlists.length === 0 ? '↻' : '×'}</span>
          </button>
        </div>
      ) : (
        <div className="pl-grid">
          {displayPlaylists.map((p, i) => (
            <div
              key={p.id || i}
              className="pl"
              onClick={() => navigateToSort(p.id, p.name)}
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
                  <span className="arrow-big">{t.dash_sort_hover} <span>→</span></span>
                </div>
              </div>
              <div className="pl-meta">
                <div className="pl-name">{p.name}</div>
              </div>
              <div className="pl-info">
                <span className="tracks">{t.dash_tracks_label} <b>{p.tracks.toLocaleString()}</b></span>
                <span className="pl-owner">{p.tag === 'Owned' ? t.dash_owner_you : p.tag.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-missing">
        <div className="dash-missing-text">
          <span className="dash-missing-title">{t.dash_missing_title}</span>
          <span className="dash-missing-sub">{t.dash_missing_sub}</span>
        </div>
        <div className="dash-missing-input">
          <div className="search" style={{ flex: 1, minWidth: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 6 H11 M8 3 L11 6 L8 9" />
            </svg>
            <input
              type="text"
              placeholder={t.dash_lookup_placeholder}
              value={lookupUrl}
              onChange={(e) => { setLookupUrl(e.target.value); setLookupError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
            />
          </div>
          <button
            className="btn"
            style={{ padding: '6px 14px', fontSize: 10, whiteSpace: 'nowrap' }}
            onClick={handleLookup}
            disabled={lookupLoading || !lookupUrl.trim()}
          >
            <span>{lookupLoading ? t.dash_lookup_loading : t.dash_lookup_btn}</span>
            <span className="arrow">→</span>
          </button>
        </div>
        {lookupError && (
          <span className="dash-missing-error">{lookupError}</span>
        )}
      </div>

      <div className="dash-foot">
        <span>{t.dash_showing} <b style={{ color: 'var(--fg)' }}>{displayPlaylists.length}</b> / {displayTotal} · {t.dash_total_tracks} <b style={{ color: 'var(--fg)' }}>{displayTotalTracks.toLocaleString()}</b></span>
      </div>
    </main>
    </>
  );
}
