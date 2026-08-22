import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../stores';

const THEME_KEY = 'theme_mode';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = Appearance.getColorScheme();
  const { isDarkMode, setDarkMode } = useAppStore();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  // Load saved theme on mount (non-blocking)
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeState(saved);
      }
    }).catch((error) => {
      console.error('Failed to load theme:', error);
    });
  }, []);

  // Subscribe to system theme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener((pref) => {
    });
    return () => sub.remove();
  }, []);

  // Determine if dark mode is active
  const resolvedSystemScheme = systemColorScheme ?? 'light';
  const isDark = theme === 'system' 
    ? resolvedSystemScheme === 'dark'
    : theme === 'dark';


  // Sync with app store
  useEffect(() => {
    if (isDark !== isDarkMode) {
      setDarkMode(isDark);
    }
  }, [isDark]);

  // Save theme when changed
  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;