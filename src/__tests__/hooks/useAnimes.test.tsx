import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { animesApi } from '@/api/endpoints';
import { useAnimes, useAnime } from '@/hooks/useAnimes';

jest.mock('@/api/endpoints', () => ({
  animesApi: {
    list: jest.fn(),
    get: jest.fn(),
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

describe('useAnimes Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAnimes', () => {
    it('should fetch animes list', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Anime 1', thumbnail: 'thumb1.jpg' },
          { id: '2', name: 'Anime 2', thumbnail: 'thumb2.jpg' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimes({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should fetch animes with search param', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Naruto', thumbnail: 'thumb.jpg' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimes({ search: 'Naruto' }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalledWith({ search: 'Naruto' });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      (animesApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnimes(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.list).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect((result.current.data as any)?.data).toEqual([]);
    });

    it('should handle API error', async () => {
      (animesApi.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAnimes(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('useAnime', () => {
    it('should fetch a single anime', async () => {
      const mockAnime = { id: '1', name: 'One Piece', thumbnail: 'thumb.jpg' };
      (animesApi.get as jest.Mock).mockResolvedValueOnce(mockAnime);

      const { result } = renderHook(() => useAnime('anime-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.get).toHaveBeenCalledWith('anime-1');
      expect(result.current.data).toEqual(mockAnime);
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useAnime(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.get).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    it('should not fetch when id is null', async () => {
      const { result } = renderHook(() => useAnime(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.get).not.toHaveBeenCalled();
    });

    it('should refetch when id changes', async () => {
      const mockAnime1 = { id: '1', name: 'Anime 1' };
      const mockAnime2 = { id: '2', name: 'Anime 2' };
      (animesApi.get as jest.Mock)
        .mockResolvedValueOnce(mockAnime1)
        .mockResolvedValueOnce(mockAnime2);

      const { result, rerender } = renderHook(({ id }) => useAnime(id), {
        wrapper: createWrapper(),
        initialProps: { id: 'anime-1' },
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.get).toHaveBeenCalledWith('anime-1');
      expect(result.current.data).toEqual(mockAnime1);

      rerender({ id: 'anime-2' });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(animesApi.get).toHaveBeenCalledWith('anime-2');
      expect(result.current.data).toEqual(mockAnime2);
    });
  });
});
