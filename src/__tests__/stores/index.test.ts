import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

describe('Stores Index', () => {
  it('should export useAppStore', () => {
    expect(useAppStore).toBeDefined();
  });

  it('should export useAuthStore', () => {
    expect(useAuthStore).toBeDefined();
  });

  it('should have correct initial state for appStore', () => {
    const state = useAppStore.getState();
    expect(state.isDarkMode).toBe(false);
    expect(typeof state.toggleDarkMode).toBe('function');
    expect(typeof state.setDarkMode).toBe('function');
  });

  it('should have correct initial state for authStore', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
    expect(state.isOAuthLoading).toBe(false);
    expect(typeof state.checkAuth).toBe('function');
    expect(typeof state.setUser).toBe('function');
    expect(typeof state.setAuthenticated).toBe('function');
    expect(typeof state.setOAuthLoading).toBe('function');
    expect(typeof state.logout).toBe('function');
  });
});
