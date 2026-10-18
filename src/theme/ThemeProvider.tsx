import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../stores';
import { setHapticsEnabled } from './haptics';

const THEME_KEY = 'theme_mode';

export type ThemeMode = 'light' | 'dark' | 'groupify' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  /** The concrete palette variant in effect (resolves `system`). */
  variant: 'light' | 'dark' | 'groupify';
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  /** Display preference: scales body text across the app. */
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  /** Display preference: minimizes non-essential motion/animations. */
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  /** Display preference: toggles haptic feedback (independent of motion). */
  hapticsEnabled: boolean;
  setHapticsEnabledPref: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const {
    isDarkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    reduceMotion,
    setReduceMotion,
    hapticsEnabled,
    setHapticsEnabled: setHapticsEnabledStore,
  } = useAppStore();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  // Track the system scheme in state so runtime changes re-render consumers.
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  // Load saved theme on mount (non-blocking)
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system' || saved === 'groupify') {
          setThemeState(saved);
        }
      })
      .catch((error) => {
        console.error('Failed to load theme:', error);
      });
  }, []);

  // Subscribe to system theme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener((pref) => {
      setSystemScheme(pref.colorScheme);
    });
    return () => sub.remove();
  }, []);

  // Determine if dark mode is active
  const resolvedSystemScheme = systemScheme ?? 'light';
  const isDark = theme === 'system' ? resolvedSystemScheme === 'dark' : theme !== 'light';
  const variant: 'light' | 'dark' | 'groupify' =
    theme === 'system' ? (isDark ? 'dark' : 'light') : theme;

  // Sync with app store
  useEffect(() => {
    if (isDark !== isDarkMode) {
      setDarkMode(isDark);
    }
  }, [isDark]);

  // Push the haptics preference into the module-level gate.
  useEffect(() => {
    setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  // Save theme when changed
  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      variant,
      isDark,
      setTheme,
      fontSize,
      setFontSize,
      reduceMotion,
      setReduceMotion,
      hapticsEnabled,
      setHapticsEnabledPref: setHapticsEnabledStore,
    }),
    [theme, variant, isDark, fontSize, reduceMotion, hapticsEnabled]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
