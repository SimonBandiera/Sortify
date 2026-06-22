'use client';

import { createContext, useContext } from 'react';
import type { Dictionary } from './dictionary';

const TranslationsContext = createContext<Dictionary>({} as Dictionary);

export function TranslationsProvider({
  dict,
  children,
}: {
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={dict}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useT(): Dictionary {
  return useContext(TranslationsContext);
}
