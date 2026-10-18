import { View, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useWebsitesInfinite } from '@/hooks/useWebsitesInfinite';
import { useDeleteWebsite } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import type { Website } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { IconifyIcon } from '@/components/IconifyIcon';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { FlashList } from '@shopify/flash-list';
import { getThemeColor } from '@/theme/themeColors';
import { alpha } from '@/theme/alpha';
import { tap } from '@/theme/haptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { ListRow } from '@/components/ui/ListRow';
import { PressableScale } from '@/components/ui/PressableScale';

export default function WebsitesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const deleteWebsite = useDeleteWebsite();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const {
    websites,
    loadMore,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useWebsitesInfinite({ limit: 20, search, enabled: loaded });

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Website', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWebsite.mutateAsync(id);
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }, [deleteWebsite]);

  const renderWebsite = useCallback(({ item }: { item: Website }) => (
    <ListRow
      className="mx-4 mb-2"
      leading={
        item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 44, height: 44, borderRadius: 12 }}
          />
        ) : undefined
      }
      icon={item.thumbnail ? undefined : 'lucide:globe'}
      title={item.name}
      subtitle={item.url}
      chevron={false}
      onPress={() => router.push(`/websites/edit/${item.id}`)}
      accessibilityLabel={`Website: ${item.name}`}
      trailing={
        <PressableScale
          onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
          className="w-9 h-9 rounded-lg items-center justify-center"
          style={{ backgroundColor: alpha(getThemeColor('danger', isDark), 0.08) }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
        >
          <IconifyIcon name="lucide:trash-2" size={16} color={getThemeColor('danger', isDark)} />
        </PressableScale>
      }
    />
  ), [isDark, router, handleDelete]);

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
        <ScreenHeader title="Websites" onBack={() => navigation.goBack()} />
      </View>
      <View className="mb-4">
        <SearchField
          placeholder="Search websites..."
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

  if (isError && (!websites || websites.length === 0)) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading && (!websites || websites.length === 0)) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <LoadingState variant="skeleton" label="Loading websites" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        refreshControl={refreshControl}
        ListHeaderComponent={headerComponent}
        data={websites || []}
        renderItem={renderWebsite}
        keyExtractor={(item, index) => String(item.id + index)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 16 }}
        ListEmptyComponent={
          <EmptyState
            icon="lucide:globe"
            title={search ? 'No websites found' : 'No websites yet'}
            description={
              search
                ? `We couldn't find anything for "${search}".`
                : 'Add a website to keep your links organized.'
            }
          />
        }
      />
    </View>
  );
}
