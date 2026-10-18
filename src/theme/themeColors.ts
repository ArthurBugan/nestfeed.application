/**
 * Design tokens — the single source of truth for app theming.
 *
 * Every key exists in ALL THREE themes (light, dark, groupify) — enforced by
 * `src/__tests__/theme/theme.test.ts`. Mirrored as CSS variables in
 * `global.css` so uniwind classes like `bg-surface-secondary` /
 * `text-field-placeholder` stay theme-reactive in every theme.
 *
 * Theme variants:
 *   - light     — default daylight palette
 *   - dark      — neutral dark palette
 *   - groupify  — brand identity: dark emerald + mint accent
 *
 * Usage:
 *   getThemeColor('accent', isDark)            // light/dark palettes
 *   getThemeColor('accent', true, 'groupify')  // explicit variant
 *
 * For tokens that must follow the *active* theme in native props
 * (tintColor, RefreshControl, sheet backgrounds…), prefer
 * `useTokenColor(key)` from `src/theme/useTokenColor.ts` — it resolves the
 * CSS variable for whichever theme is active (including groupify).
 *
 * Corner-radius scale (apply consistently; see specs/001 + 005):
 *   - rounded-lg      (8px)  chips, icon squares inside rows
 *   - rounded-xl     (12px)  inputs, selects, list rows, quick actions
 *   - rounded-card   (16px)  cards, tiles, settings groups
 *   - rounded-tile   (26px)  feature tiles, bento modules
 *   - rounded-sheet  (28px)  sheets, floating bars
 *   - rounded-full          avatars, pills
 */

export const THEME_VARIANTS = ['light', 'dark', 'groupify'] as const;
export type ThemeVariant = (typeof THEME_VARIANTS)[number];

