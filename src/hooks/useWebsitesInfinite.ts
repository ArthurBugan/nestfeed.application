import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { websitesApi } from '@/api/endpoints/websites';
import type { PaginatedResponse, Website } from '@/types';

export function useWebsitesInfinite({ limit = 20, page, search, enabled = true }: { limit?: number; page?: number; search?: string; enabled?: boolean }) {
  const [searchText, setSearchText] = useState(search ?? '');

  const query = useInfiniteQuery<PaginatedResponse<Website>>({
    queryKey: ['websites', searchText],
    queryFn: ({ pageParam = 1 }) => websitesApi.list({ page: pageParam ?? page, limit, ...(searchText ? { search: searchText } : {}) }),
    getNextPageParam: (lastPage) => lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages 
      ? lastPage.pagination.page + 1 
      : undefined,
    initialPageParam: 1,
    enabled,
  });

  return {
    websites: query.data?.pages.flatMap(page => page?.data ?? []) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: query.fetchNextPage,
    search: searchText,
    setSearch: setSearchText,
    refetch: query.refetch,
  };
}
