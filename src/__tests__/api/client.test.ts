import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('burnt', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/services/storage', () => ({
  removeToken: jest.fn(),
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should set and save auth token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

      await apiClient.setAuthToken('new-token-123');

      expect(apiClient.getAuthToken()).toBe('new-token-123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'new-token-123');
    });

    it('should handle SecureStore errors gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await apiClient.setAuthToken('new-token-123');

      expect(apiClient.getAuthToken()).toBe('new-token-123');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save authToken:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('removeAuthToken', () => {
    it('should clear auth token and correlation id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      await apiClient.setAuthToken('test-token');

      await apiClient.removeAuthToken();

      expect(apiClient.getAuthToken()).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('loadAuthToken', () => {
    it('should load and set token from SecureStore', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('saved-token');

      const result = await apiClient.loadAuthToken();

      expect(result).toBe('saved-token');
      expect(apiClient.getAuthToken()).toBe('saved-token');
    });

    it('should return null when no token exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await apiClient.loadAuthToken();

      expect(result).toBeNull();
    });

    it('should handle SecureStore errors gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await apiClient.loadAuthToken();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      apiClient['authToken'] = 'test-token';
      expect(apiClient.isAuthenticated()).toBe(true);
    });
  });

  describe('setBaseURL', () => {
    it('should update the axios base URL', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: apiClient } = require('@/api/client');
      apiClient.setBaseURL('http://new.com');
      expect(apiClient['client'].defaults.baseURL).toBe('http://new.com');
    });
  });
});
