import { View, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useChannelsInfinite } from '@/hooks/useChannelsInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Channel } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo, useCallback } from 'react';
import { InlineAd } from '@/components/Admob';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { FlashList } from '@shopify/flash-list';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { ListRow } from '@/components/ui/ListRow';

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
    isError,
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
    tap();
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

  const renderChannel = useCallback(({ item }: { item: Channel }) => {
    const hasThumbnail = !!(item.thumbnail || (item as any).imageUrl);

    return (
      <ListRow
        className="mx-4 mb-2"
        leading={
          hasThumbnail ? (
            <Image
              source={{ uri: item.thumbnail || item.imageUrl }}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
          ) : undefined
        }
        icon={hasThumbnail ? undefined : 'lucide:tv'}
        title={item.name}
        subtitle={item.description || undefined}
        value={item.groupName || undefined}
        onPress={() => router.push(`/channels/change-group/${item.id}`)}
        accessibilityLabel={`Channel: ${item.name}`}
      />
    );
  }, [router]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
      </View>
    );
  }, [isFetchingNextPage, isDark]);

  const headerComponent = (
    <View style={{ paddingHorizontal: 16 }}>
      <View className="pt-4 pb-2">
        <ScreenHeader title="Channels" leading="none" />
      </View>
      <View className="mb-4">
        <SearchField
          placeholder="Search channels..."
          value={search}
          onChangeText={setSearch}
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

  if (isError && channels.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading && channels.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <LoadingState variant="skeleton" label="Loading channels" />
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
          <EmptyState
            icon="lucide:tv"
            title={search ? 'No channels found' : 'No channels yet'}
            description={
              search
                ? `We couldn't find anything for "${search}".`
                : 'Add a channel to start organizing your content.'
            }
          />
        }
      />
    </View>
  );
}
