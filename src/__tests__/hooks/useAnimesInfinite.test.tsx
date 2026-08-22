import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { animesApi } from '@/api/endpoints/animes';
import { useAnimesInfinite } from '@/hooks/useAnimesInfinite';

jest.mock('@/api/endpoints/animes', () => ({
  animesApi: {
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

describe('useAnimesInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.animes).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.search).toBe('');
    });

    it('should accept initial options', () => {
      const { result } = renderHook(() => useAnimesInfinite({ search: 'Naruto', limit: 10 }), {
        wrapper: createWrapper(),
      });

      expect(result.current.search).toBe('Naruto');
    });
  });

  describe('data fetching', () => {
    it('should fetch first page', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Anime 1', thumbnail: 'thumb1.jpg' },
          { id: '2', name: 'Anime 2', thumbnail: 'thumb2.jpg' },
        ],
        pagination: { total: 5, page: 1, limit: 20, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: '' });
      expect(result.current.animes).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should include search param in request', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Naruto', thumbnail: 'thumb.jpg' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite({ search: 'Naruto' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: 'Naruto' });
    });

    it('should use custom limit from options', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
    });
  });

  describe('search functionality', () => {
    it('should update search state', () => {
      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearch('Dragon Ball');
      });

      expect(result.current.search).toBe('Dragon Ball');
    });
  });

  describe('pagination', () => {
    it('should have hasNextPage when there are more pages', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 50, page: 1, limit: 20, totalPages: 3 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should not have hasNextPage on last page', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 20, page: 1, limit: 20, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it('should fetch next page when loadMore is called', async () => {
      const page1Response = {
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 40, page: 1, limit: 20, totalPages: 2 },
      };
      const page2Response = {
        data: [{ id: '2', name: 'Anime 2' }],
        pagination: { total: 40, page: 2, limit: 20, totalPages: 2 },
      };
      (animesApi.list as jest.Mock)
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Initial load
      expect(animesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: '' });

      // Fetch next page
      await act(async () => {
        await result.current.loadMore();
      });

      expect(animesApi.list).toHaveBeenLastCalledWith({ page: 2, limit: 20, search: '' });
    });
  });

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(animesApi.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('loading states', () => {
    it('should be loading initially', () => {
      (animesApi.list as jest.Mock).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should show isFetchingNextPage when loading more', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (animesApi.list as jest.Mock).mockResolvedValueOnce({
        data: [{ id: '1', name: 'Anime 1' }],
        pagination: { total: 40, page: 1, limit: 20, totalPages: 2 },
      });
      (animesApi.list as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useAnimesInfinite(), {
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
          data: [{ id: '2', name: 'Anime 2' }],
          pagination: { total: 40, page: 2, limit: 20, totalPages: 2 },
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      (animesApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAnimesInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.animes).toEqual([]);
    });
  });
});
