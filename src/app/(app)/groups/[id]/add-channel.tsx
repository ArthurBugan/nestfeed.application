import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroup, useBatchUpdateChannels } from '@/hooks';
import { useChannelsInfinite } from '@/hooks/useChannelsInfinite';
import { useAnimesInfinite } from '@/hooks/useAnimesInfinite';
import { useWebsitesInfinite } from '@/hooks/useWebsitesInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { IconifyIcon } from '@/components/IconifyIcon';
import { channelsApi } from '@/api/endpoints/channels';
import type { Channel } from '@/types';
import { Button } from 'heroui-native';

const TABS = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'anime', label: 'Animes' },
  { key: 'website', label: 'Websites' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function CheckIcon({ selected }: { selected: boolean }) {
  return (
    <View className={`w-5 h-5 rounded-md border-2 items-center justify-center ${selected ? 'bg-accent border-accent' : 'border-muted'}`}>
      {selected && <Text className="text-accent-foreground text-xs font-bold">✓</Text>}
    </View>
  );
}

export default function AddChannelToGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const batchUpdateChannels = useBatchUpdateChannels();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('youtube');
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const [selectedYoutubeIds, setSelectedYoutubeIds] = useState<Set<string>>(new Set());
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<Set<string>>(new Set());
  const [selectedWebsiteIds, setSelectedWebsiteIds] = useState<Set<string>>(new Set());
  const [selectedYoutubeItems, setSelectedYoutubeItems] = useState<Map<string, Channel>>(new Map());
  const [selectedAnimeItems, setSelectedAnimeItems] = useState<Map<string, Channel>>(new Map());
  const [selectedWebsiteItems, setSelectedWebsiteItems] = useState<Map<string, Channel>>(new Map());

  const selectedYoutubeIdsRef = useRef(selectedYoutubeIds);
  selectedYoutubeIdsRef.current = selectedYoutubeIds;
  const selectedAnimeIdsRef = useRef(selectedAnimeIds);
  selectedAnimeIdsRef.current = selectedAnimeIds;
  const selectedWebsiteIdsRef = useRef(selectedWebsiteIds);
  selectedWebsiteIdsRef.current = selectedWebsiteIds;

  const [selectionVersion, setSelectionVersion] = useState(0);

  useEffect(() => {
    const channels = group?.channels || [];
    const ytIds = new Set<string>();
    const animeIds = new Set<string>();
    const webIds = new Set<string>();
    const ytItems = new Map<string, Channel>();
    const animeItems = new Map<string, Channel>();
    const webItems = new Map<string, Channel>();
    for (const c of channels) {
      if (!c.contentType || c.contentType === 'youtube') {
        ytIds.add(c.id);
        ytItems.set(c.id, c);
      } else if (c.contentType === 'anime') {
        animeIds.add(c.id);
        animeItems.set(c.id, c);
      } else if (c.contentType === 'website') {
        webIds.add(c.id);
        webItems.set(c.id, c);
      }
    }
    setSelectedYoutubeIds(ytIds);
    setSelectedAnimeIds(animeIds);
    setSelectedWebsiteIds(webIds);
    setSelectedYoutubeItems(ytItems);
    setSelectedAnimeItems(animeItems);
    setSelectedWebsiteItems(webItems);
  }, [group?.channels]);

  const {
    channels,
    loadMore,
    isFetchingNextPage,
    isLoading,
    setSearch: setChannelsSearch,
    setIsActive,
  } = useChannelsInfinite({ limit: 20 });

  const {
    animes,
    loadMore: loadMoreAnimes,
    isFetchingNextPage: isFetchingNextPageAnimes,
    isLoading: isLoadingAnimes,
    setSearch: setAnimesSearch,
    setIsActive: setAnimesIsActive,
  } = useAnimesInfinite();

  const [websitesLoaded, setWebsitesLoaded] = useState(false);
  const {
    websites,
    loadMore: loadMoreWebsites,
    isFetchingNextPage: isFetchingNextPageWebsites,
    isLoading: isLoadingWebsites,
  } = useWebsitesInfinite({ limit: 20, enabled: websitesLoaded });

  useEffect(() => {
    setIsActive(activeTab === 'youtube');
    setAnimesIsActive(activeTab === 'anime');
  }, [activeTab, setIsActive, setAnimesIsActive]);

  useEffect(() => {
    if (activeTab === 'website' && !websitesLoaded) {
      setWebsitesLoaded(true);
    }
  }, [activeTab, websitesLoaded]);

  useEffect(() => {
    setChannelsSearch(search);
    setAnimesSearch(search);
  }, [search]);

  const toggleYoutube = useCallback((channel: Channel) => {
    setSelectedYoutubeIds(prev => {
      const next = new Set(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.add(channel.id);
      return next;
    });
    setSelectedYoutubeItems(prev => {
      const next = new Map(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.set(channel.id, { ...channel, contentType: 'youtube', groupId: id });
      return next;
    });
    setSelectionVersion(v => v + 1);
  }, [id]);

  const toggleAnime = useCallback((channel: Channel) => {
    setSelectedAnimeIds(prev => {
      const next = new Set(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.add(channel.id);
      return next;
    });
    setSelectedAnimeItems(prev => {
      const next = new Map(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.set(channel.id, { ...channel, contentType: 'anime', groupId: id });
      return next;
    });
    setSelectionVersion(v => v + 1);
  }, [id]);

  const toggleWebsite = useCallback((channel: Channel) => {
    setSelectedWebsiteIds(prev => {
      const next = new Set(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.add(channel.id);
      return next;
    });
    setSelectedWebsiteItems(prev => {
      const next = new Map(prev);
      if (next.has(channel.id)) next.delete(channel.id);
      else next.set(channel.id, { ...channel, contentType: 'website', groupId: id });
      return next;
    });
    setSelectionVersion(v => v + 1);
  }, [id]);

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    try {
      const channel = await channelsApi.fetchUrl(urlInput.trim());
      setSelectedWebsiteIds(prev => {
        if (prev.has(channel.id)) return prev;
        const next = new Set(prev);
        next.add(channel.id);
        return next;
      });
      setSelectedWebsiteItems(prev => {
        if (prev.has(channel.id)) return prev;
        const next = new Map(prev);
        next.set(channel.id, { ...channel, contentType: 'website', groupId: id });
        return next;
      });
      setUrlInput('');
      setSelectionVersion(v => v + 1);
    } catch {
      Alert.alert('Error', 'Failed to fetch channel from URL.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSave = async () => {
    try {
      const allChannels: Array<{ id: string; name: string; thumbnail?: string; url: string; groupId: string; contentType: string; newContent: boolean }> = [];
      for (const ch of selectedYoutubeItems.values()) allChannels.push({ ...ch, contentType: ch.contentType || 'youtube', newContent: false });
      for (const ch of selectedAnimeItems.values()) allChannels.push({ ...ch, contentType: 'anime', newContent: false });
      for (const ch of selectedWebsiteItems.values()) allChannels.push({ ...ch, contentType: 'website', newContent: false });
      await batchUpdateChannels.mutateAsync({ groupId: id, data: { channels: allChannels } });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save channels');
    }
  };

  const selectedWebsiteArr = useMemo(() => Array.from(selectedWebsiteItems.values()), [selectedWebsiteItems]);

  const mergedWebsites = useMemo(() => {
    const selectedIds = new Set(selectedWebsiteArr.map(w => w.id));
    const result = [...selectedWebsiteArr];
    if (websites) {
      for (const w of websites) {
        if (!selectedIds.has(w.id)) result.push(w);
      }
    }
    return result;
  }, [selectedWebsiteArr, websites]);

  const listData = useMemo(() => {
    switch (activeTab) {
      case 'youtube': return { data: channels || [], loading: isLoading, fetchingNext: isFetchingNextPage };
      case 'anime': return { data: animes || [], loading: isLoadingAnimes, fetchingNext: isFetchingNextPageAnimes };
      case 'website': return { data: mergedWebsites, loading: isLoadingWebsites, fetchingNext: isFetchingNextPageWebsites };
    }
  }, [activeTab, channels, isLoading, isFetchingNextPage, animes, isLoadingAnimes, isFetchingNextPageAnimes, mergedWebsites, isLoadingWebsites, isFetchingNextPageWebsites]);

  const totalSelected = selectedYoutubeIds.size + selectedAnimeIds.size + selectedWebsiteIds.size;
  const isFetchingMore = useRef(false);

  const emptyLabel = activeTab === 'youtube' ? 'channels' : activeTab === 'anime' ? 'animes' : 'websites';

  const renderItem = useCallback(({ item }: { item: Channel }) => {
    const isSelected = activeTab === 'youtube' ? selectedYoutubeIdsRef.current.has(item.id)
      : activeTab === 'anime' ? selectedAnimeIdsRef.current.has(item.id)
      : selectedWebsiteIdsRef.current.has(item.id);

    const toggle = () => {
      if (activeTab === 'youtube') toggleYoutube(item);
      else if (activeTab === 'anime') toggleAnime(item);
      else toggleWebsite(item);
    };

    return (
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} className="flex-row items-center px-3 py-3 mb-2 bg-surface rounded-xl shadow-sm">
        <CheckIcon selected={isSelected} />
        {item.thumbnail || item.imageUrl ? (
          <Image
            source={{ uri: item.thumbnail || item.imageUrl }}
            style={{ width: 44, height: 44, borderRadius: 12, marginLeft: 12 }}
          />
        ) : (
          <View style={{ width: 44, height: 44, borderRadius: 12, marginLeft: 12 }} className="bg-default items-center justify-center">
            <IconifyIcon name={activeTab === 'youtube' ? 'lucide:tv' : activeTab === 'anime' ? 'lucide:film' : 'lucide:globe'} size={20} color={getThemeColor('foreground', isDark)} />
          </View>
        )}
        <View className="ml-3 flex-1 min-w-0">
          <Text className="font-medium text-foreground" numberOfLines={1}>{item.name}</Text>
          {activeTab === 'anime' ? (
            <Text className="text-muted text-xs" numberOfLines={1}>{(item as any).groupName}</Text>
          ) : (
            <Text className="text-muted text-xs" numberOfLines={1}>{item.url}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [activeTab, toggleYoutube, toggleAnime, toggleWebsite, isDark]);

  const handleEndReached = useCallback(() => {
    if (isFetchingMore.current) return;
    isFetchingMore.current = true;
    const loader = activeTab === 'youtube' ? loadMore()
      : activeTab === 'anime' ? loadMoreAnimes()
      : loadMoreWebsites();
    Promise.resolve(loader).finally(() => {
      isFetchingMore.current = false;
    });
  }, [activeTab, loadMore, loadMoreAnimes, loadMoreWebsites]);

  const bgColor = getThemeColor('background', isDark);
  const borderColor = getThemeColor('border', isDark);
  const accentColor = getThemeColor('accent', isDark);
  const surfaceColor = getThemeColor('surface', isDark);
  const foregroundColor = getThemeColor('foreground', isDark);
  const mutedColor = getThemeColor('muted', isDark);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bgColor }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
          <View className="flex-row items-center mb-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1.5 -ml-1 rounded-full" style={{ backgroundColor: surfaceColor }}>
              <IconifyIcon name="lucide:arrow-left" size={20} color={foregroundColor} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Add Channels</Text>
          </View>
          <Text className="text-sm text-muted">{group?.name ? `Add channels to ${group.name}` : 'Select channels to add'}</Text>
        </View>

        <View className="flex-row mx-5 mt-4 mb-3">
          {TABS.map((tab) => {
            const count = tab.key === 'youtube' ? selectedYoutubeIds.size
              : tab.key === 'anime' ? selectedAnimeIds.size
              : selectedWebsiteIds.size;
            return (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} className="flex-1 py-1.5 items-center relative">
                <Text className={`text-sm ${activeTab === tab.key ? 'text-foreground font-semibold' : 'text-muted font-normal'}`}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View className="absolute -top-0.5 right-1.5 min-w-[16px] h-4 px-1 bg-accent/20 rounded-full items-center justify-center">
                    <Text className="text-[10px] text-accent font-bold">{count}</Text>
                  </View>
                )}
                {activeTab === tab.key && <View className="absolute bottom-0 w-8 h-0.5 bg-accent rounded-full" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-5 pb-3">
          {activeTab !== 'website' ? (
            <TextInput
              placeholder="Search channels..."
              placeholderTextColor={mutedColor}
              value={search}
              onChangeText={setSearch}
              style={{
                backgroundColor: surfaceColor,
                color: foregroundColor,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor,
              }}
            />
          ) : (
            <View className="flex-row items-center gap-2">
              <TextInput
                placeholder="Paste website URL..."
                placeholderTextColor={mutedColor}
                value={urlInput}
                onChangeText={setUrlInput}
                onSubmitEditing={handleFetchUrl}
                style={{
                  flex: 1,
                  backgroundColor: surfaceColor,
                  color: foregroundColor,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor,
                }}
              />
              <TouchableOpacity
                onPress={handleFetchUrl}
                disabled={isFetchingUrl || !urlInput.trim()}
                className="bg-accent px-4 py-3 rounded-xl"
                activeOpacity={0.7}
              >
                {isFetchingUrl ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-accent-foreground font-semibold text-sm">Fetch</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-1 px-5 pb-40 py-2">
          <FlatList
            key={activeTab}
            data={listData.data}
            keyExtractor={(item, index) => String(item.id) + index}
            renderItem={renderItem}
            extraData={selectionVersion}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              listData.fetchingNext ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={accentColor} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              listData.loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color={accentColor} />
                </View>
              ) : (
                <View className="py-12 items-center">
                  <IconifyIcon name="lucide:search-x" size={40} className="text-muted mb-3" />
                  <Text className="text-muted text-center font-medium">No {emptyLabel} found</Text>
                </View>
              )
            }
          />
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom, borderColor }} className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-background border-t">
        <Button onPress={handleSave} fullWidth loading={batchUpdateChannels.isPending}>
          {batchUpdateChannels.isPending ? 'Saving...' : `Add Selected (${totalSelected})`}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
