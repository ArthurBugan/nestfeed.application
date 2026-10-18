import { useMemo, useState, useRef, useCallback } from 'react';
import { Image, Text, View } from 'react-native';
import { useGroupShelves, useCopyShelf } from '@/hooks/useGroupShelf';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Toast } from '@/components/ui/Toast';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import BottomSheet, { BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';
import type { Channel, Group } from '@/types';

export default function GroupShelfScreen() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedShelf, setSelectedShelf] = useState<Group | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  const { data, isLoading, error, refetch } = useGroupShelves({ search });
  const copyShelf = useCopyShelf();

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCopy = (shelfId: string, shelfName: string) => {
    tap();
    copyShelf.mutate(shelfId, {
      onSuccess: () => {
        Toast.success(`Copied "${shelfName}" to your groups`);
      },
      onError: () => {
        Toast.error('Failed to copy group');
      }
    });
  };

  const openShelfDetails = (shelf: Group) => {
    tap();
    setSelectedShelf(shelf);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setSelectedShelf(null);
  };

  const renderChannel = (item: Channel) => (
    <Card key={item.id} variant="filled" className="p-3 mb-2">
      <View className="flex-row items-center gap-3">
        {item.thumbnail || item.imageUrl ? (
          <Image source={{ uri: item.thumbnail || item.imageUrl }} style={{ width: 44, height: 44, borderRadius: 12 }} />
        ) : (
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-default">
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
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <Screen
        scroll
        edges={['top', 'bottom']}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      >
        <ScreenHeader
          title="Groupshelf"
          subtitle="Discover and copy groups from other users"
          className="pt-4 mb-4"
        />

        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search groupshelf..."
          label="Search groupshelf"
        />

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
              <PressableScale
                key={shelf.id}
                onPress={() => openShelfDetails(shelf)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Group shelf: ${shelf.name}, ${shelf.channelCount || shelf.channels?.length || 0} channels`}
              >
                <Card className="p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-xl items-center justify-center bg-default">
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
                          <View className="bg-accent/10 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-accent font-medium">{shelf.category}</Text>
                          </View>
                        )}
                        <Text className="text-xs text-muted">
                          {shelf.channelCount || shelf.channels?.length || 0} channels
                        </Text>
                      </View>
                    </View>
                    <Button
                      label="Copy"
                      size="sm"
                      loading={copyShelf.isPending}
                      onPress={() => handleCopy(shelf.id, shelf.name || 'Group')}
                      accessibilityLabel={`Copy ${shelf.name || 'group'} to your groups`}
                    />
                  </View>
                </Card>
              </PressableScale>
            ))}
          </View>
        )}
      </Screen>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(index) => {
          if (index < 0) setSelectedShelf(null);
        }}
        backgroundStyle={{ backgroundColor: getThemeColor('background', isDark) }}
        handleIndicatorStyle={{ backgroundColor: getThemeColor('muted-foreground', isDark) }}
      >
        <BottomSheetScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEventThrottle={16}
        >
          {selectedShelf && (
            <View className="pb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl items-center justify-center bg-default">
                    <IconifyIcon name={selectedShelf.icon || 'lucide:folder'} size={20} color={getThemeColor('foreground', isDark)} />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-foreground">{selectedShelf.name}</Text>
                    <Text className="text-sm text-muted">
                      {selectedShelf.channels?.length || 0} channels
                    </Text>
                  </View>
                </View>
                <PressableScale
                  onPress={closeBottomSheet}
                  className="w-11 h-11 rounded-full items-center justify-center bg-surface"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <IconifyIcon name="lucide:x" size={20} color={getThemeColor('muted', isDark)} />
                </PressableScale>
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
