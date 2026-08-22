import { useAppStore } from '@/stores/appStore';

describe('App Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState();
      
      expect(state.isDarkMode).toBe(false);
    });
  });

  describe('setDarkMode', () => {
    it('should set dark mode to true', () => {
      useAppStore.getState().setDarkMode(true);
      
      expect(useAppStore.getState().isDarkMode).toBe(true);
    });

    it('should set dark mode to false', () => {
      useAppStore.getState().setDarkMode(true);
      useAppStore.getState().setDarkMode(false);
      
      expect(useAppStore.getState().isDarkMode).toBe(false);
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle from false to true', () => {
      useAppStore.getState().toggleDarkMode();
      
      expect(useAppStore.getState().isDarkMode).toBe(true);
    });

    it('should toggle from true to false', () => {
      useAppStore.getState().setDarkMode(true);
      useAppStore.getState().toggleDarkMode();
      
      expect(useAppStore.getState().isDarkMode).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      useAppStore.getState().toggleDarkMode();
      useAppStore.getState().toggleDarkMode();
      useAppStore.getState().toggleDarkMode();

      expect(useAppStore.getState().isDarkMode).toBe(true);
    });
  });

  describe('display preferences (Track F, spec #001)', () => {
    it('defaults font size to medium and reduce motion to off', () => {
      const state = useAppStore.getState();

      expect(state.fontSize).toBe('medium');
      expect(state.reduceMotion).toBe(false);
    });

    it('persists font size changes', () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      useAppStore.getState().setFontSize('large');

      expect(useAppStore.getState().fontSize).toBe('large');
      // Persist middleware writes the partialized slice on change.
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'app-display-prefs',
        expect.stringContaining('"fontSize":"large"')
      );
    });

    it('persists reduce motion changes', () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      useAppStore.getState().setReduceMotion(true);

      expect(useAppStore.getState().reduceMotion).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'app-display-prefs',
        expect.stringContaining('"reduceMotion":true')
      );
    });

    it('does not persist isDarkMode (mirrors resolved theme)', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      (AsyncStorage.setItem as jest.Mock).mockClear();

      useAppStore.getState().setDarkMode(true);

      await Promise.resolve();
      const saved = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (c) => c[0] === 'app-display-prefs'
      );
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved![1])).not.toHaveProperty('isDarkMode');
    });
  });
});
