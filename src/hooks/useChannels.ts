import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelsApi, type CreateChannelRequest, type UpdateChannelRequest } from '@/api/endpoints/channels';

export const useChannels = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['channels', params],
    queryFn: () => channelsApi.list(params),
  });
};

export const useChannel = (id: string) => {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => channelsApi.get(id),
    enabled: !!id,
  });
};

export const useChannelsByGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['channels', 'group', groupId],
    queryFn: () => channelsApi.getByGroup(groupId),
    enabled: !!groupId,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChannelRequest) => channelsApi.createInGroup(data.groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChannelRequest }) =>
      channelsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => channelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBatchUpdateChannels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: { channels: UpdateChannelRequest[] } }) =>
      channelsApi.batchUpdate(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
};