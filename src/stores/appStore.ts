import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large';

interface AppState {
  isDarkMode: boolean;
  fontSize: FontSize;
  reduceMotion: boolean;
  /** Haptic feedback toggle — independent of reduce-motion (tactile vs motion). */
  hapticsEnabled: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  setFontSize: (value: FontSize) => void;
  setReduceMotion: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      fontSize: 'medium',
      reduceMotion: false,
      hapticsEnabled: true,

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setReduceMotion: (value) => set({ reduceMotion: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
    }),
    {
      name: 'app-display-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      // Only display preferences are persisted; isDarkMode mirrors the
      // resolved theme and must not be restored across sessions.
      partialize: (state) => ({
        fontSize: state.fontSize,
        reduceMotion: state.reduceMotion,
        hapticsEnabled: state.hapticsEnabled,
      }),
    }
  )
);

export default useAppStore;
