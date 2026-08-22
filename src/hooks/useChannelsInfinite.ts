import { useState, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { channelsApi } from '@/api/endpoints/channels';
import type { PaginatedResponse, Channel } from '@/types';

export function useChannelsInfinite({ limit = 20, search }: { limit?: number; search?: string } = {}) {
  const [searchText, setSearchText] = useState(search ?? '');
  const [isActive, setIsActive] = useState(false);
  const searchRef = useRef(searchText);
  searchRef.current = searchText;

  const query = useInfiniteQuery<PaginatedResponse<Channel>>({
    queryKey: ['channels', searchText],
    queryFn: ({ pageParam = 1 }) => channelsApi.list({ page: pageParam, limit, search: searchRef.current }),
    getNextPageParam: (lastPage) => lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages 
      ? lastPage.pagination.page + 1 
      : undefined,
    initialPageParam: 1,
    enabled: isActive,
  });

  return {
    channels: query.data?.pages.flatMap(page => page?.data ?? []) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: query.fetchNextPage,
    search: searchText,
    setSearch: setSearchText,
    refetch: query.refetch,
    setIsActive,
  };
}
