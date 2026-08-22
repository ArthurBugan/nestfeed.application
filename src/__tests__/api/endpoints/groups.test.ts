import apiClient from '@/api/client';
import { groupsApi } from '@/api/endpoints/groups';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Groups API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call GET /api/v3/groups without params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await groupsApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/groups', undefined);
    });

    it('should call GET /api/v3/groups with params', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await groupsApi.list({ page: 2, limit: 10, search: 'test' });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/groups', {
        page: 2,
        limit: 10,
        search: 'test',
      });
    });
  });

  describe('get', () => {
    it('should call GET /api/v2/groups/:id', async () => {
      const mockGroup = { id: '1', name: 'Test Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockGroup });

      const result = await groupsApi.get('group-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/groups/group-1');
      expect(result).toEqual(mockGroup);
    });
  });

  describe('create', () => {
    it('should call POST /api/v2/groups', async () => {
      const mockGroup = { id: '1', name: 'New Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockGroup);

      const data = { name: 'New Group', description: 'A test group', icon: 'folder' };
      const result = await groupsApi.create(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/groups', data);
      expect(result).toEqual(mockGroup);
    });

    it('should create group with optional fields', async () => {
      const mockGroup = { id: '1', name: 'Nested', parentId: 'parent-1', enableGroupshelf: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockGroup);

      const data = { name: 'Nested', parentId: 'parent-1', enableGroupshelf: true };
      await groupsApi.create(data);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/groups', data);
    });
  });

  describe('update', () => {
    it('should call PUT /api/v2/groups/:id', async () => {
      const mockGroup = { id: '1', name: 'Updated Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockGroup);

      const data = { name: 'Updated Group', description: 'Updated description' };
      const result = await groupsApi.update('group-1', data);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v2/groups/group-1', data);
      expect(result).toEqual(mockGroup);
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/v2/groups/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      await groupsApi.delete('group-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v2/groups/group-1');
    });
  });

  describe('updateDisplayOrder', () => {
    it('should call PUT /api/v2/groups/:id/display-order', async () => {
      const mockGroup = { id: '1', displayOrder: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockGroup);

      const result = await groupsApi.updateDisplayOrder('group-1', 5);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v2/groups/group-1/display-order', { displayOrder: 5 });
      expect(result).toEqual(mockGroup);
    });
  });

  describe('bulkUpdateDisplayOrder', () => {
    it('should call PUT /api/v2/groups/display-order/bulk', async () => {
      (apiClient.put as jest.Mock).mockResolvedValueOnce(undefined);

      const groups = [
        { id: 'group-1', displayOrder: 1 },
        { id: 'group-2', displayOrder: 2 },
        { id: 'group-3', displayOrder: 3 },
      ];

      await groupsApi.bulkUpdateDisplayOrder(groups);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v2/groups/display-order/bulk', { groups });
    });
  });

  describe('syncVideos', () => {
    it('should call POST /api/v3/groups/:id/videos/sync', async () => {
      const mockResponse = { synced: 42 };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await groupsApi.syncVideos('group-1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v3/groups/group-1/videos/sync');
      expect(result).toEqual({ synced: 42 });
    });
  });

  describe('getSubgroups', () => {
    it('should call GET /api/v3/groups/subgroups/:groupId', async () => {
      const mockSubgroups = [
        { id: 'sub-1', name: 'Sub Group 1', parentId: 'parent-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'sub-2', name: 'Sub Group 2', parentId: 'parent-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockSubgroups);

      const result = await groupsApi.getSubgroups('parent-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v3/groups/subgroups/parent-1');
      expect(result).toEqual(mockSubgroups);
    });
  });
});
