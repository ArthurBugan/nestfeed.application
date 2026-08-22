import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { blogApi } from '@/api/endpoints';
import { useBlogPosts, useBlogPost } from '@/hooks/useBlog';

jest.mock('@/api/endpoints', () => ({
  blogApi: {
    list: jest.fn(),
    getBySlug: jest.fn(),
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

describe('useBlog Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useBlogPosts', () => {
    it('should fetch blog posts list', async () => {
      const mockResponse = {
        data: [
          { id: 1, slug: 'post-1', title: 'Post 1', content: 'Content 1' },
          { id: 2, slug: 'post-2', title: 'Post 2', content: 'Content 2' },
        ],
        total: 2,
      };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogPosts(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.list).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle empty response', async () => {
      const mockResponse = { data: [], total: 0 };
      (blogApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useBlogPosts(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.list).toHaveBeenCalled();
      expect((result.current.data as any)?.data).toEqual([]);
    });

    it('should handle API error', async () => {
      (blogApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBlogPosts(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useBlogPost', () => {
    it('should fetch a single blog post', async () => {
      const mockPost = { id: 1, slug: 'my-post', title: 'My Post', content: 'Content here' };
      (blogApi.getBySlug as jest.Mock).mockResolvedValueOnce(mockPost);

      const { result } = renderHook(() => useBlogPost('my-post'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.getBySlug).toHaveBeenCalledWith('my-post');
      expect(result.current.data).toEqual(mockPost);
    });

    it('should not fetch when slug is empty', async () => {
      const { result } = renderHook(() => useBlogPost(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(blogApi.getBySlug).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle API error', async () => {
      (blogApi.getBySlug as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useBlogPost('nonexistent'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
    });
  });
});
