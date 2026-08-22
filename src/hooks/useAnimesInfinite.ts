import { useState, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { animesApi } from '@/api/endpoints/animes';
import type { PaginatedResponse, Anime } from '@/types';

export function useAnimesInfinite(options: { search?: string; limit?: number } = {}) {
  const [search, setSearch] = useState(options.search ?? '');
  const [isActive, setIsActive] = useState(false);
  const searchRef = useRef(search);
  searchRef.current = search;

  const query = useInfiniteQuery<PaginatedResponse<Anime>>({
    queryKey: ['animes', search],
    queryFn: ({ pageParam = 1 }) => animesApi.list({ page: pageParam, limit: options.limit ?? 20, search: searchRef.current }),
    getNextPageParam: (lastPage) => lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages 
      ? lastPage.pagination.page + 1 
      : undefined,
    initialPageParam: 1,
    enabled: isActive,
  });

  return {
    animes: query.data?.pages.flatMap(page => page?.data ?? []) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: query.fetchNextPage,
    search,
    setSearch,
    setIsActive,
    refetch: query.refetch,
  };
}
