'use client';
import { useSyncExternalStore } from 'react';

const noop = () => () => {};
/** False during prerender and the first client render, true after; keeps persisted state out of hydration. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
