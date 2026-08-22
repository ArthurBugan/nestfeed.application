import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { websitesApi } from '@/api/endpoints';
import { useWebsites, useDeleteWebsite } from '@/hooks/useWebsites';

jest.mock('@/api/endpoints', () => ({
  websitesApi: {
    list: jest.fn(),
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

describe('useWebsites Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useWebsites', () => {
    it('should fetch websites list', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Website 1', url: 'https://example.com', groupId: 'g1' },
          { id: '2', name: 'Website 2', url: 'https://example2.com', groupId: 'g1' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (websitesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useWebsites({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(websitesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should fetch websites with search param', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test Site', url: 'https://test.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (websitesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useWebsites({ search: 'test' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(websitesApi.list).toHaveBeenCalledWith({ search: 'test' });
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (websitesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useWebsites(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(websitesApi.list).toHaveBeenCalled();
      expect((result.current.data as any)?.data).toEqual([]);
    });

    it('should handle API error', async () => {
      (websitesApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWebsites(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useDeleteWebsite', () => {
    it('should delete a website', async () => {
      (websitesApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteWebsite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('website-1');
      });

      expect(websitesApi.delete).toHaveBeenCalledWith('website-1');
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle deletion failure', async () => {
      (websitesApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

      const { result } = renderHook(() => useDeleteWebsite(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('website-1');
        })
      ).rejects.toThrow('Deletion failed');

      expect(result.current.isError).toBe(true);
    });
  });
});
