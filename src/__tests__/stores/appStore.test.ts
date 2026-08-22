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
});
