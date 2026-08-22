import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { channelsApi } from '@/api/endpoints/channels';
import { useChannelsInfinite } from '@/hooks/useChannelsInfinite';

jest.mock('@/api/endpoints/channels', () => ({
  channelsApi: {
    list: jest.fn(),
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

describe('useChannelsInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.channels).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.search).toBe('');
    });

    it('should accept initial options', () => {
      const { result } = renderHook(() => useChannelsInfinite({ search: 'test', limit: 10 }), {
        wrapper: createWrapper(),
      });

      expect(result.current.search).toBe('test');
    });
  });

  describe('data fetching', () => {
    it('should fetch first page', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' },
          { id: '2', name: 'Channel 2', url: 'https://example2.com', groupId: 'g1' },
        ],
        pagination: { total: 5, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: '' });
      expect(result.current.channels).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should include search param in request', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test Channel', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite({ search: 'test' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: 'test' });
    });

    it('should use custom limit from options', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.list).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
    });
  });

  describe('search functionality', () => {
    it('should update search state', () => {
      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearch('My Channel');
      });

      expect(result.current.search).toBe('My Channel');
    });
  });

  describe('pagination', () => {
    it('should have hasNextPage when there are more pages', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 50, page: 1, limit: 20, totalPages: 3 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should not have hasNextPage on last page', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 20, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it('should fetch next page when loadMore is called', async () => {
      const page1Response = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 40, page: 1, limit: 20, totalPages: 2 },
      };
      const page2Response = {
        data: [{ id: '2', name: 'Channel 2', url: 'https://example2.com', groupId: 'g1' }],
        pagination: { total: 40, page: 2, limit: 20, totalPages: 2 },
      };
      (channelsApi.list as jest.Mock)
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: '' });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(channelsApi.list).toHaveBeenLastCalledWith({ page: 2, limit: 20, search: '' });
    });
  });

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(channelsApi.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('loading states', () => {
    it('should be loading initially', () => {
      (channelsApi.list as jest.Mock).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should show isFetchingNextPage when loading more', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (channelsApi.list as jest.Mock).mockResolvedValueOnce({
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 40, page: 1, limit: 20, totalPages: 2 },
      });
      (channelsApi.list as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.loadMore();
      });

      expect(result.current.isFetchingNextPage).toBe(true);

      act(() => {
        resolvePromise!({
          data: [{ id: '2', name: 'Channel 2', url: 'https://example2.com', groupId: 'g1' }],
          pagination: { total: 40, page: 2, limit: 20, totalPages: 2 },
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      (channelsApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useChannelsInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.channels).toEqual([]);
    });
  });
});
