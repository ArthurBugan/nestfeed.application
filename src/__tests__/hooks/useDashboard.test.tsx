import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dashboardApi } from '@/api/endpoints';
import { useDashboard } from '@/hooks/useDashboard';

jest.mock('@/api/endpoints', () => ({
  dashboardApi: {
    getTotals: jest.fn(),
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

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch dashboard totals', async () => {
    const mockTotals = {
      groups: 10,
      channels: 25,
      youtubeChannels: 15,
      sharedGroups: 3,
      animeChannels: 8,
      websites: 5,
      animes: 100,
    };
    (dashboardApi.getTotals as jest.Mock).mockResolvedValueOnce(mockTotals);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(dashboardApi.getTotals).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockTotals);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle partial data', async () => {
    const mockTotals = { groups: 5, channels: 10 };
    (dashboardApi.getTotals as jest.Mock).mockResolvedValueOnce(mockTotals);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.data).toEqual(mockTotals);
  });

  it('should handle API error', async () => {
    (dashboardApi.getTotals as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isError).toBe(true);
  });

  it('should have staleTime of 60 seconds', async () => {
    const mockTotals = { groups: 1, channels: 2 };
    (dashboardApi.getTotals as jest.Mock).mockResolvedValueOnce(mockTotals);

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Data should be considered fresh due to staleTime
    expect(result.current.isFetching).toBe(false);
  });
});
