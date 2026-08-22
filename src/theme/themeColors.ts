export const themeColors = {
  light: {
    background: 'hsl(120 20% 98%)',
    foreground: 'hsl(145 18% 12%)',
    surface: 'hsl(0 0% 100%)',
    'surface-secondary': 'hsl(140 18% 95%)',
    overlay: 'hsl(0 0% 100%)',
    accent: 'hsl(158 72% 38%)',
    'accent-foreground': 'hsl(0 0% 100%)',
    'muted': 'hsl(145 8% 44%)',
    default: 'hsl(140 18% 94%)',
    'default-foreground': 'hsl(145 24% 18%)',
    'field-border': 'hsl(140 10% 86%)',
    'field-background': 'hsl(120 33% 100%)',
    'field-placeholder': 'hsl(145 12% 58%)',
    danger: 'hsl(0 78% 56%)',
    border: 'hsl(140 12% 88%)',
    success: 'hsl(155 68% 40%)',
    warning: 'hsl(38 92% 52%)',

    card: 'hsl(0 0% 100%)',
    popover: 'hsl(0 0% 100%)',
    primary: 'hsl(158 72% 38%)',
    'primary-foreground': 'hsl(0 0% 100%)',
    secondary: 'hsl(140 18% 94%)',
    'secondary-foreground': 'hsl(145 24% 18%)',
    'muted-foreground': 'hsl(145 8% 44%)',
    input: 'hsl(140 10% 86%)',
    destructive: 'hsl(0 78% 56%)',
  },
  dark: {
    background: 'hsl(150 12% 5%)',
    foreground: 'hsl(140 16% 94%)',
    surface: 'hsl(150 10% 8%)',
    'surface-secondary': 'hsl(150 10% 12%)',
    overlay: 'hsl(150 10% 10%)',
    accent: 'hsl(158 78% 48%)',
    'accent-foreground': 'hsl(155 24% 8%)',
    muted: 'hsl(145 8% 64%)',
    default: 'hsl(150 10% 14%)',
    'default-foreground': 'hsl(140 12% 92%)',
    'field-border': 'hsl(150 8% 18%)',
    'field-background': 'hsl(150 10% 9%)',
    'field-placeholder': 'hsl(150 12% 64%)',
    danger: 'hsl(0 78% 60%)',
    border: 'hsl(150 8% 18%)',
    success: 'hsl(158 78% 48%)',
    warning: 'hsl(40 92% 56%)',

    card: 'hsl(150 10% 8%)',
    popover: 'hsl(150 10% 10%)',
    primary: 'hsl(158 78% 48%)',
    'primary-foreground': 'hsl(155 24% 8%)',
    secondary: 'hsl(150 10% 14%)',
    'secondary-foreground': 'hsl(140 12% 92%)',
    'muted-foreground': 'hsl(145 8% 64%)',
    input: 'hsl(150 8% 18%)',
    destructive: 'hsl(0 78% 60%)',
  },
};

export type ThemeColorKey = keyof typeof themeColors.light;

export function getThemeColor(key: ThemeColorKey, isDark: boolean): string {
  const theme = isDark ? themeColors.dark : themeColors.light;
  return theme[key];
}
