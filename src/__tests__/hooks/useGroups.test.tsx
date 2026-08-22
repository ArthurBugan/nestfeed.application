import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { groupsApi } from '@/api/endpoints/groups';
import { useGroups, useGroup, useCreateGroup, useUpdateGroup, useDeleteGroup, useSyncGroupVideos, useBulkUpdateGroupOrder, useGroupSubgroups } from '@/hooks/useGroups';

jest.mock('@/api/endpoints', () => ({
  groupsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    syncVideos: jest.fn(),
    bulkUpdateDisplayOrder: jest.fn(),
    getSubgroups: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGroups Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGroups', () => {
    it('should fetch groups list', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Group 1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', name: 'Group 2', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (groupsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGroups({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined });
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should include search param', async () => {
      const mockResponse = { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      (groupsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGroups({ search: 'test' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.list).toHaveBeenCalledWith({ page: undefined, limit: undefined, search: 'test' });
    });
  });

  describe('useGroup', () => {
    it('should fetch a single group', async () => {
      const mockGroup = { id: '1', name: 'Test Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (groupsApi.get as jest.Mock).mockResolvedValueOnce(mockGroup);

      const { result } = renderHook(() => useGroup('group-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.get).toHaveBeenCalledWith('group-1');
      expect(result.current.data).toEqual(mockGroup);
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useGroup(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.get).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateGroup', () => {
    it('should create a group', async () => {
      const mockGroup = { id: '1', name: 'New Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (groupsApi.create as jest.Mock).mockResolvedValueOnce(mockGroup);

      const { result } = renderHook(() => useCreateGroup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'New Group' });
      });

      expect(groupsApi.create).toHaveBeenCalledWith({ name: 'New Group' });
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useUpdateGroup', () => {
    it('should update a group', async () => {
      const mockGroup = { id: '1', name: 'Updated', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (groupsApi.update as jest.Mock).mockResolvedValueOnce(mockGroup);

      const { result } = renderHook(() => useUpdateGroup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'group-1', data: { name: 'Updated' } });
      });

      expect(groupsApi.update).toHaveBeenCalledWith('group-1', { name: 'Updated' });
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useDeleteGroup', () => {
    it('should delete a group', async () => {
      (groupsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteGroup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('group-1');
      });

      expect(groupsApi.delete).toHaveBeenCalledWith('group-1');
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useSyncGroupVideos', () => {
    it('should sync group videos', async () => {
      (groupsApi.syncVideos as jest.Mock).mockResolvedValueOnce({ synced: 42 });

      const { result } = renderHook(() => useSyncGroupVideos(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('group-1');
      });

      expect(groupsApi.syncVideos).toHaveBeenCalledWith('group-1');
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useBulkUpdateGroupOrder', () => {
    it('should update group display order in bulk', async () => {
      (groupsApi.bulkUpdateDisplayOrder as jest.Mock).mockResolvedValueOnce(undefined);

      const groups = [
        { id: 'g1', displayOrder: 1 },
        { id: 'g2', displayOrder: 2 },
      ];

      const { result } = renderHook(() => useBulkUpdateGroupOrder(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(groups);
      });

      expect(groupsApi.bulkUpdateDisplayOrder).toHaveBeenCalledWith(groups);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useGroupSubgroups', () => {
    it('should fetch subgroups for a group', async () => {
      const mockSubgroups = [
        { id: 'sub-1', name: 'Sub 1', parentId: 'parent-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      (groupsApi.getSubgroups as jest.Mock).mockResolvedValueOnce(mockSubgroups);

      const { result } = renderHook(() => useGroupSubgroups('parent-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.getSubgroups).toHaveBeenCalledWith('parent-1');
      expect(result.current.data).toEqual(mockSubgroups);
    });

    it('should not fetch when groupId is empty', async () => {
      const { result } = renderHook(() => useGroupSubgroups(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupsApi.getSubgroups).not.toHaveBeenCalled();
    });
  });
});
