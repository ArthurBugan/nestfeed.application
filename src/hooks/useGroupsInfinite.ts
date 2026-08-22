import { useState, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { groupsApi } from '@/api/endpoints/groups';
import type { PaginatedResponse, Group } from '@/types';

export function useGroupsInfinite(options: { page?: number; search?: string; limit?: number } = {}) {
  const [search, setSearch] = useState(options.search ?? '');
  const [isActive, setIsActive] = useState(false);

  const query = useInfiniteQuery<PaginatedResponse<Group>>({
    queryKey: ['groups', search],
    queryFn: () => groupsApi.list({ 
      page: options.page ?? 1, 
      limit: options.limit ?? 20, 
      search: options.search ?? search 
    }),
    getNextPageParam: (lastPage) => lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages 
      ? lastPage.pagination.page + 1 
      : undefined,
    initialPageParam: 1,
    enabled: isActive,
  });

  const groups = useMemo(() => 
    query.data?.pages.flatMap(page => page?.data ?? []) ?? [],
    [query.data]
  );

  const hasNextPage = useMemo(() => {
    const lastPage = query.data?.pages.at(-1);
    return lastPage?.pagination ? lastPage.pagination.page < lastPage.pagination.totalPages : false;
  }, [query.data]);

  return {
    groups,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage,
    loadMore: query.fetchNextPage,
    search,
    setSearch,
    refetch: query.refetch,
    setIsActive,
  };
}
