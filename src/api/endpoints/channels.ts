import apiClient from '../client';
import type { PaginatedResponse, Pagination } from '../../types';
import type { Channel } from '../../types';

export interface CreateChannelRequest {
  name: string;
  channelId: string;
  url: string;
  thumbnail?: string;
  subscriberCount?: number;
  videoCount?: number;
  groupId: string;
}

export interface UpdateChannelRequest {
  id: string;
  contentType?: string;
  name?: string;
  channelId?: string;
  url?: string;
  thumbnail?: string;
  subscriberCount?: number;
  videoCount?: number;
  groupId?: string;
}

export interface BatchUpdateChannelRequest {
  channels: UpdateChannelRequest[];
}

export const channelsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    return apiClient.get<PaginatedResponse<Channel>>('/api/v2/channels', params);
  },

  get: async (id: string) => {
    return await apiClient.get<Channel>(`/api/v2/channels/${id}`);
  },

  getByGroup: async (groupId: string) => {
    return await apiClient.get<PaginatedResponse<Channel>>(`/api/v2/channels/group/${groupId}`);
  },

  create: async (data: CreateChannelRequest) => {
    return apiClient.post<Channel>('/api/v2/channels', data);
  },

  /** v3 in-group channel create — the only non-destructive create path. */
  createInGroup: async (
    groupId: string,
    data: { channelId?: string; name: string; thumbnail?: string; url?: string; contentType?: string }
  ) => {
    return apiClient.post<Channel>(`/api/v3/groups/${groupId}/channels`, data);
  },

  update: async (id: string, data: UpdateChannelRequest) => {
    return apiClient.patch<Channel>(`/api/v2/channels/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/api/v2/channels/${id}`);
  },

  batchUpdate: async (groupId: string, data: BatchUpdateChannelRequest) => {
    return apiClient.patch<void>(`/api/v3/channels/${groupId}/batch`, data);
  },

  fetchUrl: async (url: string) => {
    return apiClient.post<Channel>('/api/v3/proxy/fetch-url', { url });
  },
};