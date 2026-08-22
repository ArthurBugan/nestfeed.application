import apiClient from '@/api/client';
import { channelsApi } from '@/api/endpoints/channels';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Channels API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v2/channels', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await channelsApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/channels', undefined);
    });

    it('should call GET /api/v2/channels with params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await channelsApi.list({ page: 1, limit: 10, search: 'test' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/channels', {
        page: 1,
        limit: 10,
        search: 'test',
      });
    });
  });

  describe('get', () => {
    it('should call GET /api/v2/channels/:id', async () => {
      const mockChannel = { id: '1', name: 'Test Channel', url: 'https://example.com', groupId: 'g1' };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockChannel);

      const result = await channelsApi.get('channel-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/channels/channel-1');
      expect(result).toEqual(mockChannel);
    });
  });

  describe('getByGroup', () => {
    it('should call GET /api/v2/channels/group/:groupId', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await channelsApi.getByGroup('group-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/channels/group/group-1');
    });
  });

  describe('create', () => {
    it('should call POST /api/v2/channels', async () => {
      const mockChannel = { id: '1', name: 'New Channel', url: 'https://example.com', groupId: 'g1' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockChannel);

      const data = {
        name: 'New Channel',
        channelId: 'yt-123',
        url: 'https://youtube.com/channel/123',
        thumbnail: 'thumb.jpg',
        subscriberCount: 1000,
        videoCount: 50,
        groupId: 'group-1',
      };

      const result = await channelsApi.create(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/channels', data);
      expect(result).toEqual(mockChannel);
    });
  });

  describe('update', () => {
    it('should call PATCH /api/v2/channels/:id', async () => {
      const mockChannel = { id: '1', name: 'Updated', contentType: 'youtube' };
      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockChannel);

      const data = { id: '1', contentType: 'youtube', name: 'Updated' };
      const result = await channelsApi.update('channel-1', data);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v2/channels/channel-1', data);
      expect(result).toEqual(mockChannel);
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/v2/channels/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      await channelsApi.delete('channel-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v2/channels/channel-1');
    });
  });

  describe('batchUpdate', () => {
    it('should call PATCH /api/v3/channels/:groupId/batch', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce(undefined);

      const data = {
        channels: [
          { id: 'c1', name: 'Updated 1' },
          { id: 'c2', name: 'Updated 2' },
        ],
      };

      await channelsApi.batchUpdate('group-1', data);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v3/channels/group-1/batch', data);
    });
  });

  describe('fetchUrl', () => {
    it('should call POST /api/v3/proxy/fetch-url', async () => {
      const mockChannel = { id: '1', name: 'Fetched Channel', url: 'https://youtube.com/channel/123' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockChannel);

      const result = await channelsApi.fetchUrl('https://youtube.com/channel/123');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v3/proxy/fetch-url', {
        url: 'https://youtube.com/channel/123',
      });
      expect(result).toEqual(mockChannel);
    });
  });
});
