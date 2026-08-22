import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { groupsApi } from '@/api/endpoints/groups';
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';

jest.mock('@/api/endpoints', () => ({
  groupsApi: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

describe('Integration Tests - Group CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Group Flow', () => {
    it('should create a group and invalidate queries', async () => {
      const mockGroup = { id: '1', name: 'New Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (groupsApi.create as jest.Mock).mockResolvedValueOnce(mockGroup);

      const { result } = renderHook(() => useCreateGroup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'New Group',
          description: 'A new group',
          icon: 'folder',
          category: 'entertainment',
        });
      });

      expect(groupsApi.create).toHaveBeenCalledWith({
        name: 'New Group',
        description: 'A new group',
        icon: 'folder',
        category: 'entertainment',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle create failure', async () => {
      (groupsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Failed to create group'));

      const { result } = renderHook(() => useCreateGroup(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ name: 'New Group' });
        })
      ).rejects.toThrow('Failed to create group');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Update Group Flow', () => {
    it('should update a group and invalidate queries', async () => {
      const mockGroup = { id: '1', name: 'Updated Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      (groupsApi.update as jest.Mock).mockResolvedValueOnce(mockGroup);

      const { result } = renderHook(() => useUpdateGroup(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'group-1',
          data: { name: 'Updated Group', description: 'Updated description' },
        });
      });

      expect(groupsApi.update).toHaveBeenCalledWith('group-1', {
        name: 'Updated Group',
        description: 'Updated description',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle update failure', async () => {
      (groupsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Failed to update group'));

      const { result } = renderHook(() => useUpdateGroup(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'group-1', data: { name: 'Updated' } });
        })
      ).rejects.toThrow('Failed to update group');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Delete Group Flow', () => {
    it('should delete a group and invalidate queries', async () => {
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

    it('should handle delete failure', async () => {
      (groupsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete group'));

      const { result } = renderHook(() => useDeleteGroup(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('group-1');
        })
      ).rejects.toThrow('Failed to delete group');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Full Group Lifecycle', () => {
    it('should create, update, and delete a group', async () => {
      const mockCreatedGroup = { id: '1', name: 'New Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      const mockUpdatedGroup = { id: '1', name: 'Updated Group', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      
      (groupsApi.create as jest.Mock).mockResolvedValueOnce(mockCreatedGroup);
      (groupsApi.update as jest.Mock).mockResolvedValueOnce(mockUpdatedGroup);
      (groupsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      // Create
      const createHook = renderHook(() => useCreateGroup(), { wrapper: createWrapper() });
      await act(async () => {
        await createHook.result.current.mutateAsync({ name: 'New Group' });
      });
      expect(createHook.result.current.isSuccess).toBe(true);

      // Update
      const updateHook = renderHook(() => useUpdateGroup(), { wrapper: createWrapper() });
      await act(async () => {
        await updateHook.result.current.mutateAsync({ id: '1', data: { name: 'Updated Group' } });
      });
      expect(updateHook.result.current.isSuccess).toBe(true);

      // Delete
      const deleteHook = renderHook(() => useDeleteGroup(), { wrapper: createWrapper() });
      await act(async () => {
        await deleteHook.result.current.mutateAsync('1');
      });
      expect(deleteHook.result.current.isSuccess).toBe(true);
    });
  });
});
