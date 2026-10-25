import apiClient from '../client';
import type { ShareLink, PaginatedResponse } from '../../types';

export interface CreateShareLinkVariables {
  id: string;
  linkType: string;
  permission: string;
  expiresAt?: string;
}

export interface UpdateShareLinkVariables {
  linkCode?: string;
  linkType?: string;
  permission?: string;
  expiresAt?: string;
}

export interface ListShareLinksVariables {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GenerateShareLinkResponseData {
  shareLink: string;
}

export interface ConsumedShareLinkResponse {
  groupId: string;
  groupName: string;
  groupDescription: string | null;
  linkType: string;
  permission: string | null;
  channelCount: number;
  channels: import('../../types').Channel[];
}

/**
 * Web-facing share URL for a link (mirrors the dashboard's
 * `/{origin}/share/{linkType}/{linkCode}`).
 */
export const buildShareUrl = (linkType: string, linkCode: string) => {
  const origin =
    process.env.EXPO_PUBLIC_GROUPIFY_WEB_URL || 'https://groupify.dev';
  return `${origin}/share/${linkType}/${linkCode}`;
};

export const shareLinksApi = {
  list: async (params?: ListShareLinksVariables) => {
    return apiClient.get<
      { data: ShareLink[]; pagination: import('../../types').Pagination }
    >('/api/v3/share-links', params);
  },

  create: async (data: CreateShareLinkVariables) => {
    return apiClient.post<ShareLink>('/api/v3/share-links', data);
  },

  update: async (id: string, data: UpdateShareLinkVariables) => {
    return apiClient.patch<ShareLink>(`/api/v3/share-links/${id}`, data);
  },
  delete: async (id: string) => {
    return apiClient.delete<void>(`/api/v3/share-links/${id}`);
  },

  generate: async (data: CreateShareLinkVariables) => {
    return apiClient.post<GenerateShareLinkResponseData>('/api/v2/share-link', data);
  },

  getById: async (id: string) => {
    return apiClient.get<ShareLink>(`/api/v2/share-link/${id}`);
  },

  consume: async (linkType: string, linkCode: string) => {
    return apiClient.post<ConsumedShareLinkResponse>(`/api/v2/share-link/${linkType}/${linkCode}`);
  },
};
