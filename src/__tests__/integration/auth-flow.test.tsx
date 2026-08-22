import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/api/client';
import storage from '@/services/storage';
import { useAuthStore } from '@/stores';
import { authApi } from '@/api/endpoints';

jest.mock('@/api/endpoints', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@/api/client', () => ({
  setAuthToken: jest.fn(),
  loadAuthToken: jest.fn(),
  isAuthenticated: jest.fn(() => false),
}));

jest.mock('@/services/storage', () => ({
  setToken: jest.fn(),
  getToken: jest.fn(),
  removeToken: jest.fn(),
}));

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      setUser: jest.fn(),
      setAuthenticated: jest.fn(),
    };
    return selector(store);
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Integration Tests - Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Login Flow', () => {
    it('should complete full login flow: login -> save token -> set auth', async () => {
      const { useLogin } = await import('@/hooks/useAuth');
      
      const mockToken = 'jwt-token-123';
      (authApi.login as jest.Mock).mockResolvedValueOnce(mockToken);
      (apiClient.setAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.setToken as jest.Mock).mockResolvedValueOnce(undefined);

      const mockSetAuthenticated = jest.fn();
      const mockSetUser = jest.fn();
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        return selector({
          setAuthenticated: mockSetAuthenticated,
          setUser: mockSetUser,
        });
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: 'demo@demo.com',
          password: 'teste1234',
        });
      });

      // Verify the entire flow
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'demo@demo.com',
        password: 'teste1234',
      });
      expect(apiClient.setAuthToken).toHaveBeenCalledWith(mockToken);
      expect(storage.setToken).toHaveBeenCalledWith(mockToken);
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle login failure and not save token', async () => {
      const { useLogin } = await import('@/hooks/useAuth');
      
      (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            email: 'demo@demo.com',
            password: 'wrong-password',
          });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(apiClient.setAuthToken).not.toHaveBeenCalled();
      expect(storage.setToken).not.toHaveBeenCalled();
      expect(result.current.isError).toBe(true);
    });
  });

  describe('Complete Register Flow', () => {
    it('should complete full register flow: register -> load token -> set auth', async () => {
      const { useRegister } = await import('@/hooks/useAuth');
      
      (authApi.register as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', email: 'demo@demo.com', name: 'Test User' },
        token: 'jwt-token',
        message: 'Registration successful',
      });
      (apiClient.loadAuthToken as jest.Mock).mockResolvedValueOnce('jwt-token');

      const mockSetAuthenticated = jest.fn();
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        return selector({
          setAuthenticated: mockSetAuthenticated,
          setUser: jest.fn(),
        });
      });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'Test User',
          email: 'demo@demo.com',
          password: 'teste1234',
          encryptedPassword: 'encrypted-xyz',
        });
      });

      expect(authApi.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'demo@demo.com',
        password: 'teste1234',
        encryptedPassword: 'encrypted-xyz',
      });
      expect(apiClient.loadAuthToken).toHaveBeenCalled();
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Store Integration', () => {
    it('should handle checkAuth -> load token flow', async () => {
      (storage.getToken as jest.Mock).mockResolvedValueOnce('saved-token');
      (apiClient.loadAuthToken as jest.Mock).mockResolvedValueOnce('saved-token');

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      expect(storage.getToken).toHaveBeenCalled();
      expect(apiClient.loadAuthToken).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle logout flow: remove token -> clear store', async () => {
      (apiClient.removeAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(apiClient.removeAuthToken).toHaveBeenCalled();
      expect(storage.removeToken).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isOAuthLoading).toBe(false);
    });
  });
});
