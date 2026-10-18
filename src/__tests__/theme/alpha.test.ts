import { alpha, ALPHA } from '../../theme/alpha';

describe('alpha()', () => {
  it('converts hsl tokens to hsla', () => {
    expect(alpha('hsl(158 72% 38%)', 0.08)).toBe('hsla(158, 72%, 38%, 0.08)');
  });

  it('converts hex tokens to 8-digit hex', () => {
    expect(alpha('#39d08a', 0.5)).toBe('#39d08a80');
  });

  it('converts rgb/rgba inputs and keeps/overrides existing alpha', () => {
    expect(alpha('rgb(0 0 0)', 0.25)).toBe('rgba(0, 0, 0, 0.25)');
    expect(alpha('hsl(0 0% 0% / 24%)', 0.08)).toBe('hsla(0, 0%, 0%, 0.08)');
  });

  it('clamps alpha to 0..1', () => {
    expect(alpha('hsl(158 72% 38%)', -1)).toBe('hsla(158, 72%, 38%, 0)');
    expect(alpha('hsl(158 72% 38%)', 5)).toBe('hsla(158, 72%, 38%, 1)');
  });

  it('returns unparseable colors unchanged (no silent transparency)', () => {
    expect(alpha('not-a-color', 0.08)).toBe('not-a-color');
  });

  it('exposes preset amounts', () => {
    expect(ALPHA.subtle).toBeLessThan(ALPHA.soft);
    expect(ALPHA.soft).toBeLessThan(ALPHA.tint);
  });
});
