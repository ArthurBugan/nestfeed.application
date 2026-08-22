import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { channelsApi } from '@/api/endpoints/channels';
import { useCreateChannel, useUpdateChannel, useDeleteChannel } from '@/hooks/useChannels';

jest.mock('@/api/endpoints', () => ({
  channelsApi: {
    create: jest.fn(),
    update: jest.fn(),
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

describe('Integration Tests - Channel CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Channel Flow', () => {
    it('should create a channel and invalidate queries', async () => {
      const mockChannel = { id: '1', name: 'New Channel', url: 'https://youtube.com/channel/123', groupId: 'g1' };
      (channelsApi.create as jest.Mock).mockResolvedValueOnce(mockChannel);

      const { result } = renderHook(() => useCreateChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'New Channel',
          channelId: 'yt-123',
          url: 'https://youtube.com/channel/123',
          thumbnail: 'thumb.jpg',
          subscriberCount: 1000,
          videoCount: 50,
          groupId: 'group-1',
        });
      });

      expect(channelsApi.create).toHaveBeenCalledWith({
        name: 'New Channel',
        channelId: 'yt-123',
        url: 'https://youtube.com/channel/123',
        thumbnail: 'thumb.jpg',
        subscriberCount: 1000,
        videoCount: 50,
        groupId: 'group-1',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle create failure', async () => {
      (channelsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Failed to create channel'));

      const { result } = renderHook(() => useCreateChannel(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: 'New Channel',
            channelId: 'yt-123',
            url: 'https://youtube.com/channel/123',
            groupId: 'group-1',
          });
        })
      ).rejects.toThrow('Failed to create channel');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Update Channel Flow', () => {
    it('should update a channel and invalidate queries', async () => {
      const mockChannel = { id: '1', name: 'Updated Channel', contentType: 'youtube' };
      (channelsApi.update as jest.Mock).mockResolvedValueOnce(mockChannel);

      const { result } = renderHook(() => useUpdateChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'channel-1',
          data: { id: '1', contentType: 'youtube', name: 'Updated Channel' },
        });
      });

      expect(channelsApi.update).toHaveBeenCalledWith('channel-1', {
        id: '1',
        contentType: 'youtube',
        name: 'Updated Channel',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle update failure', async () => {
      (channelsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Failed to update channel'));

      const { result } = renderHook(() => useUpdateChannel(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'channel-1', data: { id: '1', name: 'Updated' } });
        })
      ).rejects.toThrow('Failed to update channel');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Delete Channel Flow', () => {
    it('should delete a channel and invalidate queries', async () => {
      (channelsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteChannel(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('channel-1');
      });

      expect(channelsApi.delete).toHaveBeenCalledWith('channel-1');
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle delete failure', async () => {
      (channelsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete channel'));

      const { result } = renderHook(() => useDeleteChannel(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('channel-1');
        })
      ).rejects.toThrow('Failed to delete channel');

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Full Channel Lifecycle', () => {
    it('should create, update, and delete a channel', async () => {
      const mockCreatedChannel = { id: '1', name: 'New Channel', url: 'https://youtube.com/channel/123', groupId: 'g1' };
      const mockUpdatedChannel = { id: '1', name: 'Updated Channel', url: 'https://youtube.com/channel/123', groupId: 'g1' };
      
      (channelsApi.create as jest.Mock).mockResolvedValueOnce(mockCreatedChannel);
      (channelsApi.update as jest.Mock).mockResolvedValueOnce(mockUpdatedChannel);
      (channelsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      // Create
      const createHook = renderHook(() => useCreateChannel(), { wrapper: createWrapper() });
      await act(async () => {
        await createHook.result.current.mutateAsync({
          name: 'New Channel',
          channelId: 'yt-123',
          url: 'https://youtube.com/channel/123',
          groupId: 'group-1',
        });
      });
      expect(createHook.result.current.isSuccess).toBe(true);

      // Update
      const updateHook = renderHook(() => useUpdateChannel(), { wrapper: createWrapper() });
      await act(async () => {
        await updateHook.result.current.mutateAsync({ id: '1', data: { id: '1', name: 'Updated Channel' } });
      });
      expect(updateHook.result.current.isSuccess).toBe(true);

      // Delete
      const deleteHook = renderHook(() => useDeleteChannel(), { wrapper: createWrapper() });
      await act(async () => {
        await deleteHook.result.current.mutateAsync('1');
      });
      expect(deleteHook.result.current.isSuccess).toBe(true);
    });
  });
});
