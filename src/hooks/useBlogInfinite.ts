import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { blogApi, type BlogQueryParams } from '@/api/endpoints/blog';
import type { BlogPost } from '@/types';

interface BlogFilters {
  category?: string;
  featured?: boolean;
}

export function useBlogInfinite(options: { limit?: number } = {}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BlogFilters>({});
  const limit = options.limit ?? 20;

  const queryKey = ['blogPosts', search, filters];

  const query = useInfiniteQuery<{ data: BlogPost[]; total: number }>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params: BlogQueryParams = {
        page: pageParam,
        limit,
        search: search || undefined,
        ...filters,
      };
      if (!filters.category) delete params.category;
      if (!filters.featured) delete params.featured;
      return blogApi.list(params);
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      const totalLoaded = pages.reduce((sum, p) => sum + (p?.data?.length ?? 0), 0);
      const total = lastPage.total ?? 0;
      return totalLoaded < total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const posts = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  const total = query.data?.pages[0]?.total ?? 0;
  const hasNextPage = posts.length < total;

  return {
    posts,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage,
    loadMore: query.fetchNextPage,
    search,
    setSearch,
    filters,
    setFilters,
    refetch: query.refetch,
    error: query.error,
  };
}
