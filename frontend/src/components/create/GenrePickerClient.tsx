'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import Reveal from '@/components/ui/Reveal';

interface Genre {
  name: string;
  count: number;
}

const DEMO_GENRES: Genre[] = [
  { name: 'soul', count: 24 }, { name: 'rap', count: 38 }, { name: 'hip-hop', count: 41 },
  { name: 'french hip-hop', count: 18 }, { name: 'guitar', count: 14 }, { name: 'singer-songwriter', count: 22 },
  { name: 'post-rock', count: 9 }, { name: 'dream pop', count: 11 }, { name: 'sophisti-pop', count: 6 },
  { name: 'bedroom pop', count: 15 }, { name: 'drum and bass', count: 12 }, { name: 'deep', count: 8 },
  { name: 'hip hop', count: 28 }, { name: 'french rap', count: 21 }, { name: 'house', count: 33 },
  { name: 'dance', count: 29 }, { name: 'electronic', count: 47 }, { name: 'industrial', count: 10 },
  { name: 'experimental', count: 7 }, { name: 'pop', count: 52 }, { name: 'rock', count: 44 },
  { name: 'rnb', count: 19 }, { name: 'synthpop', count: 16 }, { name: 'lo-fi', count: 13 },
  { name: 'indie', count: 34 }, { name: 'folk', count: 17 }, { name: 'indie pop', count: 25 },
  { name: 'french', count: 31 }, { name: 'punk', count: 10 }, { name: 'alternative', count: 22 },
  { name: 'techno', count: 19 }, { name: 'ambient', count: 12 }, { name: 'jazz', count: 15 },
  { name: 'trip-hop', count: 9 }, { name: 'synthwave', count: 18 }, { name: 'metal', count: 11 },
  { name: 'classical', count: 7 },
];

const SUGGESTIONS = ['For the car', 'Late night', 'Sunday morning', 'Deep focus', 'Workout', 'Nostalgia'];

type Filter = 'all' | 'popular' | 'selected';

interface GenrePickerClientProps {
  playlistId: string;
}

