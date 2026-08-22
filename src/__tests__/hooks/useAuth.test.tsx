import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '@/hooks/useAuth';
import apiClient from '@/api/client';
import storage from '@/services/storage';
import { useAuthStore } from '@/stores';

jest.mock('@/api/endpoints', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

jest.mock('@/api/client', () => ({
  setAuthToken: jest.fn(),
  loadAuthToken: jest.fn(),
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

describe('useAuth Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useLogin', () => {
    it('should call login API and save token on success', async () => {
      const { authApi } = await import('@/api/endpoints');
      (authApi.login as jest.Mock).mockResolvedValueOnce('jwt-token-123');
      (apiClient.setAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.setToken as jest.Mock).mockResolvedValueOnce(undefined);
      const mockSetAuthenticated = jest.fn();
      (useAuthStore as jest.Mock).mockImplementation((selector) => {
        return selector({ setAuthenticated: mockSetAuthenticated });
      });

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync({ email: 'test@test.com', password: 'password' });
      });

      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(apiClient.setAuthToken).toHaveBeenCalledWith('jwt-token-123');
      expect(storage.setToken).toHaveBeenCalledWith('jwt-token-123');
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    });

    it('should handle login failure', async () => {
      const { authApi } = await import('@/api/endpoints');
      (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ email: 'test@test.com', password: 'wrong' });
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should have correct loading state', () => {
      const { authApi } = require('@/api/endpoints');
      (authApi.login as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutateAsync({ email: 'test@test.com', password: 'password' });
      });

      expect(result.current.isPending).toBe(true);
    });
  });
});
