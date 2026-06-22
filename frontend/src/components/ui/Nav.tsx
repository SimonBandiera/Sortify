'use client';

import Link from 'next/link';
import { useT } from '@/lib/translations';
import { useLangPath } from '@/lib/useLocale';

interface NavProps {
  variant?: 'landing' | 'dashboard' | 'step';
  stepLabel?: string;
  userName?: string;
  spotifyAuthUrl?: string;
}

export default function Nav({ variant = 'landing', stepLabel, userName, spotifyAuthUrl }: NavProps) {
  const t = useT();
  const lp = useLangPath();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href={variant === 'landing' ? lp('/') : lp('/dashboard')} className="nav-brand">
          sortify
        </Link>

        {variant === 'landing' && (
          <>
            <div className="nav-links">
              <a href="#how">{t.nav_how}</a>
              <a href="#demo">{t.nav_demo}</a>
              <a href="#genres">{t.nav_genres}</a>
              <a href="#faq">{t.nav_faq}</a>
              <a href="#github">{t.nav_github}</a>
            </div>
            <a className="btn btn-solid" href={spotifyAuthUrl || '#connect'}>
              <span>{t.nav_connect_spotify}</span>
              <span className="arrow">→</span>
            </a>
          </>
        )}

        {variant === 'dashboard' && userName && (
          <div className="dash-user">
            <div className="who">
              <span>{t.nav_connected_as}</span>
              <b>{userName}</b>
            </div>
            <a href="/auth/logout" className="dash-logout" aria-label={t.nav_logout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M10 3 H13 V13 H10" />
                <path d="M2 8 H11 M8 5 L11 8 L8 11" />
              </svg>
            </a>
          </div>
        )}

        {variant === 'step' && stepLabel && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em',
            color: 'var(--fg-mute)'
          }}>
            <span>{t.nav_step}</span>
            <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{stepLabel}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
