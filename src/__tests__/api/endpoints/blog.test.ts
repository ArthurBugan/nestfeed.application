import apiClient from '@/api/client';
import { blogApi } from '@/api/endpoints/blog';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('Blog API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/blog without params', async () => {
      const mockResponse = { data: [], total: 0 };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await blogApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/blog', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /api/v3/blog with params', async () => {
      const mockResponse = { data: [], total: 5 };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const params = { category: 'tech', featured: true, limit: 10, page: 1, search: 'test' };
      const result = await blogApi.list(params);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/blog', params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle optional params', async () => {
      const mockResponse = { data: [], total: 0 };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await blogApi.list({ status: 'published', limit: 5 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/blog', {
        status: 'published',
        limit: 5,
      });
    });
  });

  describe('getBySlug', () => {
    it('should call GET /api/v3/blog/:slug', async () => {
      const mockPost = {
        id: 1,
        slug: 'my-awesome-post',
        title: 'My Awesome Post',
        content: 'This is the content',
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = await blogApi.getBySlug('my-awesome-post');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/blog/my-awesome-post');
      expect(result).toEqual(mockPost);
    });

    it('should handle slug with special characters', async () => {
      const mockPost = { id: 1, slug: 'post-with-numbers-123', title: 'Test', content: 'Content' };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = await blogApi.getBySlug('post-with-numbers-123');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/blog/post-with-numbers-123');
      expect(result).toEqual(mockPost);
    });
  });
});
