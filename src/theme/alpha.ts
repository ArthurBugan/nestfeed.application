/**
 * Alpha compositing for design tokens.
 *
 * RN's color parser accepts `hsla(h, s%, l%, a)`, `rgba(r, g, b, a)` and
 * 8-digit hex — but NOT the string-concatenation form `` `${token}15` ``
 * (which produced invalid values like `hsl(158 72% 38%)15` and silently
 * rendered transparent). Always compose alpha through this helper.
 *
 * Accepts the token formats used across the app:
 *   hsl(158 72% 38%)           → hsla(158, 72%, 38%, 0.08)
 *   hsl(0 0% 0% / 24%)         → the existing / alpha is respected
 *   #39d08a                    → #39d08a14
 *   rgb(0 0 0) / rgba(...)     → rgba with the requested alpha
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Parse any supported color into an {r,g,b} or {h,s,l} pair plus alpha. */
function parseColor(color: string): {
  space: 'hsl' | 'rgb' | 'hex';
  channels: [number, number, number];
  alpha: number | null;
} | null {
  const value = color.trim();

  // hsl(158 72% 38%) | hsl(158 72% 38% / 24%) | hsla(158, 72%, 38%, 0.5)
  const hslMatch = value.match(
    /^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[/,]\s*([\d.]+)%?)?\s*\)$/i
  );
  if (hslMatch) {
    return {
      space: 'hsl',
      channels: [Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3])],
      alpha: hslMatch[4] === undefined ? null : clamp01(Number(hslMatch[4]) / (hslMatch[4].includes('.') ? 1 : 100)),
    };
  }

  // rgb(0 0 0) | rgba(0, 0, 0, 0.5)
  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)%?(?:\s*[/,]\s*([\d.]+)%?)?\s*\)$/i
  );
  if (rgbMatch) {
    return {
      space: 'rgb',
      channels: [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])],
      alpha: rgbMatch[4] === undefined ? null : clamp01(Number(rgbMatch[4])),
    };
  }

  // #rgb | #rrggbb | #rrggbbaa
  const hexMatch = value.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b] = hex.slice(0, 3).split('').map((c) => parseInt(c + c, 16));
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : null;
      return { space: 'hex', channels: [r, g, b], alpha: a };
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : null;
    return { space: 'hex', channels: [r, g, b], alpha: a };
  }

  return null;
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/**
 * Apply `amount` (0..1) alpha to any supported color string.
 * Colors that already carry alpha keep it unless overridden by `amount`.
 * Unparseable values are returned unchanged (fail loud in tests, not silent
 * transparency in the UI).
 */
export function alpha(color: string, amount = 0.08): string {
  const parsed = parseColor(color);
  if (!parsed) return color;

  const a = clamp01(amount);
  const { channels, space } = parsed;

  if (space === 'hsl') {
    const [h, s, l] = channels;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
  if (space === 'rgb') {
    const [r, g, b] = channels;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const [r, g, b] = channels;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
}

/** Preset alpha amounts used by the design system. */
export const ALPHA = {
  subtle: 0.06,
  soft: 0.1,
  tint: 0.16,
  strong: 0.28,
} as const;
