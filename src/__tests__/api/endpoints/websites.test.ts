import apiClient from '@/api/client';
import { websitesApi } from '@/api/endpoints/websites';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Websites API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/websites', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await websitesApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/websites', undefined);
    });

    it('should call GET /api/v3/websites with params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await websitesApi.list({ page: 1, limit: 10, search: 'test' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/websites', {
        page: 1,
        limit: 10,
        search: 'test',
      });
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/v3/websites/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      await websitesApi.delete('website-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v3/websites/website-1');
    });
  });
});
