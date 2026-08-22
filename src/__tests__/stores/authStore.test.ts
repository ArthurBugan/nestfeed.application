import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/client';
import storage from '@/services/storage';

jest.mock('@/api/client', () => ({
  removeAuthToken: jest.fn(),
  loadAuthToken: jest.fn(),
}));

jest.mock('@/services/storage', () => ({
  removeToken: jest.fn(),
  getToken: jest.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.isOAuthLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and isAuthenticated to true when user is provided', () => {
      const testUser = {
        id: '1',
        email: 'demo@demo.com',
        name: 'Test User',
      };

      useAuthStore.getState().setUser(testUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set user to null and isAuthenticated to false when user is null', () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'demo@demo.com',
        name: 'Test User',
      });

      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuthenticated', () => {
    it('should set isAuthenticated to true', () => {
      useAuthStore.getState().setAuthenticated(true);
      
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false', () => {
      useAuthStore.getState().setAuthenticated(false);
      
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setOAuthLoading', () => {
    it('should set isOAuthLoading to true', () => {
      useAuthStore.getState().setOAuthLoading(true);
      
      expect(useAuthStore.getState().isOAuthLoading).toBe(true);
    });

    it('should set isOAuthLoading to false', () => {
      useAuthStore.getState().setOAuthLoading(true);
      useAuthStore.getState().setOAuthLoading(false);
      
      expect(useAuthStore.getState().isOAuthLoading).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should set authenticated when token exists', async () => {
      (storage.getToken as jest.Mock).mockResolvedValueOnce('test-token');
      (apiClient.loadAuthToken as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(apiClient.loadAuthToken).toHaveBeenCalled();
    });

    it('should not set authenticated when no token exists', async () => {
      (storage.getToken as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle errors and clear auth', async () => {
      (storage.getToken as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', async () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'demo@demo.com',
        name: 'Test User',
      });
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setOAuthLoading(true);

      (apiClient.removeAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isOAuthLoading).toBe(false);
      expect(apiClient.removeAuthToken).toHaveBeenCalled();
      expect(storage.removeToken).toHaveBeenCalled();
    });
  });
});
