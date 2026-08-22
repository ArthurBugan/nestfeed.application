import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { toast } from 'burnt';
import storage from '@/services/storage';
import type { ApiError } from '../types';
import { router } from 'expo-router';

const TOKEN_KEY = 'auth_token';
const CORRELATION_ID_KEY = 'correlation_id';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private correlationId: string | null = null;

  constructor(baseURL: string = process.env.EXPO_PUBLIC_GROUPIFY_API_URL || 'http://192.168.68.55:3010/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      // Add auth token if available
      if (this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      if (this.correlationId) {
        config.headers['x-correlation-id'] = this.correlationId;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear all auth data
          await this.removeAuthToken();
          await storage.removeToken();
          router.replace('/login');
          toast({
            title: 'Session expired',
            message: 'Please log in again',
            preset: 'error',
          });
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
      const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.client.post<{ data?: T }>(endpoint, data);
    const payload = response.data as { data?: T; success?: boolean; message?: string };
    
    // Extract auth-token from cookies if present
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      for (const cookie of cookieArray) {
        if (cookie && cookie.includes('auth-token=')) {
          const tokenMatch = cookie.match(/auth-token=([^;]+)/);
          if (tokenMatch && tokenMatch[1]) {
            this.authToken = tokenMatch[1];
            // Save to SecureStore for persistence
            try {
              await SecureStore.setItemAsync(TOKEN_KEY, tokenMatch[1]);
              console.log('Token extracted from cookie and saved');
            } catch (error) {
              console.error('Failed to save token from cookie:', error);
            }
          }
        }
      }
    }
    
    return payload.data as T;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.client.put<{ data?: T }>(endpoint, data);
    const payload = response.data as { data?: T; success?: boolean; message?: string };
    return payload.data as T;
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<{ data?: T }>(endpoint, data);
    const payload = response.data as { data?: T; success?: boolean; message?: string };
    return payload.data as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<{ data?: T }>(endpoint);
    const payload = response.data as { data?: T; success?: boolean; message?: string };
    return payload.data as T;
  }

  async setAuthToken(token: string): Promise<void> {
    this.authToken = token;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save authToken:', error);
    }
  }

  async removeAuthToken(): Promise<void> {
    this.authToken = null;
    this.correlationId = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove authToken:', error);
    }
  }

  async loadAuthToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        this.authToken = token;
      }
      return token;
    } catch (error) {
      console.error('Failed to load authToken:', error);
      return null;
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  setBaseURL(url: string): void {
    this.client.defaults.baseURL = url;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  private parseError(error: AxiosError): ApiError {
    const responseData = error.response?.data as Record<string, unknown>;
    return {
      message: (responseData?.message as string) || error.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: responseData?.errors as Record<string, string[]> | undefined,
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;