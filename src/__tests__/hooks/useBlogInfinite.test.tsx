import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { blogApi } from '@/api/endpoints/blog';
import { useBlogInfinite } from '@/hooks/useBlogInfinite';

jest.mock('@/api/endpoints/blog', () => ({
  blogApi: {
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

describe('useBlogInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.posts).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.search).toBe('');
      expect(result.current.filters).toEqual({});
    });

    it('should accept custom limit', () => {
      const { result } = renderHook(() => useBlogInfinite({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      expect(result.current.search).toBe('');
    });
  });

  describe('data fetching', () => {
    it('should fetch first page', async () => {
      const mockResponse = {
        data: [
          { id: 1, slug: 'post-1', title: 'Post 1', content: 'Content 1' },
          { id: 2, slug: 'post-2', title: 'Post 2', content: 'Content 2' },
        ],
        total: 10,
      };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
      });
      expect(result.current.posts).toHaveLength(2);
    });

    it('should use custom limit from options', async () => {
      const mockResponse = { data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }], total: 1 };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });

    it('should include search param in request', async () => {
      const mockResponse = { data: [{ id: 1, slug: 'react-post', title: 'React Post', content: '' }], total: 1 };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.setSearch('react');
      });

      // Note: search state update is batched, so we need to wait
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'react',
      });
    });
  });

  describe('search functionality', () => {
    it('should update search state', () => {
      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearch('javascript');
      });

      expect(result.current.search).toBe('javascript');
    });
  });

  describe('filter functionality', () => {
    it('should update filters state', () => {
      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({ category: 'tech', featured: true });
      });

      expect(result.current.filters).toEqual({ category: 'tech', featured: true });
    });

    it('should handle empty filters', () => {
      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({});
      });

      expect(result.current.filters).toEqual({});
    });
  });

  describe('pagination', () => {
    it('should have hasNextPage when there are more posts', async () => {
      const mockResponse = {
        data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }],
        total: 50,
      };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.total).toBe(50);
    });

    it('should not have hasNextPage when all posts loaded', async () => {
      const mockResponse = {
        data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }],
        total: 1,
      };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it('should fetch next page when loadMore is called', async () => {
      (blogApi.list as jest.Mock).mockResolvedValueOnce({
        data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }],
        total: 40,
      });
      (blogApi.list as jest.Mock).mockResolvedValueOnce({
        data: [{ id: 2, slug: 'post-2', title: 'Post 2', content: '' }],
        total: 40,
      });

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(blogApi.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockResponse = {
        data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }],
        total: 1,
      };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(blogApi.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('loading states', () => {
    it('should be loading initially', () => {
      (blogApi.list as jest.Mock).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should show isFetchingNextPage when loading more', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (blogApi.list as jest.Mock).mockResolvedValueOnce({
        data: [{ id: 1, slug: 'post-1', title: 'Post 1', content: '' }],
        total: 40,
      });
      (blogApi.list as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useBlogInfinite(), {
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
          data: [{ id: 2, slug: 'post-2', title: 'Post 2', content: '' }],
          total: 40,
        });
      });
    });
  });

  describe('error states', () => {
    it('should show error when API fails', async () => {
      (blogApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBlogInfinite(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.posts).toEqual([]);
    });
  });
});
