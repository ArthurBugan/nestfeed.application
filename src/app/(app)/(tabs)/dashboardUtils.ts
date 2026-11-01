import type { Anime } from '@/types';

/**
 * Pure presentation/formatting helpers for the Dashboard home screen.
 * Kept free of React/RN imports so they can be unit tested directly (a full
 * `<DashboardHome/>` render is not runnable under this repo's jest+Node setup
 * because `react-native 0.88`'s ESM `ScrollView` cannot be `require()`d).
 */

/** Compact a raw count for the bento tiles: 1234 → "1.2k", 10000 → "10k". */
export function formatCount(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 10000) {
    const k = n / 1000;
    return `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return n.toLocaleString();
}

/** The `n` most-recently-updated animes, newest first. */
export function latestAnimes(animes: Anime[], n: number): Anime[] {
  return animes
    .filter((a) => a.updatedAt)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, n);
}
