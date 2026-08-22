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

describe('Auth Store - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthenticated edge cases', () => {
    it('should handle setting authenticated to true multiple times', () => {
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setAuthenticated(true);

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should handle setting authenticated to false multiple times', () => {
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setAuthenticated(false);
      useAuthStore.getState().setAuthenticated(false);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setUser edge cases', () => {
    it('should set isAuthenticated to true when user is set', () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when user is null', () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle user with minimal fields', () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'test@test.com',
      });

      expect(useAuthStore.getState().user).toEqual({
        id: '1',
        email: 'test@test.com',
      });
    });
  });

  describe('checkAuth edge cases', () => {
    it('should handle token that fails to load', async () => {
      (storage.getToken as jest.Mock).mockResolvedValueOnce('invalid-token');
      (apiClient.loadAuthToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle rapid checkAuth calls', async () => {
      (storage.getToken as jest.Mock).mockResolvedValueOnce('token');
      (apiClient.loadAuthToken as jest.Mock).mockResolvedValueOnce('token');

      await Promise.all([
        useAuthStore.getState().checkAuth(),
        useAuthStore.getState().checkAuth(),
      ]);

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout edge cases', () => {
    it('should handle logout when already logged out', async () => {
      (apiClient.removeAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should reset all loading states on logout', async () => {
      useAuthStore.getState().setOAuthLoading(true);

      (apiClient.removeAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isOAuthLoading).toBe(false);
    });
  });

  describe('setOAuthLoading edge cases', () => {
    it('should handle rapid OAuth loading state changes', () => {
      useAuthStore.getState().setOAuthLoading(true);
      useAuthStore.getState().setOAuthLoading(false);
      useAuthStore.getState().setOAuthLoading(true);

      expect(useAuthStore.getState().isOAuthLoading).toBe(true);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent setUser and setAuthenticated', () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      });
      useAuthStore.getState().setAuthenticated(true);

      expect(useAuthStore.getState().user).toEqual({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should handle concurrent setUser(null) and setAuthenticated(true)', () => {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setAuthenticated(true);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
});
