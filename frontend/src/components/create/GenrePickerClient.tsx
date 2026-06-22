'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import Reveal from '@/components/ui/Reveal';
import { useT } from '@/lib/translations';
import { useLangPath } from '@/lib/useLocale';

interface Genre {
  name: string;
  count: number;
}

type Filter = 'all' | 'popular' | 'selected';

interface GenrePickerClientProps {
  playlistId: string;
}

export default function GenrePickerClient({ playlistId }: GenrePickerClientProps) {
  const router = useRouter();
  const t = useT();
  const lp = useLangPath();

  const SUGGESTIONS = [
    t.create_suggestion_car,
    t.create_suggestion_night,
    t.create_suggestion_sunday,
    t.create_suggestion_focus,
    t.create_suggestion_workout,
    t.create_suggestion_nostalgia,
  ];

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [userTouchedName, setUserTouchedName] = useState(false);
  const [loading, setLoading] = useState(true);
  const sourceName = (() => { try { return sessionStorage.getItem('sortify_sort_name') ?? 'source playlist'; } catch { return 'source playlist'; } })();

  useEffect(() => {
    setLoading(true);
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
      .catch(() => {})
      .finally(() => setLoading(false));
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
      const t0 = Date.now();
      const res = await fetch(`/api/playlists/${playlistId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName, genres: selectedArr }),
      });
      if (res.ok) {
        const durationMs = Date.now() - t0;
        const data = await res.json();
        const spotifyUrl = data?.external_urls?.spotify;
        if (spotifyUrl) {
          try { sessionStorage.setItem('sortify_done', JSON.stringify({ spotifyUrl, name: playlistName, genres: selectedArr, tracks: totalTracks, tracksAdded: data?.tracks?.total ?? totalTracks, durationMs, ownerName: data?.owner_name })); } catch {}
        }
        router.push(lp(`/finish/${playlistId}`));
      }
    } catch {
      // stay on page — user can retry
    }
  }, [playlistId, playlistName, selectedArr, router, lp]);

  const mins = Math.floor(totalTracks * 3.5);
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const runtime = (hh > 0 ? hh + 'h ' : '') + String(mm).padStart(2, '0') + 'm';
  const size = totalTracks > 0 ? Math.round(totalTracks * 3.8) + ' mb' : '—';
  const canCreate = selectedArr.length > 0 && playlistName.trim().length > 0;

  const filterLabels: Record<Filter, string> = {
    all: t.create_filter_all,
    popular: t.create_filter_popular,
    selected: t.create_filter_selected,
  };

  return (
    <>
      <Nav variant="step" stepLabel="03 / 03" />
      <main className="page">
        <Reveal>
          <div className="pg-head">
            <div>
              <h1>Last <span className="lo">step.</span></h1>
              <p className="pg-sub">{t.create_sub}</p>
            </div>
            <div className="pg-source">
              <span>{t.create_sorting_from}</span>
              <b>{sourceName}</b>
              <span style={{ color: 'var(--fg-dim)' }}>{t.create_genres_count.replace('{n}', String(genres.length))}</span>
            </div>
          </div>
        </Reveal>

        <div className="pg-toolbar">
          <div className="left">
            <span><b>{selectedArr.length}</b> {t.create_selected_label} · <b>{totalTracks}</b> {t.create_tracks_label}</span>
            <div className="pg-actions">
              {(['all', 'popular', 'selected'] as const).map((f) => (
                <button key={f} className={`f-pill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                  {filterLabels[f]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="f-pill" onClick={() => { filtered.forEach((x) => selected.add(x.name)); setSelected(new Set(selected)); }}>
              {t.create_select_all}
            </button>
            <button className="f-pill" onClick={() => { setSelected(new Set()); setUserTouchedName(false); }}>
              {t.create_clear}
            </button>
            <div className="search">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="5" cy="5" r="3.5" /><path d="M8 8 L11 11" />
              </svg>
              <input type="text" placeholder={t.create_search_placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
            {t.create_loading}
          </div>
        ) : genres.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
            {t.create_no_genres}
          </div>
        ) : (
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
        )}

        <div className="pg-bottom">
          <div className="pane">
            <div className="pane-label">
              <span>{t.create_pl_name_section}</span>
              <span className="mute">{playlistName.trim() ? t.create_pl_name_ok : t.create_pl_name_required}</span>
            </div>
            <input
              className="pl-name-input"
              placeholder={t.create_pl_name_placeholder}
              maxLength={60}
              value={playlistName}
              onChange={(e) => { setPlaylistName(e.target.value); setUserTouchedName(e.target.value.length > 0); }}
            />
            <div className="pl-name-hint">
              <span className="mute">{t.create_pl_name_hint}</span>
              <span className="count"><b>{playlistName.length}</b>/60</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <div className="pane-label" style={{ marginBottom: 8 }}><span>{t.create_suggestions_label}</span><span /></div>
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
            <div className="pane-label"><span>{t.create_summary_section}</span><span className="mute">{t.create_summary_preview}</span></div>
            <div className="sum-kvs">
              <div className="sum-kv"><span className="k">{t.create_kv_genres}</span><span className="v">{selectedArr.length}</span></div>
              <div className="sum-kv"><span className="k">{t.create_kv_tracks}</span><span className="v">{totalTracks}</span></div>
              <div className="sum-kv"><span className="k">{t.create_kv_runtime}</span><span className="v">{runtime}</span></div>
              <div className="sum-kv"><span className="k">{t.create_kv_est_size}</span><span className="v">{size}</span></div>
            </div>
            <div className="sum-chips">
              {selectedArr.length === 0 ? (
                <span className="c" style={{ color: 'var(--fg-mute)' }}>{t.create_no_genres_selected}</span>
              ) : (
                <>
                  {selectedArr.slice(0, 10).map((n) => <span key={n} className="c">{n}</span>)}
                  {selectedArr.length > 10 && <span className="c more">+{selectedArr.length - 10} more</span>}
                </>
              )}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>
              {t.create_target} <span style={{ color: 'var(--fg)' }}>Spotify / user</span>
            </div>
          </div>
        </div>

        <div className="pg-cta-row">
          <Link className="back" href={lp('/dashboard')}>
            <span>←</span><span>{t.create_back}</span>
          </Link>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-mute)' }}>
              {selectedArr.length === 0
                ? t.create_hint_select
                : !playlistName.trim()
                  ? t.create_hint_name
                  : t.create_hint_ready.replace('{n}', String(totalTracks))}
            </span>
            <button
              className={`btn btn-solid ${canCreate ? '' : 'disabled'}`}
              onClick={handleCreate}
            >
              <span>{t.create_btn}</span><span className="arrow">→</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
