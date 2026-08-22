import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { shareLinksApi } from '@/api/endpoints/shareLinks';
import { useShareLinks, useCreateShareLink, useDeleteShareLink } from '@/hooks/useShareLinks';

jest.mock('@/api/endpoints/shareLinks', () => ({
  shareLinksApi: {
    list: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
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

describe('useShareLinks Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useShareLinks', () => {
    it('should fetch share links list', async () => {
      const mockResponse = {
        data: [
          { id: '1', type: 'group', shareUrl: 'https://share.link/abc123' },
          { id: '2', type: 'channel', shareUrl: 'https://share.link/def456' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (shareLinksApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useShareLinks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(shareLinksApi.list).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (shareLinksApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useShareLinks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(shareLinksApi.list).toHaveBeenCalled();
      expect((result.current.data as any)?.data).toEqual([]);
    });

    it('should handle API error', async () => {
      (shareLinksApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useShareLinks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useCreateShareLink', () => {
    it('should create a share link', async () => {
      const mockShareLink = { id: '1', type: 'group', shareUrl: 'https://share.link/abc123' };
      (shareLinksApi.create as jest.Mock).mockResolvedValueOnce(mockShareLink);

      const { result } = renderHook(() => useCreateShareLink(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'group-1',
          linkType: 'group',
          permission: 'view',
        });
      });

      expect(shareLinksApi.create).toHaveBeenCalledWith({
        id: 'group-1',
        linkType: 'group',
        permission: 'view',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle creation failure', async () => {
      (shareLinksApi.create as jest.Mock).mockRejectedValueOnce(new Error('Creation failed'));

      const { result } = renderHook(() => useCreateShareLink(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: 'group-1',
            linkType: 'group',
            permission: 'view',
          });
        })
      ).rejects.toThrow('Creation failed');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useDeleteShareLink', () => {
    it('should delete a share link', async () => {
      (shareLinksApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteShareLink(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('sharelink-1');
      });

      expect(shareLinksApi.delete).toHaveBeenCalledWith('sharelink-1');
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle deletion failure', async () => {
      (shareLinksApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

      const { result } = renderHook(() => useDeleteShareLink(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('sharelink-1');
        })
      ).rejects.toThrow('Deletion failed');

      expect(result.current.isError).toBe(true);
    });
  });
});
