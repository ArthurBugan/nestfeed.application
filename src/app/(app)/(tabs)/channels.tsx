import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'react-native';
import { Input } from 'heroui-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useChannelsInfinite } from '@/hooks/useChannelsInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Channel } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo, useCallback } from 'react';
import { IconifyIcon } from '@/components/IconifyIcon';
import { InlineAd } from '@/components/Admob';
import { Skeleton } from 'heroui-native';
import { FlashList } from '@shopify/flash-list';
import { getThemeColor } from '@/theme/themeColors';
import * as Haptics from 'expo-haptics';
import DashboardHeader from '@/components/DashboardHeader';

type ListItem = Channel | { isAd: true; id: string };

export default function ChannelsListScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    channels,
    loadMore,
    isFetchingNextPage,
    isLoading,
    refetch,
    setIsActive,
  } = useChannelsInfinite({ limit: 20, search });

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [setIsActive])
  );

  const handleRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const channelsWithAds = useMemo(() => {
    if (!channels) return [];
    const result: ListItem[] = [];
    channels.forEach((channel, index) => {
      result.push(channel);
      if ((index + 1) % 5 === 0) {
        result.push({ isAd: true, id: `ad-${index}` });
      }
    });
    return result;
  }, [channels]);

  const renderChannel = useCallback(({ item }: { item: Channel }) => (
    <TouchableOpacity
      className="mx-4 bg-surface rounded-xl p-3.5 mb-2 flex-row items-center gap-3"
      onPress={() => { Haptics.selectionAsync(); router.push(`/channels/change-group/${item.id}`); }}
      activeOpacity={0.7}
    >
      {(item.thumbnail || (item as any).imageUrl) ? (
        <Image source={{ uri: item.thumbnail || item.imageUrl }} style={{ width: 36, height: 36, borderRadius: 12 }} />
      ) : (
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
          <IconifyIcon name="lucide:tv" size={20} color={getThemeColor('foreground', isDark)} />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{item.name}</Text>
        {item.description && (
          <Text className="text-xs text-muted mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.groupName && (
          <View className="flex-row items-center gap-1 mt-1">
            <IconifyIcon name="lucide:folder" size={11} color={getThemeColor('muted', isDark)} />
            <Text className="text-xs text-muted">{item.groupName}</Text>
          </View>
        )}
      </View>
      <IconifyIcon name="lucide:chevron-right" size={16} color={getThemeColor('muted', isDark)} />
    </TouchableOpacity>
  ), [isDark, router]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
      </View>
    );
  }, [isFetchingNextPage, isDark]);

  const renderSkeleton = () => (
    <View className="px-4 gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="bg-surface rounded-xl p-3.5 flex-row items-center gap-3">
          <Skeleton width={44} height={44} className="rounded-xl" />
          <View className="flex-1 gap-2">
            <Skeleton height={16} className="w-3/4 rounded-lg" />
            <Skeleton height={12} className="w-1/2 rounded-lg" />
          </View>
        </View>
      ))}
    </View>
  );

  const headerComponent = (
    <View style={{ paddingHorizontal: 16 }}>
      <View className="pt-4 pb-2">
        <DashboardHeader title="Channels" />
      </View>
      <View className="mb-4">
        <Input
          placeholder="Search channels..."
          placeholderTextColor={getThemeColor('field-placeholder', isDark)}
          value={search}
          onChangeText={setSearch}
          className="rounded-xl"
        />
      </View>
    </View>
  );

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={getThemeColor('accent', isDark)}
      colors={[getThemeColor('accent', isDark)]}
    />
  );

  if (isLoading && channels.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        refreshControl={refreshControl}
        ListHeaderComponent={headerComponent}
        data={channelsWithAds}
        onEndReached={loadMore}
        renderItem={({ item }) => {
          if ('isAd' in item) {
            return <InlineAd />;
          }
          return renderChannel({ item });
        }}
        keyExtractor={(item, index) => item.id + index}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 16 }}
        ListEmptyComponent={
          <View className="py-16 items-center">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: getThemeColor('default', isDark) }}>
              <IconifyIcon name="lucide:tv" size={32} color={getThemeColor('muted', isDark)} />
            </View>
            <Text className="text-muted text-center font-medium">No channels found</Text>
          </View>
        }
      />
    </View>
  );
}
