import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large';

interface AppState {
  isDarkMode: boolean;
  fontSize: FontSize;
  reduceMotion: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  setFontSize: (value: FontSize) => void;
  setReduceMotion: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      fontSize: 'medium',
      reduceMotion: false,

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReduceMotion: (value) => set({ reduceMotion: value }),
    }),
    {
      name: 'app-display-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      // Only display preferences are persisted; isDarkMode mirrors the
      // resolved theme and must not be restored across sessions.
      partialize: (state) => ({ fontSize: state.fontSize, reduceMotion: state.reduceMotion }),
    }
  )
);

export default useAppStore;
