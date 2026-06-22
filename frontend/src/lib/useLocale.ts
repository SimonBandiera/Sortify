'use client';

import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { LOCALES, DEFAULT_LOCALE } from './locales';
import type { Locale } from './locales';

export function useLocale(): Locale {
  const pathname = usePathname();
  const segment = pathname.split('/')[1];
  return LOCALES.includes(segment as Locale) ? (segment as Locale) : DEFAULT_LOCALE;
}

export function useLangPath() {
  const locale = useLocale();
  return useCallback((path: string) => `/${locale}${path}`, [locale]);
}
