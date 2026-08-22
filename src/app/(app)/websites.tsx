import { View, Text, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Input } from 'heroui-native';
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
import { Image } from 'react-native';
import { getThemeColor } from '@/theme/themeColors';
import { shadows } from '@/theme/colors';
import * as Haptics from 'expo-haptics';
import DashboardHeader from '@/components/DashboardHeader';

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
    Haptics.selectionAsync();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleDelete = useCallback((id: string, name: string) => {
    Haptics.selectionAsync();
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
    <TouchableOpacity
      className="bg-surface rounded-xl p-3.5 mb-2 flex-row items-center gap-3"
      style={shadows.sm}
      onPress={() => { Haptics.selectionAsync(); router.push(`/websites/edit/${item.id}`); }}
      activeOpacity={0.7}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Website: ${item.name}`}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={{ width: 44, height: 44, borderRadius: 12 }} />
      ) : (
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
          <IconifyIcon name="lucide:globe" size={20} color={getThemeColor('foreground', isDark)} />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{item.name}</Text>
        <Text className="text-xs text-muted" numberOfLines={1}>{item.url}</Text>
      </View>
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
        className="w-9 h-9 rounded-lg items-center justify-center"
        style={{ backgroundColor: `${getThemeColor('danger', isDark)}15` }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.name}`}
      >
        <IconifyIcon name="lucide:trash-2" size={16} color={getThemeColor('danger', isDark)} />
      </TouchableOpacity>
    </TouchableOpacity>
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
      <View className="pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1.5 -ml-1 rounded-full" style={{ backgroundColor: getThemeColor('surface', isDark) }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessible accessibilityRole="button" accessibilityLabel="Go back">
          <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
        </TouchableOpacity>
        <DashboardHeader title="Websites" />
      </View>
      <View className="mb-4">
        <Input
          placeholder="Search websites..."
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