export const themeColors = {
  light: {
    background: 'hsl(120 20% 98%)',
    foreground: 'hsl(145 18% 12%)',
    surface: 'hsl(0 0% 100%)',
    'surface-foreground': 'hsl(145 18% 12%)',
    'surface-secondary': 'hsl(140 18% 95%)',
    'surface-secondary-foreground': 'hsl(145 18% 14%)',
    'surface-tertiary': 'hsl(140 14% 91%)',
    'surface-tertiary-foreground': 'hsl(145 18% 14%)',
    overlay: 'hsl(0 0% 100%)',
    'overlay-foreground': 'hsl(145 18% 14%)',
    separator: 'hsl(140 10% 90%)',
    border: 'hsl(140 12% 88%)',
    accent: 'hsl(158 72% 30%)',
    'accent-foreground': 'hsl(0 0% 100%)',
    muted: 'hsl(145 9% 42%)',
    'muted-foreground': 'hsl(145 9% 42%)',
    default: 'hsl(140 18% 94%)',
    'default-foreground': 'hsl(145 24% 18%)',
    'field-background': 'hsl(120 33% 100%)',
    'field-foreground': 'hsl(145 18% 12%)',
    'field-placeholder': 'hsl(145 10% 43%)',
    'field-border': 'hsl(140 10% 86%)',
    success: 'hsl(155 68% 30%)',
    'success-foreground': 'hsl(0 0% 100%)',
    'accent-soft': 'hsl(160 48% 91%)',
    'success-soft': 'hsl(150 48% 87%)',
    'warning-soft': 'hsl(44 88% 89%)',
    teal: 'hsl(176 58% 30%)',
    'teal-foreground': 'hsl(0 0% 100%)',
    'teal-soft': 'hsl(180 46% 89%)',
    lime: 'hsl(96 52% 33%)',
    'lime-foreground': 'hsl(0 0% 100%)',
    'lime-soft': 'hsl(100 46% 89%)',
    'rose-soft': 'hsl(6 65% 91%)',
    warning: 'hsl(38 92% 38%)',
    'warning-foreground': 'hsl(30 35% 10%)',
    danger: 'hsl(0 75% 48%)',
    'danger-foreground': 'hsl(0 0% 100%)',
    focus: 'hsl(158 72% 34%)',
    link: 'hsl(160 74% 28%)',
    segment: 'hsl(140 16% 96%)',
    'segment-foreground': 'hsl(145 18% 12%)',

    /* Contrast-safe foregrounds for content placed on saturated gradient
       surfaces (e.g. dashboard shortcut cards). Solid colors — never alpha. */
    'on-gradient': 'hsl(0 0% 100%)',
    'on-gradient-muted': 'hsl(0 0% 88%)',

    /* Legacy aliases (kept for compatibility; prefer the tokens above). */
    card: 'hsl(0 0% 100%)',
    popover: 'hsl(0 0% 100%)',
    primary: 'hsl(158 72% 30%)',
    'primary-foreground': 'hsl(0 0% 100%)',
    secondary: 'hsl(140 18% 94%)',
    'secondary-foreground': 'hsl(145 24% 18%)',
    input: 'hsl(140 10% 86%)',
    destructive: 'hsl(0 75% 48%)',
  },
  dark: {
    background: 'hsl(150 12% 5%)',
    foreground: 'hsl(140 16% 94%)',
    surface: 'hsl(150 10% 8%)',
    'surface-foreground': 'hsl(140 16% 94%)',
    'surface-secondary': 'hsl(150 10% 12%)',
    'surface-secondary-foreground': 'hsl(140 16% 92%)',
    'surface-tertiary': 'hsl(150 10% 16%)',
    'surface-tertiary-foreground': 'hsl(140 16% 92%)',
    overlay: 'hsl(150 10% 10%)',
    'overlay-foreground': 'hsl(140 16% 94%)',
    separator: 'hsl(150 8% 16%)',
    border: 'hsl(150 8% 18%)',
    accent: 'hsl(158 78% 48%)',
    'accent-foreground': 'hsl(155 24% 8%)',
    muted: 'hsl(145 8% 64%)',
    'muted-foreground': 'hsl(145 8% 64%)',
    default: 'hsl(150 10% 14%)',
    'default-foreground': 'hsl(140 12% 92%)',
    'field-background': 'hsl(150 10% 9%)',
    'field-foreground': 'hsl(140 16% 94%)',
    'field-placeholder': 'hsl(150 12% 64%)',
    'field-border': 'hsl(150 8% 18%)',
    success: 'hsl(158 78% 48%)',
    'success-foreground': 'hsl(155 24% 8%)',
    'accent-soft': 'hsl(158 24% 13%)',
    'success-soft': 'hsl(155 26% 12%)',
    'warning-soft': 'hsl(40 26% 14%)',
    teal: 'hsl(176 62% 46%)',
    'teal-foreground': 'hsl(155 24% 8%)',
    'teal-soft': 'hsl(185 24% 12%)',
    lime: 'hsl(98 55% 47%)',
    'lime-foreground': 'hsl(155 24% 8%)',
    'lime-soft': 'hsl(100 24% 12%)',
    'rose-soft': 'hsl(6 28% 15%)',
    warning: 'hsl(40 92% 56%)',
    'warning-foreground': 'hsl(30 35% 10%)',
    danger: 'hsl(0 78% 52%)',
    'danger-foreground': 'hsl(0 0% 100%)',
    focus: 'hsl(158 78% 52%)',
    link: 'hsl(160 88% 62%)',
    segment: 'hsl(150 10% 9%)',
    'segment-foreground': 'hsl(140 16% 94%)',

    'on-gradient': 'hsl(0 0% 100%)',
    'on-gradient-muted': 'hsl(0 0% 88%)',

    card: 'hsl(150 10% 8%)',
    popover: 'hsl(150 10% 10%)',
    primary: 'hsl(158 78% 48%)',
    'primary-foreground': 'hsl(155 24% 8%)',
    secondary: 'hsl(150 10% 14%)',
    'secondary-foreground': 'hsl(140 12% 92%)',
    input: 'hsl(150 8% 18%)',
    destructive: 'hsl(0 78% 52%)',
  },
  groupify: {
    background: 'hsl(160 18% 4%)',
    foreground: 'hsl(150 22% 95%)',
    surface: 'hsl(158 16% 7%)',
    'surface-foreground': 'hsl(150 22% 95%)',
    'surface-secondary': 'hsl(158 14% 11%)',
    'surface-secondary-foreground': 'hsl(150 18% 94%)',
    'surface-tertiary': 'hsl(158 12% 16%)',
    'surface-tertiary-foreground': 'hsl(150 18% 92%)',
    overlay: 'hsl(158 16% 9%)',
    'overlay-foreground': 'hsl(150 22% 95%)',
    separator: 'hsl(158 10% 16%)',
    border: 'hsl(158 10% 18%)',
    accent: 'hsl(164 84% 46%)',
    'accent-foreground': 'hsl(160 32% 8%)',
    muted: 'hsl(150 8% 62%)',
    'muted-foreground': 'hsl(150 8% 62%)',
    default: 'hsl(158 12% 13%)',
    'default-foreground': 'hsl(150 16% 92%)',
    'field-background': 'hsl(158 14% 9%)',
    'field-foreground': 'hsl(150 22% 95%)',
    'field-placeholder': 'hsl(150 8% 50%)',
    'field-border': 'hsl(158 10% 18%)',
    success: 'hsl(164 84% 46%)',
    'success-foreground': 'hsl(160 32% 8%)',
    'accent-soft': 'hsl(158 30% 11%)',
    'success-soft': 'hsl(160 34% 10%)',
    'warning-soft': 'hsl(40 26% 13%)',
    teal: 'hsl(178 66% 44%)',
    'teal-foreground': 'hsl(160 32% 8%)',
    'teal-soft': 'hsl(185 28% 11%)',
    lime: 'hsl(100 58% 45%)',
    'lime-foreground': 'hsl(160 32% 8%)',
    'lime-soft': 'hsl(100 26% 11%)',
    'rose-soft': 'hsl(6 28% 14%)',
    warning: 'hsl(40 92% 56%)',
    'warning-foreground': 'hsl(30 35% 10%)',
    danger: 'hsl(0 82% 51%)',
    'danger-foreground': 'hsl(0 0% 100%)',
    focus: 'hsl(164 84% 52%)',
    link: 'hsl(164 90% 58%)',
    segment: 'hsl(158 14% 8%)',
    'segment-foreground': 'hsl(150 22% 95%)',

    'on-gradient': 'hsl(0 0% 100%)',
    'on-gradient-muted': 'hsl(0 0% 88%)',

    card: 'hsl(158 16% 7%)',
    popover: 'hsl(158 16% 9%)',
    primary: 'hsl(164 84% 46%)',
    'primary-foreground': 'hsl(160 32% 8%)',
    secondary: 'hsl(158 12% 13%)',
    'secondary-foreground': 'hsl(150 16% 92%)',
    input: 'hsl(158 10% 18%)',
    destructive: 'hsl(0 82% 51%)',
  },
} as const;

export type ThemeColorKey = keyof typeof themeColors.light;

/** Resolve the palette for a theme mode. `system` maps to light/dark. */
export function themeVariantFor(theme: string, systemDark: boolean): ThemeVariant {
  if (theme === 'groupify') return 'groupify';
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemDark ? 'dark' : 'light';
}

export function getThemeColor(
  key: ThemeColorKey,
  isDark: boolean,
  variant: ThemeVariant = isDark ? 'dark' : 'light'
): string {
  return themeColors[variant][key];
}
