import { formatCount, latestAnimes } from '@/app/(app)/(tabs)/dashboardUtils';
import type { Anime } from '@/types';

describe('dashboardUtils.formatCount', () => {
  it('returns an em-dash for null/undefined', () => {
    expect(formatCount(null)).toBe('—');
    expect(formatCount(undefined)).toBe('—');
  });

  it('formats small counts as-is with locale grouping', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(7)).toBe('7');
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1234)).toBe('1,234');
    expect(formatCount(9999)).toBe('9,999');
  });

  it('compacts counts at 10k+ to k notation', () => {
    expect(formatCount(10000)).toBe('10k');
    expect(formatCount(12345)).toBe('12.3k');
    expect(formatCount(1500)).toBe('1,500');
  });
});

describe('dashboardUtils.latestAnimes', () => {
  const a = (id: string, updatedAt?: string, groupName?: string): Anime =>
    ({ id, name: id, updatedAt, groupName } as Anime);

  it('sorts by updatedAt descending', () => {
    const input = [a('old', '2026-01-01T00:00:00Z'), a('new', '2026-10-01T00:00:00Z'), a('mid', '2026-05-01T00:00:00Z')];
    expect(latestAnimes(input, 10).map((x) => x.id)).toEqual(['new', 'mid', 'old']);
  });

  it('caps the result to n entries', () => {
    const input = [a('a', '2026-01-01T00:00:00Z'), a('b', '2026-02-01T00:00:00Z'), a('c', '2026-03-01T00:00:00Z'), a('d', '2026-04-01T00:00:00Z')];
    expect(latestAnimes(input, 2).map((x) => x.id)).toEqual(['d', 'c']);
  });

  it('drops entries without an updatedAt and returns empty for no input', () => {
    const input = [a('no-date'), a('dated', '2026-06-01T00:00:00Z')];
    expect(latestAnimes(input, 5).map((x) => x.id)).toEqual(['dated']);
    expect(latestAnimes([], 3)).toEqual([]);
  });
});
