/**
 * Theme-reactive token resolution for native props.
 *
 * uniwind classes (`bg-surface`) update automatically for the active theme,
 * but native props (tintColor, RefreshControl, sheet backgrounds…) need a JS
 * color. `useTokenColor` resolves the CSS variable for the ACTIVE theme —
 * including the `groupify` brand theme — via heroui-native's CSS-variable hook.
 *
 * heroui's `useThemeColor` expects kebab-case token names and reads
 * `--color-<name>` directly, so no name transformation happens here.
 */

import { useThemeColor } from 'heroui-native/hooks';
import type { ThemeColorKey } from './themeColors';

const TOKENS = [
  'background', 'foreground', 'surface', 'surface-secondary', 'surface-tertiary',
  'overlay', 'separator', 'border', 'accent', 'accent-foreground', 'muted',
  'default', 'default-foreground', 'field-background', 'field-placeholder',
  'field-border', 'success', 'warning', 'danger', 'focus', 'link', 'segment',
] as const satisfies readonly ThemeColorKey[];

export type TokenColorKey = (typeof TOKENS)[number];

/**
 * Returns the current color for `key` in the ACTIVE uniwind theme.
 * Use for native props only; prefer `className` everywhere else.
 */
export function useTokenColor(key: TokenColorKey): string {
  // Cast: heroui's ThemeColor union doesn't know our app-specific tokens
  // (field-background etc.), but the CSS variables exist in global.css.
  return useThemeColor(key as never);
}

/** Inline style value for a token in the active theme. */
export function tokenCssVar(key: TokenColorKey): string {
  return `var(--color-${key})`;
}
