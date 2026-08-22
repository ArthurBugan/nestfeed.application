import { useCallback, useState } from 'react';
import { useAuthStore } from '@/stores';
import apiClient from '@/api/client';
import storage from '@/services/storage';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints';
import { router } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_GROUPIFY_API_URL || '';
const APP_SCHEME = 'nestfeed';

export const oauthCallbackUrl = (provider: string) =>
  `${APP_SCHEME}://oauth?provider=${provider}`;

export const useOAuthLoading = () => useAuthStore((s) => s.setOAuthLoading);
export const useIsOAuthLoading = () => useAuthStore((s) => s.isOAuthLoading);

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const setOAuthLoading = useAuthStore((s) => s.setOAuthLoading);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setOAuthLoading(true);
    try {
      const redirectUrl = oauthCallbackUrl('google');
      const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUrl)}`;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      setOAuthLoading(false);
    }
  }, []);

  return { signIn, isLoading };
}

export function useDiscordLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const setOAuthLoading = useAuthStore((s) => s.setOAuthLoading);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setOAuthLoading(true);
    try {
      const redirectUrl = oauthCallbackUrl('discord');
      const authUrl = `${API_URL}/auth/discord?redirect_uri=${encodeURIComponent(redirectUrl)}&origin=app`;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error) {
      console.error('Discord login error:', error);
      setIsLoading(false);
      setOAuthLoading(false);
    }
  }, []);

  return { signIn, isLoading };
}

export function useAppleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const setOAuthLoading = useAuthStore((s) => s.setOAuthLoading);
  const appleMobileAuth = useAppleMobileAuth();

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setOAuthLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      await appleMobileAuth.mutateAsync(credential);
      setIsLoading(false);
      setOAuthLoading(false);
    } catch (e: unknown) {
      console.error('Apple login error:', e); 
      setIsLoading(false);
      setOAuthLoading(false);
    }
  }, [appleMobileAuth]);

  return { signIn, isLoading };
}

export const useAppleMobileAuth = () => {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (data: any) => authApi.appleMobileAuth(data),
    onSuccess: async (token) => {
      if (token) {
        await apiClient.setAuthToken(token);
        await storage.setToken(token);
        setAuthenticated(true);
        router.replace('/(app)');
      }
    },
  });
};

export function useHandleOAuthCallback() {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setOAuthLoading = useAuthStore((s) => s.setOAuthLoading);

  const handleCallback = useCallback(async (url: string) => {
    try {
      // Extract token from URL (e.g., nestfeed://oauth?provider=google&token=xxx)
      let token: string | null = null;

      // Try to parse token from URL query parameters
      if (url.includes('token=')) {
        const urlObj = new URL(url);
        token = urlObj.searchParams.get('token');
      }

      if (token) {
        await storage.setToken(token);
        await apiClient.setAuthToken(token);
        setAuthenticated(true);
        setOAuthLoading(false);
        return { success: true };
      }
      setOAuthLoading(false);
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('handleCallback error:', error);
      setOAuthLoading(false);
      return { success: false, error: 'Failed to parse callback' };
    }
  }, [setAuthenticated, setUser, setOAuthLoading]);

  return { handleCallback };
}