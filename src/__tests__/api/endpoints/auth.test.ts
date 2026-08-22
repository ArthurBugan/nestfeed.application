import * as SecureStore from 'expo-secure-store';
import apiClient from '@/api/client';
import { authApi } from '@/api/endpoints/auth';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /authorize with credentials', async () => {
      const mockResponse = { user: { id: '1', email: 'test@test.com', name: 'Test' }, token: 'jwt-token' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.login({ email: 'test@test.com', password: 'teste1234' });

      expect(apiClient.post).toHaveBeenCalledWith('/authorize', {
        email: 'test@test.com',
        password: 'teste1234',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('should call POST /registration with credentials', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com', name: 'Test' },
        token: 'jwt-token',
        message: 'Registration successful',
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'teste1234',
        encryptedPassword: 'encrypted-xyz',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/registration', {
        name: 'Test User',
        email: 'test@test.com',
        password: 'teste1234',
        encryptedPassword: 'encrypted-xyz',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should call POST /forget-password', async () => {
      const mockResponse = { message: 'Reset link sent', success: true };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.forgotPassword({
        email: 'test@test.com',
        encrypted_password: 'encrypted-xyz',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/forget-password', {
        email: 'test@test.com',
        encrypted_password: 'encrypted-xyz',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePassword', () => {
    it('should call POST /auth/update_password', async () => {
      const mockResponse = { success: true };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.updatePassword({
        password: 'newteste1234',
        passwordConfirmation: 'newteste1234',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/update_password', {
        password: 'newteste1234',
        passwordConfirmation: 'newteste1234',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAccount', () => {
    it('should call DELETE /account', async () => {
      const mockResponse = { success: true };
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.deleteAccount();

      expect(apiClient.delete).toHaveBeenCalledWith('/account');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call POST /logout', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(undefined);

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith<void>('/logout');
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /api/v3/me', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await authApi.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith<User>('/api/v3/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should call POST /api/v3/me with profile data', async () => {
      const mockResponse = { success: true, user: { id: '1', name: 'Updated Name' } };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authApi.updateProfile({ name: 'Updated Name' });

      expect(apiClient.post).toHaveBeenCalledWith('/api/v3/me', { name: 'Updated Name' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('appleMobileAuth', () => {
    it('should call POST /auth/apple/mobile', async () => {
      const mockToken = 'apple-jwt-token';
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockToken);

      const credentialData = {
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-auth-code',
        userEmail: 'test@test.com',
        fullName: { givenName: 'Test', familyName: 'User' },
      };

      const result = await authApi.appleMobileAuth(credentialData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/apple/mobile', credentialData);
      expect(result).toBe(mockToken);
    });
  });
});
