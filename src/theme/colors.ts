/**
 * @DEPRECATED — legacy hardcoded-hex palette.
 *
 * `theme/themeColors.ts` (HSL design tokens) is the single source of truth for
 * app theming and is used by every screen via `getThemeColor`. This module is
 * retained ONLY for backward compatibility with `__tests__/theme/theme.test.ts`
 * and for static, theme-agnostic constants (`statusColors`, `categoryColors`,
 * `shadows`, `borderRadius`). Do NOT add new app theming from here — use
 * `themeColors` / `getThemeColor` instead.
 */
export const colors = {
  light: {
    background: '#fafafa',
    foreground: '#1f2937',
    card: '#ffffff',
    cardForeground: '#1f2937',
    popover: '#ffffff',
    popoverForeground: '#1f2937',
    primary: '#39d08a',
    primaryForeground: '#ffffff',
    secondary: '#f3f4f6',
    secondaryForeground: '#1f2937',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    accent: '#f0f2f5',
    accentForeground: '#1f2937',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    border: '#d1d5db',
    input: '#d1d5db',
    ring: '#39d08a',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f1f5f9',
    card: '#1e293b',
    cardForeground: '#f1f5f9',
    popover: '#1e293b',
    popoverForeground: '#f1f5f9',
    primary: '#39d08a',
    primaryForeground: '#ffffff',
    secondary: '#334155',
    secondaryForeground: '#f1f5f9',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#334155',
    accentForeground: '#f1f5f9',
    destructive: '#f87171',
    destructiveForeground: '#ffffff',
    border: '#334155',
    input: '#334155',
    ring: '#39d08a',
  },
  gradient: {
    start: '#ef4444',
    end: '#ec4899',
    startHover: '#dc2626',
    endHover: '#db2777',
  },
};

export const statusColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
};

export const categoryColors = {
  entertainment: '#ef4444',
  gaming: '#8b5cf6',
  education: '#3b82f6',
  tech: '#10b981',
  music: '#f59e0b',
  news: '#6366f1',
  sports: '#14b8a6',
  lifestyle: '#ec4899',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const borderRadius = {
  sm: 6,
  default: 10,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};