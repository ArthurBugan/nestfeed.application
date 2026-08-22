import '@/__tests__/__mocks__';
import * as SecureStore from 'expo-secure-store';
import { storage } from '@/services/storage';

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setToken', () => {
    it('should save token to SecureStore', async () => {
      await storage.setToken('test-token-123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'test-token-123');
    });

    it('should handle errors gracefully', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await storage.setToken('test-token');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save token:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getToken', () => {
    it('should return token from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-token-123');
      
      const result = await storage.getToken();
      
      expect(result).toBe('test-token-123');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await storage.getToken();
      
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await storage.getToken();
      
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('removeToken', () => {
    it('should delete token from SecureStore', async () => {
      await storage.removeToken();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('setObject', () => {
    it('should serialize and save object to SecureStore', async () => {
      const testObj = { key: 'value', nested: { foo: 'bar' } };
      
      await storage.setObject('user_preferences', testObj);
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify(testObj)
      );
    });
  });

  describe('getObject', () => {
    it('should deserialize and return object from SecureStore', async () => {
      const testObj = { key: 'value', count: 42 };
      const json = JSON.stringify(testObj);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(json);
      
      const result = await storage.getObject<{ key: string; count: number }>('user_preferences');
      
      expect(result).toEqual(testObj);
    });

    it('should return null when key does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await storage.getObject<any>('nonexistent_key');
      
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete arbitrary key from SecureStore', async () => {
      await storage.remove('custom_key');
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('custom_key');
    });
  });
});
