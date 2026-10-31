import { View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useGroupsInfinite } from '@/hooks/useGroupsInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import type { Group } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useState, useMemo, useCallback } from 'react';
import { InlineAd } from '@/components/Admob';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { getThemeColor } from '@/theme/themeColors';
import { tap } from '@/theme/haptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SearchField } from '@/components/ui/SearchField';
import { ListRow } from '@/components/ui/ListRow';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { DetailPane } from '@/components/ui/DetailPane';
import { useTwoPane } from '@/hooks/useTwoPane';
import { FlashList } from '@shopify/flash-list';

interface GroupWithChildren extends Group {
  children?: GroupWithChildren[];
}

type ListItem = GroupWithChildren | { isAd: true; id: string };

/** Nested-group indent scale — literal classes so the CSS compiler emits them. */
const INDENT_CLASSES = ['ml-4', 'ml-8', 'ml-12', 'ml-16', 'ml-20'] as const;

export default function GroupsListScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  /** Spec 008 FR-A2: wide windows (iPad) show the tapped group inline. */
  const isWide = useTwoPane();
  const [selectedGroup, setSelectedGroup] = useState<GroupWithChildren | null>(null);

  const {
    groups,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMore,
    search,
    setSearch,
    refetch,
    setIsActive,
  } = useGroupsInfinite({ limit: 30 });

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [setIsActive])
  );

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const toggleExpand = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else newSet.add(groupId);
      return newSet;
    });
  }, []);

  const groupedGroups = useMemo<ListItem[]>(() => {
    const groupMap = new Map<string, GroupWithChildren>();
    const rootGroups: GroupWithChildren[] = [];

    groups.forEach(group => {
      groupMap.set(group.id, { ...group, children: [] });
    });

    groups.forEach(group => {
      const gwc = groupMap.get(group.id)!;
      if (group.parentId && groupMap.has(group.parentId)) {
        groupMap.get(group.parentId)!.children!.push(gwc);
      } else {
        rootGroups.push(gwc);
      }
    });

    // Flatten: root groups followed by their expanded children
    const flatten = (items: GroupWithChildren[], depth: number = 0): ListItem[] => {
      const result: ListItem[] = [];
      items.forEach((g, index) => {
        result.push({ ...g, _depth: depth } as any);
        if ((index + 1) % 5 === 0 && depth === 0) {
          result.push({ isAd: true, id: `ad-${g.id}` });
        }
        if (expandedGroups.has(g.id) && g.children && g.children.length > 0) {
          result.push(...flatten(g.children, depth + 1));
        }
      });
      return result;
    };

    return flatten(rootGroups);
  }, [groups, expandedGroups]);

  const renderGroup = useCallback(({ item }: { item: any }) => {
    if ('isAd' in item) return <InlineAd />;
    const group = item as GroupWithChildren & { _depth: number };
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedGroups.has(group.id);

    return (
      <ListRow
        className={`${INDENT_CLASSES[Math.min(group._depth, INDENT_CLASSES.length - 1)]} mr-4 mb-2`}
        icon={group.icon || 'lucide:folder'}
        title={group.name}
        subtitle={group.description || undefined}
        chevron={false}
        onPress={() =>
          isWide
            ? setSelectedGroup(group)
            : router.push(`/groups/${group.id}`)
        }
        accessibilityLabel={`Group: ${group.name}`}
        trailing={
          hasChildren ? (
            <PressableScale
              onPress={() => toggleExpand(group.id)}
              className="w-11 h-11 rounded-lg items-center justify-center bg-default"
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${group.name}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <IconifyIcon
                name={isExpanded ? 'lucide:folder-open' : 'lucide:folder'}
                size={18}
                color={getThemeColor('muted', isDark)}
              />
            </PressableScale>
          ) : undefined
        }
      />
    );
  }, [isDark, router, expandedGroups, toggleExpand, isWide]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={getThemeColor('accent', isDark)} />
      </View>
    );
  }, [isFetchingNextPage, isDark]);

  const renderSkeleton = () => <LoadingState variant="skeleton" rows={5} label="Loading groups" />;

  const headerComponent = (
    <View className="px-4">
      <View className="pt-4 pb-2">
        <ScreenHeader
          title="Groups"
          leading="none"
          right={
            <Button
              label="+ New"
              size="md"
              onPress={() => router.push('/groups/new')}
              accessibilityLabel="+ New"
            />
          }
        />
      </View>
      <View className="mb-4">
        <SearchField
          placeholder="Search groups..."
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

  if (isError && groups.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading && groups.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top }}>
          {headerComponent}
        </View>
        {renderSkeleton()}
      </View>
    );
  }

  const list = (
    <FlashList
      refreshControl={refreshControl}
      ListHeaderComponent={headerComponent}
      data={groupedGroups}
      renderItem={renderGroup}
      keyExtractor={(item, index) => item.id + index}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 16 }}
      ListEmptyComponent={
        <EmptyState
          icon="lucide:folder-open"
          title="No groups yet"
          description="Create one to get started!"
          actionLabel="+ New Group"
          onAction={() => router.push('/groups/new')}
        />
      }
    />
  );

  if (isWide) {
    return (
      <View className="flex-1 bg-background flex-row">
        <View className="w-[42%] border-r border-border">
          {list}
        </View>
        <View className="flex-1 p-4" style={{ paddingTop: insets.top + 16 }}>
          <DetailPane
            selected={!!selectedGroup}
            placeholder="Select a group to see its overview here"
          >
            {selectedGroup ? <GroupOverview group={selectedGroup} onOpen={() => router.push(`/groups/${selectedGroup.id}`)} /> : null}
          </DetailPane>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {list}
    </View>
  );
}

/** Inline right-pane overview for the selected group (spec 008 FR-A2). */
function GroupOverview({ group, onOpen }: { group: GroupWithChildren; onOpen: () => void }) {
  const { isDark } = useTheme();

  return (
    <View className="p-6 items-start gap-4">
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center"
        style={{ backgroundColor: getThemeColor('accent-soft', isDark) }}
      >
        <IconifyIcon
          name={group.icon || 'lucide:folder'}
          size={40}
          color={getThemeColor('accent', isDark)}
        />
      </View>
      <Text className="text-xl font-bold text-foreground" maxFontSizeMultiplier={1.4}>
        {group.name}
      </Text>
      {group.description ? (
        <Text className="text-base text-muted">{group.description}</Text>
      ) : null}
      {group.children && group.children.length > 0 ? (
        <Text className="text-sm text-muted">
          {group.children.length} subgroup{group.children.length === 1 ? '' : 's'}
        </Text>
      ) : null}
      <Button label="Open group" size="lg" onPress={onOpen} />
    </View>
  );
}
