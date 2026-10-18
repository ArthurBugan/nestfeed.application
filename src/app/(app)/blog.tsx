import { View, Text, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';

import { useRouter } from 'expo-router';
import { useBlogInfinite } from '@/hooks';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import type { BlogPost } from '@/types';
import { IconifyIcon } from '@/components/IconifyIcon';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import { useState, useCallback } from 'react';
import { tap } from '@/theme/haptics';

export default function BlogListScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const {
    posts,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    refetch,
    search,
    setSearch,
  } = useBlogInfinite({ limit: 10 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const renderPost = ({ item: post }: { item: BlogPost }) => (
    <PressableScale
      key={post.id}
      onPress={() => router.push(`/blog/${post.slug}`)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={post.title}
      className="mb-3"
    >
      <Card>
        <View>
          <Text className="text-lg text-foreground font-semibold mb-1">{post.title}</Text>
          {post.excerpt && (
            <Text className="text-muted text-sm" numberOfLines={2}>
              {post.excerpt}
            </Text>
          )}
          <View className="flex-row items-center gap-1 mt-3">
            <IconifyIcon name="lucide:calendar" size={14} color={getThemeColor('muted', isDark)} />
            <Text className="text-muted text-xs">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </Card>
    </PressableScale>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-muted text-sm">All posts loaded</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Screen
      scroll
      edges={['top', 'bottom']}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    >
      <ScreenHeader title="Blog" className="pt-4 mb-3" />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search posts..."
        label="Search posts"
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <LoadingState variant="skeleton" rows={3} label="Loading posts" />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="lucide:newspaper"
          title={search ? 'No posts found' : 'No posts yet'}
          description={
            search
              ? `We couldn't find anything for "${search}".`
              : 'Check back later for updates'
          }
        />
      ) : (
        <View className="mt-1">
          {posts.map(post => renderPost({ item: post }))}
        </View>
      )}
      {renderFooter()}
    </Screen>
  );
}
