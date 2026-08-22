import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { channelsApi } from '@/api/endpoints/channels';
import {
  useChannels,
  useChannel,
  useChannelsByGroup,
  useCreateChannel,
  useUpdateChannel,
  useDeleteChannel,
  useBatchUpdateChannels,
} from '@/hooks/useChannels';

jest.mock('@/api/endpoints', () => ({
  channelsApi: {
    list: jest.fn(),
    get: jest.fn(),
    getByGroup: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    batchUpdate: jest.fn(),
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

describe('useChannels Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useChannels', () => {
    it('should fetch channels list', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.list as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannels({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.list).toHaveBeenCalledWith({ page: 1, limit: undefined, search: undefined });
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useChannel', () => {
    it('should fetch a single channel', async () => {
      const mockChannel = { id: '1', name: 'Test Channel', url: 'https://example.com', groupId: 'g1' };
      (channelsApi.get as jest.Mock).mockResolvedValueOnce(mockChannel);

      const { result } = renderHook(() => useChannel('channel-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.get).toHaveBeenCalledWith('channel-1');
      expect(result.current.data).toEqual(mockChannel);
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useChannel(''), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.get).not.toHaveBeenCalled();
    });
  });

  describe('useChannelsByGroup', () => {
    it('should fetch channels for a group', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Channel 1', url: 'https://example.com', groupId: 'g1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      (channelsApi.getByGroup as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChannelsByGroup('group-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(channelsApi.getByGroup).toHaveBeenCalledWith('group-1');
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useCreateChannel', () => {
    it('should create a channel', async () => {
      const mockChannel = { id: '1', name: 'New Channel', url: 'https://example.com', groupId: 'g1' };
      (channelsApi.create as jest.Mock).mockResolvedValueOnce(mockChannel);

      const { result } = renderHook(() => useCreateChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'New Channel',
          channelId: 'yt-123',
          url: 'https://youtube.com/channel/123',
          groupId: 'group-1',
        });
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useUpdateChannel', () => {
    it('should update a channel', async () => {
      const mockChannel = { id: '1', name: 'Updated', contentType: 'youtube' };
      (channelsApi.update as jest.Mock).mockResolvedValueOnce(mockChannel);

      const { result } = renderHook(() => useUpdateChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'channel-1',
          data: { id: '1', contentType: 'youtube' },
        });
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useDeleteChannel', () => {
    it('should delete a channel', async () => {
      (channelsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('channel-1');
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useBatchUpdateChannels', () => {
    it('should batch update channels', async () => {
      (channelsApi.batchUpdate as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useBatchUpdateChannels(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          groupId: 'group-1',
          data: { channels: [{ id: 'c1', name: 'Updated' }] },
        });
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });
});
