import { useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Image } from 'react-native';
import { Input } from 'heroui-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useGroupShelves, useCopyShelf } from '@/hooks/useGroupShelf';
import { useTheme } from '@/theme/ThemeProvider';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import BottomSheet, { BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { getThemeColor } from '@/theme/themeColors';
import { shadows } from '@/theme/colors';
import type { Channel, Group } from '@/types';
import * as Haptics from 'expo-haptics';

export default function GroupShelfScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedShelf, setSelectedShelf] = useState<Group | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  const { data, isLoading, error, refetch } = useGroupShelves({ search });
  const copyShelf = useCopyShelf();

  const handleRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCopy = (shelfId: string, shelfName: string) => {
    Haptics.selectionAsync();
    copyShelf.mutate(shelfId, {
      onSuccess: () => {
        Alert.alert('Success', `Copied "${shelfName}" to your groups`);
      },
      onError: () => {
        Alert.alert('Error', 'Failed to copy group');
      }
    });
  };

  const openShelfDetails = (shelf: Group) => {
    Haptics.selectionAsync();
    setSelectedShelf(shelf);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setSelectedShelf(null);
  };

  const renderChannel = (item: Channel) => (
    <TouchableOpacity
      key={item.id}
      className="bg-surface rounded-xl p-3 mb-2 flex-row items-center gap-3"
      style={shadows.sm}
      activeOpacity={0.7}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Channel: ${item.name}`}
    >
      {item.thumbnail || item.imageUrl ? (
        <Image source={{ uri: item.thumbnail || item.imageUrl }} style={{ width: 44, height: 44, borderRadius: 12 }} />
      ) : (
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
          <IconifyIcon name="lucide:tv" size={20} color={getThemeColor('foreground', isDark)} />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{item.name}</Text>
        {item.description && (
          <Text className="text-xs text-muted" numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
          {/* Header */}
          <View className="pt-4 pb-2 flex-row items-center">
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.back(); }}
              className="mr-3 w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: getThemeColor('surface', isDark) }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Groupshelf</Text>
              <Text className="text-muted text-sm mt-1">Discover and copy groups from other users</Text>
            </View>
          </View>

          <View className="mb-4">
            <Input
              placeholder="Search groupshelf..."
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
              value={search}
              onChangeText={setSearch}
              className="rounded-xl"
            />
          </View>

          {isLoading ? (
            <LoadingState variant="skeleton" rows={5} label="Loading groupshelf" />
          ) : error ? (
            <ErrorState
              title="Error loading groupshelf"
              message={error.message || 'Failed to load groupshelf. Please try again.'}
              onRetry={handleRefresh}
            />
          ) : data?.data.length === 0 ? (
            <EmptyState
              icon="lucide:search-x"
              title={search ? `No results for "${search}"` : 'No groupshelf found'}
              description="Try a different search term"
            />
          ) : (
            <View className="gap-3">
              {data?.data.map(shelf => (
                <TouchableOpacity
                  key={shelf.id}
                  className="bg-surface rounded-xl p-4 border border-border/50"
                  style={shadows.sm}
                  onPress={() => openShelfDetails(shelf)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Group shelf: ${shelf.name}, ${shelf.channelCount || shelf.channels?.length || 0} channels`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                      <IconifyIcon name={shelf.icon || 'lucide:folder'} size={20} color={getThemeColor('foreground', isDark)} />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{shelf.name}</Text>
                      {shelf.description && shelf.description !== '' && (
                        <Text className="text-xs text-muted mt-0.5" numberOfLines={2}>
                          {shelf.description}
                        </Text>
                      )}
                      <View className="flex-row items-center gap-2 mt-1.5">
                        {shelf.category && (
                          <View className="bg-accent/10 px-2 py-0.5 rounded-md">
                            <Text className="text-xs text-accent font-medium">{shelf.category}</Text>
                          </View>
                        )}
                        <Text className="text-xs text-muted">
                          {shelf.channelCount || shelf.channels?.length || 0} channels
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); handleCopy(shelf.id, shelf.name || 'Group'); }}
                      disabled={copyShelf.isPending}
                      className="bg-accent px-3.5 py-2 rounded-lg"
                      activeOpacity={0.7}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Copy ${shelf.name || 'group'} to your groups`}
                    >
                      {copyShelf.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-accent-foreground font-semibold text-sm">Copy</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: getThemeColor('background', isDark) }}
        handleIndicatorStyle={{ backgroundColor: getThemeColor('muted-foreground', isDark) }}
      >
        <BottomSheetScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          scrollEventThrottle={16}
        >
          {selectedShelf && (
            <View className="pb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                    <IconifyIcon name={selectedShelf.icon || 'lucide:folder'} size={20} color={getThemeColor('foreground', isDark)} />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-foreground">{selectedShelf.name}</Text>
                    <Text className="text-sm text-muted">
                      {selectedShelf.channels?.length || 0} channels
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeBottomSheet} className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: getThemeColor('surface', isDark) }} accessible accessibilityRole="button" accessibilityLabel="Close">
                  <IconifyIcon name="lucide:x" size={20} color={getThemeColor('muted', isDark)} />
                </TouchableOpacity>
              </View>

              {selectedShelf.description && (
                <Text className="text-muted mb-4 text-sm leading-relaxed">{selectedShelf.description}</Text>
              )}

              {selectedShelf.channels && selectedShelf.channels.length > 0 ? (
                <View className="gap-2">
                  {selectedShelf.channels.map(channel => renderChannel(channel))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <IconifyIcon name="lucide:tv-off" size={48} className="text-muted mb-4" />
                  <Text className="text-muted">No channels in this group</Text>
                </View>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
