import { View, ActivityIndicator, RefreshControl, Linking, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAnimesInfinite } from '@/hooks/useAnimesInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Anime } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useMemo, useCallback, useState } from 'react';
import { InlineAd } from '@/components/Admob';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { FlashList } from '@shopify/flash-list';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { ListRow } from '@/components/ui/ListRow';
import { PressableScale } from '@/components/ui/PressableScale';

type ListItem = Anime | { isAd: true; id: string };

const openCrunchyroll = (url: string) => {
  Linking.canOpenURL('crunchyroll://')
    .then((supported) => {
      if (supported) {
        Linking.openURL('crunchyroll://').catch(() => {
          Linking.openURL(url);
        });
      } else {
        Linking.openURL(url);
      }
    })
    .catch(() => {
      Linking.openURL(url);
    });
};

export default function AnimesListScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    animes,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMore,
    search,
    setSearch,
    refetch,
    setIsActive,
  } = useAnimesInfinite();

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [setIsActive])
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const animesWithAds = useMemo(() => {
    if (!animes) return [];
    const result: ListItem[] = [];
    animes.forEach((anime, index) => {
      result.push(anime);
      if ((index + 1) % 5 === 0) {
        result.push({ isAd: true, id: `ad-${index}` });
      }
    });
    return result;
  }, [animes]);

  const renderAnime = useCallback(({ item }: { item: Anime }) => {
    const hasThumbnail = !!(item.thumbnail || item.imageUrl);

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
        icon={hasThumbnail ? undefined : 'lucide:film'}
        title={item.name}
        subtitle={item.description || undefined}
        value={item.groupIcon ? item.groupName || undefined : undefined}
        chevron
        onPress={() => router.push(`/animes/change-group/${item.id}`)}
        accessibilityLabel={`Anime: ${item.name}`}
        trailing={
          item.url ? (
            <PressableScale
              onPress={() => openCrunchyroll(item.url!)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
            >
              <IconifyIcon
                name="lucide:external-link"
                size={16}
                color={getThemeColor('muted', isDark)}
              />
            </PressableScale>
          ) : undefined
        }
      />
    );
  }, [isDark, router]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
      </View>
    );
  }, [isFetchingNextPage, isDark]);

  const renderSkeleton = () => <LoadingState variant="skeleton" rows={5} label="Loading animes" />;

  const headerComponent = (
    <View style={{ paddingHorizontal: 16 }}>
      <View className="pt-4 pb-2">
        <ScreenHeader title="Animes" leading="none" />
      </View>
      <View className="mb-4">
        <SearchField
          placeholder="Search animes..."
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

  if (isError && animes.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading && animes.length === 0) {
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
        data={animesWithAds}
        renderItem={({ item }) => {
          if ('isAd' in item) {
            return <InlineAd />;
          }
          return renderAnime({ item });
        }}
        keyExtractor={(item, index) => item.id + index}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 16 }}
        ListEmptyComponent={
          <EmptyState
            icon="lucide:film"
            title={search ? 'No animes found' : 'No animes yet'}
            description={
              search
                ? `We couldn't find anything for "${search}".`
                : 'Add an anime to start organizing your content.'
            }
          />
        }
      />
    </View>
  );
}
