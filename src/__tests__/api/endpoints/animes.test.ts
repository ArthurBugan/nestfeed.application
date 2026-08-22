import apiClient from '@/api/client';
import { animesApi } from '@/api/endpoints/animes';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('Animes API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/animes without params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await animesApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/animes', undefined);
    });

    it('should call GET /api/v3/animes with params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await animesApi.list({ page: 2, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/animes', {
        page: 2,
        limit: 10,
      });
    });
  });

  describe('get', () => {
    it('should call GET /api/v3/animes/:id', async () => {
      const mockAnime = { id: '1', name: 'Test Anime', thumbnail: 'thumb.jpg' };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockAnime);

      const result = await animesApi.get('anime-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/animes/anime-1');
      expect(result).toEqual(mockAnime);
    });
  });
});
