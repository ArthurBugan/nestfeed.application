import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { groupShelfApi } from '@/api/endpoints/groupShelf';
import { useGroupShelf, useGroupShelves, useUpdateGroupShelf, useCopyShelf } from '@/hooks/useGroupShelf';

jest.mock('@/api/endpoints/groupShelf', () => ({
  groupShelfApi: {
    get: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    copy: jest.fn(),
  },
}));

jest.mock('sonner-native', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
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

describe('useGroupShelf Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGroupShelf', () => {
    it('should fetch group shelf data', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Shelf 1', userId: 'user-1' },
          { id: '2', name: 'Shelf 2', userId: 'user-1' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (groupShelfApi.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGroupShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupShelfApi.get).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle API error', async () => {
      (groupShelfApi.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGroupShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useGroupShelves', () => {
    it('should fetch group shelves list', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Shelf 1', userId: 'user-1' },
          { id: '2', name: 'Shelf 2', userId: 'user-1' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (groupShelfApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGroupShelves({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupShelfApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should include search param', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test Shelf', userId: 'user-1' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (groupShelfApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGroupShelves({ search: 'test' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(groupShelfApi.list).toHaveBeenCalledWith({ search: 'test' });
    });

    it('should handle API error', async () => {
      (groupShelfApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGroupShelves(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useUpdateGroupShelf', () => {
    it('should update a group shelf', async () => {
      const mockShelf = { id: '1', name: 'Updated Shelf', userId: 'user-1' };
      (groupShelfApi.update as jest.Mock).mockResolvedValueOnce(mockShelf);

      const { result } = renderHook(() => useUpdateGroupShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'shelf-1', name: 'Updated Shelf' });
      });

      expect(groupShelfApi.update).toHaveBeenCalledWith({ id: 'shelf-1', name: 'Updated Shelf' });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle update failure', async () => {
      (groupShelfApi.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateGroupShelf(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'shelf-1', name: 'Updated' });
        })
      ).rejects.toThrow('Update failed');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useCopyShelf', () => {
    it('should copy a group shelf', async () => {
      (groupShelfApi.copy as jest.Mock).mockResolvedValueOnce({ id: 'new-shelf-1', name: 'Copied Shelf', userId: 'user-1' });

      const { result } = renderHook(() => useCopyShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('shelf-1');
      });

      expect(groupShelfApi.copy).toHaveBeenCalledWith('shelf-1');
      expect(result.current.isSuccess).toBe(true);
    });

    it('should show success toast on copy', async () => {
      (groupShelfApi.copy as jest.Mock).mockResolvedValueOnce({ id: 'new-shelf-1', name: 'Copied', userId: 'user-1' });

      const { result } = renderHook(() => useCopyShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('shelf-1');
      });

      expect(require('sonner-native').toast.success).toHaveBeenCalledWith('Group shelf copied', {
        description: 'The group shelf has been copied successfully.',
      });
    });

    it('should show error toast on copy failure', async () => {
      (groupShelfApi.copy as jest.Mock).mockRejectedValueOnce(new Error('Copy failed'));

      const { result } = renderHook(() => useCopyShelf(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('shelf-1');
      });

      expect(result.current.isError).toBe(true);
      expect(require('sonner-native').toast.error).toHaveBeenCalledWith('Failed to copy group shelf', {
        description: 'Copy failed',
      });
    });
  });
});
