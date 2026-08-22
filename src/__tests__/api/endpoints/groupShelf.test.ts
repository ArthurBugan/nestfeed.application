import apiClient from '@/api/client';
import { groupShelfApi } from '@/api/endpoints/groupShelf';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('GroupShelf API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/groups/shelf without params', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await groupShelfApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/groups/shelf', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /api/v3/groups/shelf with params', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await groupShelfApi.list({ page: 2, limit: 10, search: 'test' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/groups/shelf', {
        page: 2,
        limit: 10,
        search: 'test',
      });
    });
  });

  describe('copy', () => {
    it('should call POST /api/v3/groups/shelf/copy/:id', async () => {
      const mockGroup = { id: '1', name: 'Copied Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockGroup);

      const result = await groupShelfApi.copy('shelf-1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v3/groups/shelf/copy/shelf-1', {});
      expect(result).toEqual(mockGroup);
    });

    it('should handle copy failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Copy failed'));

      await expect(groupShelfApi.copy('shelf-1')).rejects.toThrow('Copy failed');
    });
  });
});