export default function GenrePickerClient({ playlistId }: GenrePickerClientProps) {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>(DEMO_GENRES);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [userTouchedName, setUserTouchedName] = useState(false);

  useEffect(() => {
    fetch(`/api/playlists/${playlistId}/genres`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.genres) {
          const mapped: Genre[] = Object.entries(data.genres).map(([name, uris]) => ({
            name,
            count: (uris as string[]).length,
          }));
          mapped.sort((a, b) => b.count - a.count);
          setGenres(mapped);
        }
      })
      .catch(() => {});
  }, [playlistId]);

  const filtered = useMemo(() => {
    let list = genres;
    if (filter === 'popular') list = [...list].sort((a, b) => b.count - a.count).slice(0, 16);
    if (filter === 'selected') list = list.filter((x) => selected.has(x.name));
    if (query) list = list.filter((x) => x.name.includes(query.toLowerCase()));
    return list;
  }, [genres, filter, query, selected]);

  const selectedArr = useMemo(() => [...selected], [selected]);
  const totalTracks = useMemo(
    () => selectedArr.reduce((a, n) => a + (genres.find((g) => g.name === n)?.count || 0), 0),
    [selectedArr, genres]
  );

  // Auto-generate name
  useEffect(() => {
    if (userTouchedName) return;
    if (selectedArr.length === 0) setPlaylistName('');
    else if (selectedArr.length === 1) setPlaylistName(selectedArr[0]);
    else if (selectedArr.length === 2) setPlaylistName(selectedArr.join(' + '));
    else setPlaylistName(selectedArr.slice(0, 2).join(' + ') + ' +' + (selectedArr.length - 2));
  }, [selectedArr, userTouchedName]);

  const toggleGenre = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const handleCreate = useCallback(async () => {
    if (selectedArr.length === 0 || !playlistName.trim()) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName, genres: selectedArr }),
      });
      if (res.ok) {
        router.push(`/finish/${playlistId}`);
      }
    } catch {
      // Demo fallback
      router.push(`/finish/${playlistId}`);
    }
  }, [playlistId, playlistName, selectedArr, router]);

  const mins = Math.floor(totalTracks * 3.5);
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const runtime = (hh > 0 ? hh + 'h ' : '') + String(mm).padStart(2, '0') + 'm';
  const size = totalTracks > 0 ? Math.round(totalTracks * 3.8) + ' mb' : '—';
  const canCreate = selectedArr.length > 0 && playlistName.trim().length > 0;

  return (
    <>
      <Nav variant="step" stepLabel="03 / 03" />
      <main className="page">
        <Reveal>
          <div className="pg-head">
            <div>
              <h1>Last <span className="lo">step.</span></h1>
              <p className="pg-sub">
                {'// choose the genres you want in your new playlist by clicking them. sortify will write a fresh playlist to your spotify with just those tracks — your source stays untouched.'}
              </p>
            </div>
            <div className="pg-source">
              <span>sorting from</span>
              <b>Your Top Songs 2025</b>
              <span style={{ color: 'var(--fg-dim)' }}>{genres.length} genres</span>
            </div>
          </div>
        </Reveal>

        <div className="pg-toolbar">
          <div className="left">
            <span><b>{selectedArr.length}</b> selected · <b>{totalTracks}</b> tracks</span>
            <div className="pg-actions">
              {(['all', 'popular', 'selected'] as const).map((f) => (
                <button key={f} className={`f-pill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="f-pill" onClick={() => { filtered.forEach((x) => selected.add(x.name)); setSelected(new Set(selected)); }}>
              Select all
            </button>
            <button className="f-pill" onClick={() => { setSelected(new Set()); setUserTouchedName(false); }}>
              Clear
            </button>
            <div className="search">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="5" cy="5" r="3.5" /><path d="M8 8 L11 11" />
              </svg>
              <input type="text" placeholder="search genres…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="g-grid">
          {filtered.map(({ name, count }) => (
            <div
              key={name}
              className={`g-cell ${selected.has(name) ? 'on' : ''}`}
              onClick={() => toggleGenre(name)}
            >
              <span className="g-name">{name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="g-count">{count}</span>
                <span className="g-check" />
              </span>
            </div>
          ))}
        </div>

        <div className="pg-bottom">
          <div className="pane">
            <div className="pane-label">
              <span>◇ Playlist name</span>
              <span className="mute">{playlistName.trim() ? 'ok' : 'required'}</span>
            </div>
            <input
              className="pl-name-input"
              placeholder="untitled · electronic + house"
              maxLength={60}
              value={playlistName}
              onChange={(e) => { setPlaylistName(e.target.value); setUserTouchedName(e.target.value.length > 0); }}
            />
            <div className="pl-name-hint">
              <span className="mute">auto-generated from your selection · editable</span>
              <span className="count"><b>{playlistName.length}</b>/60</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <div className="pane-label" style={{ marginBottom: 8 }}><span>Suggestions</span><span /></div>
              <div className="suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="s" onClick={() => { setPlaylistName(s); setUserTouchedName(true); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pane">
            <div className="pane-label"><span>◇ Summary</span><span className="mute">preview</span></div>
            <div className="sum-kvs">
              <div className="sum-kv"><span className="k">Genres</span><span className="v">{selectedArr.length}</span></div>
              <div className="sum-kv"><span className="k">Tracks</span><span className="v">{totalTracks}</span></div>
              <div className="sum-kv"><span className="k">Runtime</span><span className="v">{runtime}</span></div>
              <div className="sum-kv"><span className="k">Est. size</span><span className="v">{size}</span></div>
            </div>
            <div className="sum-chips">
              {selectedArr.length === 0 ? (
                <span className="c" style={{ color: 'var(--fg-mute)' }}>no genres selected</span>
              ) : (
                <>
                  {selectedArr.slice(0, 10).map((n) => <span key={n} className="c">{n}</span>)}
                  {selectedArr.length > 10 && <span className="c more">+{selectedArr.length - 10} more</span>}
                </>
              )}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>
              target · <span style={{ color: 'var(--fg)' }}>Spotify / user</span>
            </div>
          </div>
        </div>

        <div className="pg-cta-row">
          <Link className="back" href="/dashboard">
            <span>←</span><span>Back to dashboard</span>
          </Link>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>
              {selectedArr.length === 0 ? 'select at least 1 genre' : !playlistName.trim() ? 'name your playlist' : `ready to write ${totalTracks} tracks`}
            </span>
            <button
              className={`btn btn-solid ${canCreate ? '' : 'disabled'}`}
              onClick={handleCreate}
            >
              <span>Create playlist</span><span className="arrow">→</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
