import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useGoogleLogin,
  useDiscordLogin,
  useAppleLogin,
  useAppleMobileAuth,
  useHandleOAuthCallback,
  useOAuthLoading,
  useIsOAuthLoading,
  oauthCallbackUrl,
} from '@/hooks/useSocialLogin';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'dismissed' })),
}));

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationScope: {
    FULL_NAME: 'full_name',
    EMAIL: 'email',
  },
  signInAsync: jest.fn(),
}));

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      setOAuthLoading: jest.fn(),
    };
    return selector(store);
  }),
}));

jest.mock('@/api/client', () => ({
  setAuthToken: jest.fn(),
}));

jest.mock('@/services/storage', () => ({
  setToken: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/api/endpoints', () => ({
  authApi: {
    appleMobileAuth: jest.fn(),
  },
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

describe('useSocialLogin Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('oauthCallbackUrl', () => {
    it('should generate correct callback URL for google', () => {
      const url = oauthCallbackUrl('google');
      expect(url).toBe('nestfeed://oauth?provider=google');
    });

    it('should generate correct callback URL for discord', () => {
      const url = oauthCallbackUrl('discord');
      expect(url).toBe('nestfeed://oauth?provider=discord');
    });

    it('should generate correct callback URL for apple', () => {
      const url = oauthCallbackUrl('apple');
      expect(url).toBe('nestfeed://oauth?provider=apple');
    });
  });

  describe('useOAuthLoading', () => {
    it('should return the setOAuthLoading function', () => {
      const { result } = renderHook(() => useOAuthLoading(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current).toBe('function');
    });
  });

  describe('useIsOAuthLoading', () => {
    it('should return the isOAuthLoading state', () => {
      const { result } = renderHook(() => useIsOAuthLoading(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useGoogleLogin', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGoogleLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.signIn).toBe('function');
    });

    it('should call openBrowserAsync with correct URL', async () => {
      const { result } = renderHook(() => useGoogleLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(require('expo-web-browser').openBrowserAsync).toHaveBeenCalledWith(
        `${process.env.EXPO_PUBLIC_GROUPIFY_API_URL || ''}/auth/google?redirect_uri=${encodeURIComponent('nestfeed://oauth?provider=google')}`
      );
    });

    it('should set loading states during sign in', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (require('expo-web-browser').openBrowserAsync as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useGoogleLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.signIn();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        resolvePromise!({ type: 'dismissed' });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle sign in error', async () => {
      (require('expo-web-browser').openBrowserAsync as jest.Mock).mockRejectedValueOnce(new Error('Browser not available'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useGoogleLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(result.current.isLoading).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('useDiscordLogin', () => {
    it('should call openBrowserAsync with correct URL', async () => {
      const { result } = renderHook(() => useDiscordLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(require('expo-web-browser').openBrowserAsync).toHaveBeenCalledWith(
        `${process.env.EXPO_PUBLIC_GROUPIFY_API_URL || ''}/auth/discord?redirect_uri=${encodeURIComponent('nestfeed://oauth?provider=discord')}&origin=app`
      );
    });

    it('should set loading states during sign in', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (require('expo-web-browser').openBrowserAsync as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useDiscordLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.signIn();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        resolvePromise!({ type: 'dismissed' });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useAppleLogin', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppleLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should call apple signInAsync', async () => {
      const mockCredential = {
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-auth-code',
        userEmail: 'test@test.com',
        fullName: { givenName: 'Test', familyName: 'User' },
      };
      (require('expo-apple-authentication').signInAsync as jest.Mock).mockResolvedValueOnce(mockCredential);
      (require('@/api/endpoints').authApi.appleMobileAuth as jest.Mock).mockResolvedValueOnce('apple-jwt-token');
      (require('@/api/client').setAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (require('@/services/storage').setToken as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAppleLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(require('expo-apple-authentication').signInAsync).toHaveBeenCalledWith({
        requestedScopes: [
          require('expo-apple-authentication').AppleAuthenticationScope.FULL_NAME,
          require('expo-apple-authentication').AppleAuthenticationScope.EMAIL,
        ],
      });
    });
  });

  describe('useAppleMobileAuth', () => {
    it('should call appleMobileAuth API', async () => {
      const mockCredential = {
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-auth-code',
        userEmail: 'test@test.com',
        fullName: { givenName: 'Test', familyName: 'User' },
      };
      (require('@/api/endpoints').authApi.appleMobileAuth as jest.Mock).mockResolvedValueOnce('apple-jwt-token');
      (require('@/api/client').setAuthToken as jest.Mock).mockResolvedValueOnce(undefined);
      (require('@/services/storage').setToken as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAppleMobileAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(mockCredential);
      });

      expect(require('@/api/endpoints').authApi.appleMobileAuth).toHaveBeenCalledWith(mockCredential);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle apple auth failure', async () => {
      (require('@/api/endpoints').authApi.appleMobileAuth as jest.Mock).mockRejectedValueOnce(new Error('Auth failed'));

      const { result } = renderHook(() => useAppleMobileAuth(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ identityToken: 'token' });
        })
      ).rejects.toThrow('Auth failed');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useHandleOAuthCallback', () => {
    it('should handle successful callback with token', async () => {
      const { result } = renderHook(() => useHandleOAuthCallback(), {
        wrapper: createWrapper(),
      });

      const response = await act(async () => {
        return result.current.handleCallback('jwt-token-123');
      });

      expect(response).toEqual({ success: true });
    });

    it('should handle callback with no token', async () => {
      const { result } = renderHook(() => useHandleOAuthCallback(), {
        wrapper: createWrapper(),
      });

      const response = await act(async () => {
        return result.current.handleCallback('');
      });

      expect(response).toEqual({ success: false, error: 'No token received' });
    });

    it('should handle callback error', async () => {
      const { result } = renderHook(() => useHandleOAuthCallback(), {
        wrapper: createWrapper(),
      });

      const response = await act(async () => {
        return result.current.handleCallback('invalid-token');
      });

      expect(response.success).toBe(false);
    });
  });
});
