import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  shareLinksApi,
  type CreateShareLinkVariables,
  type ListShareLinksVariables,
  type UpdateShareLinkVariables,
} from '../api/endpoints/shareLinks';

export const shareLinksKey = ['shareLinks'];

export const useShareLinks = (params?: ListShareLinksVariables) => {
  return useQuery({
    queryKey: params ? [...shareLinksKey, params] : shareLinksKey,
    queryFn: () => shareLinksApi.list(params),
  });
};

export const useCreateShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShareLinkVariables) => shareLinksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareLinksKey });
    },
  });
};

export const useUpdateShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShareLinkVariables;
    }) => shareLinksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareLinksKey });
    },
  });
};

export const useDeleteShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shareLinksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareLinksKey });
    },
  });
};
