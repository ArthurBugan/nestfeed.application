import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Input } from 'heroui-native';

import { useRouter } from 'expo-router';
import { useBlogInfinite } from '@/hooks';
import { Card, Skeleton } from 'heroui-native';

import DashboardHeader from '@/components/DashboardHeader';
import type { BlogPost } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export default function BlogListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    search,
    setSearch,
  } = useBlogInfinite({ limit: 10 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const renderPost = ({ item: post }: { item: BlogPost }) => (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${post.slug}`); }}
      activeOpacity={0.7}
    >
      <Card className="mb-3">
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
    </TouchableOpacity>
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

  const renderSkeleton = () => (
    <View className="gap-3 p-1">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <View>
            <Skeleton height={22} className="mb-2" />
            <Skeleton height={16} className="mb-1" />
            <Skeleton height={14} className="mt-2 w-1/3" />
          </View>
        </Card>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={getThemeColor('accent', isDark)}
            colors={[getThemeColor('accent', isDark)]}
          />
        }
      >
        <View style={{ paddingTop: insets.top, paddingHorizontal: 16 }}>
          <View className="pt-4 pb-3">
            <View className="flex-row items-center mb-1">
              <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} className="mr-3 p-1.5 -ml-1 rounded-full" style={{ backgroundColor: getThemeColor('surface', isDark) }}>
                <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-foreground">Blog</Text>
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center bg-default border border-border rounded-xl px-4 py-3" style={{ borderWidth: 1.5 }}>
              <IconifyIcon name="lucide:search" size={18} color={getThemeColor('muted', isDark)} />
              <View className="flex-1 ml-2">
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search posts..."
                  placeholderTextColor={getThemeColor('field-placeholder', isDark)}
                  className="text-base"
                />
              </View>
            </View>
          </View>

          {isLoading ? (
            renderSkeleton()
          ) : posts.length === 0 ? (
            <View className="py-16 items-center">
              <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                <IconifyIcon name="lucide:newspaper" size={32} color={getThemeColor('muted', isDark)} />
              </View>
              <Text className="text-muted text-center font-medium">No posts yet</Text>
              <Text className="text-muted text-xs text-center mt-1">Check back later for updates</Text>
            </View>
          ) : (
            <View className="px-1">
              {posts.map(post => renderPost({ item: post }))}
            </View>
          )}
          {renderFooter()}
        </View>
      </ScrollView>
    </View>
  );
}
