import apiClient from '@/api/client';
import { shareLinksApi } from '@/api/endpoints/shareLinks';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ShareLinks API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/share-links', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await shareLinksApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/share-links');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call POST /api/v3/share-links', async () => {
      const mockShareLink = { id: '1', type: 'group', shareUrl: 'https://share.link/abc123' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockShareLink);

      const data = { id: 'group-1', linkType: 'group', permission: 'view' };
      const result = await shareLinksApi.create(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v3/share-links', data);
      expect(result).toEqual(mockShareLink);
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/v3/share-links/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      await shareLinksApi.delete('sharelink-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v3/share-links/sharelink-1');
    });
  });

  describe('generate', () => {
    it('should call POST /api/v2/share-link', async () => {
      const mockResponse = { shareLink: 'https://share.link/xyz789' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const data = { id: 'group-1', linkType: 'group', permission: 'view' };
      const result = await shareLinksApi.generate(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/share-link', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should call GET /api/v2/share-link/:id', async () => {
      const mockShareLink = { id: '1', type: 'group', linkCode: 'abc123' };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockShareLink);

      const result = await shareLinksApi.getById('sharelink-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/share-link/sharelink-1');
      expect(result).toEqual(mockShareLink);
    });
  });

  describe('consume', () => {
    it('should call POST /api/v2/share-link/:linkType/:linkCode', async () => {
      const mockResponse = {
        groupId: 'group-1',
        groupName: 'Test Group',
        channelCount: 5,
        channels: [],
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await shareLinksApi.consume('group', 'abc123');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/share-link/group/abc123');
      expect(result).toEqual(mockResponse);
    });
  });
});
