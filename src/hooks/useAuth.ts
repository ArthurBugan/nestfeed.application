import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints';
import type { LoginCredentials, RegisterCredentials, ForgotPasswordRequest } from '@/types';
import apiClient from '@/api/client';
import storage from '@/services/storage';
import { useAuthStore } from '@/stores';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    enabled: !!apiClient.isAuthenticated(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (data) => {
      if (data?.token) {
        await apiClient.setAuthToken(data.token);
        await storage.setToken(data.token);
        setAuthenticated(true);
      } else {
        console.log('No token in response');
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: async (data) => {
      // Token is stored in cookie by the API client
      // Just reload the token from storage
      const storedToken = await apiClient.loadAuthToken();
      console.log('Register success, reloading token from storage', storedToken);
      if (storedToken) {
        setAuthenticated(true);
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: async () => {
      await logout();
      queryClient.clear();
    },
  });
};