'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { u?: string; props?: Record<string, unknown> },
    ) => void;
  }
}

// Flows whose URLs carry a high-cardinality playlist id we don't want indexed.
const DYNAMIC_FLOWS = new Set(['create', 'finish', 'sort']);

// Collapse the playlist id while keeping the language prefix:
//   /en/create/1K84pPCysk0B5Lrs2YBcfa -> /en/create
//   /sort/4CMIJgq4kve0cPmSF8g9Mv      -> /sort
// Every other path is reported unchanged.
export function normalizePath(pathname: string): string {
  const segments = pathname.split('/');
  const flowIndex = segments.findIndex((segment) => DYNAMIC_FLOWS.has(segment));
  if (flowIndex !== -1) {
    return segments.slice(0, flowIndex + 1).join('/') || '/';
  }
  return pathname || '/';
}

export default function PlausibleTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.plausible !== 'function') {
      return;
    }
    const url = window.location.origin + normalizePath(pathname);
    if (lastSent.current === url) return;
    lastSent.current = url;
    window.plausible('pageview', { u: url });
  }, [pathname]);

  return null;
}
