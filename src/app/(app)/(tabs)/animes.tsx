import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Input } from 'heroui-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAnimesInfinite } from '@/hooks/useAnimesInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Anime } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useMemo, useCallback, useState } from 'react';
import { InlineAd } from '@/components/Admob';
import { Skeleton } from 'heroui-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'react-native';
import { getThemeColor } from '@/theme/themeColors';
import * as Haptics from 'expo-haptics';
import DashboardHeader from '@/components/DashboardHeader';

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
    Haptics.selectionAsync();
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

  const renderAnime = useCallback(({ item }: { item: Anime }) => (
    <TouchableOpacity
      className="mx-4 bg-surface rounded-xl p-3.5 mb-2 flex-row items-center gap-3"
      onPress={() => { Haptics.selectionAsync(); router.push(`/animes/change-group/${item.id}`); }}
      activeOpacity={0.7}
    >
      {item.thumbnail || item.imageUrl ? (
        <Image source={{ uri: item.thumbnail || item.imageUrl }} style={{ width: 36, height: 36, borderRadius: 12 }} />
      ) : (
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
          <IconifyIcon name="lucide:film" size={20} color={getThemeColor('foreground', isDark)} />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{item.name}</Text>
        {item.description && (
          <Text className="text-xs text-muted mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.groupIcon && (
          <View className="flex-row items-center gap-1 mt-1">
            <IconifyIcon name="lucide:folder" size={11} color={getThemeColor('muted', isDark)} />
            <Text className="text-xs text-muted">{item.groupName}</Text>
          </View>
        )}
      </View>
      {item.url && (
        <TouchableOpacity
          onPress={() => openCrunchyroll(item.url!)}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <IconifyIcon name="lucide:external-link" size={16} color={getThemeColor('muted', isDark)} />
        </TouchableOpacity>
      )}
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
        <DashboardHeader title="Animes" />
      </View>
      <View className="mb-4">
        <Input
          placeholder="Search animes..."
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
          <View className="py-16 items-center">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: getThemeColor('default', isDark) }}>
              <IconifyIcon name="lucide:film" size={32} color={getThemeColor('muted', isDark)} />
            </View>
            <Text className="text-muted text-center font-medium">No animes found</Text>
          </View>
        }
      />
    </View>
  );
}
