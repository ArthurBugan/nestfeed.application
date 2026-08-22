import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints';
import { useCurrentUser, useRegister, useForgotPassword } from '@/hooks/useAuth';

jest.mock('@/api/endpoints', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
  },
}));

jest.mock('@/api/client', () => ({
  isAuthenticated: jest.fn(() => true),
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

describe('useAuth Additional Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
      };
      (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(authApi.getCurrentUser).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockUser);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle API error', async () => {
      (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useRegister', () => {
    it('should register a new user', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        token: 'jwt-token',
        message: 'Registration successful',
      };
      (authApi.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      const mockLoadAuthToken = jest.fn().mockResolvedValueOnce('jwt-token');
      jest.mock('@/api/client', () => ({
        isAuthenticated: jest.fn(() => true),
        loadAuthToken: mockLoadAuthToken,
      }));

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'Test User',
          email: 'test@test.com',
          password: 'teste1234',
          encryptedPassword: 'encrypted-xyz',
        });
      });

      expect(authApi.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'teste1234',
        encryptedPassword: 'encrypted-xyz',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle registration failure', async () => {
      (authApi.register as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: 'Test User',
            email: 'test@test.com',
            password: 'teste1234',
            encryptedPassword: 'encrypted-xyz',
          });
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useForgotPassword', () => {
    it('should send forgot password request', async () => {
      const mockResponse = { message: 'Reset link sent', success: true };
      (authApi.forgotPassword as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: 'test@test.com',
          encrypted_password: 'encrypted-xyz',
        });
      });

      expect(authApi.forgotPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        encrypted_password: 'encrypted-xyz',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle forgot password failure', async () => {
      (authApi.forgotPassword as jest.Mock).mockRejectedValueOnce(new Error('User not found'));

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            email: 'nonexistent@test.com',
            encrypted_password: 'encrypted-xyz',
          });
        })
      ).rejects.toThrow('User not found');

      expect(result.current.isError).toBe(true);
    });
  });
});
