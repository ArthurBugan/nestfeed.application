import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useCallback, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAnimesInfinite } from '@/hooks/useAnimesInfinite';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { shadows } from '@/theme/colors';
import { tap } from '@/theme/haptics';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Chip } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import type { ThemeColorKey } from '@/theme/themeColors';
import type { Anime } from '@/types';
import { formatCount, latestAnimes } from './dashboardUtils';

type Tint = 'accent' | 'teal' | 'lime' | 'success' | 'warning' | 'rose';

interface Shortcut {
  label: string;
  icon: string;
  route: string;
  count?: number | null;
  tint: Tint;
}

const TINT_SOFT: Record<Tint, ThemeColorKey> = {
  accent: 'accent-soft',
  teal: 'teal-soft',
  lime: 'lime-soft',
  success: 'success-soft',
  warning: 'warning-soft',
  rose: 'danger-soft',
};

const TINT_ICON: Record<Tint, ThemeColorKey> = {
  accent: 'accent',
  teal: 'teal',
  lime: 'lime',
  success: 'success',
  warning: 'warning',
  rose: 'danger',
};

export default function DashboardHome() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: dashboard, refetch } = useDashboard();
  const { animes, isLoading: animeLoading, setIsActive } = useAnimesInfinite({ limit: 5 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [setIsActive])
  );

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await Promise.all([refetch()]);
    setIsRefreshing(false);
  }, [refetch]);

  const shortcuts: Shortcut[] = useMemo(
    () => [
      { label: 'Groups', icon: 'lucide:folder', route: '/groups', count: dashboard?.groups ?? null, tint: 'accent' },
      { label: 'Channels', icon: 'lucide:tv', route: '/channels', count: dashboard?.channels ?? null, tint: 'teal' },
      { label: 'Animes', icon: 'lucide:film', route: '/animes', count: dashboard?.animes ?? null, tint: 'lime' },
      { label: 'Websites', icon: 'lucide:link', route: '/websites', count: dashboard?.websites ?? null, tint: 'success' },
      { label: 'Group Shelf', icon: 'lucide:layers', route: '/groupshelf', count: null, tint: 'warning' },
      { label: 'Share Links', icon: 'lucide:share-2', route: '/share-links', count: null, tint: 'rose' },
    ],
    [dashboard]
  );

  const recentAnimes = useMemo(() => latestAnimes(animes, 3), [animes]);

  const actions = useMemo(
    () => [
      { label: 'New Group', icon: 'lucide:folder-plus', route: '/groups/new' },
      { label: 'Channels', icon: 'lucide:tv', route: '/channels' },
      { label: 'Animes', icon: 'lucide:film', route: '/animes' },
      { label: 'Websites', icon: 'lucide:globe', route: '/websites' },
      { label: 'Import', icon: 'lucide:youtube', route: '/import-youtube' },
    ],
    []
  );

  const renderAnimeRow = useCallback(
    ({ item }: { item: Anime }) => {
      const hasThumbnail = !!(item.thumbnail || item.imageUrl);
      return (
        <ListRow
          className="mb-2"
          leading={
            hasThumbnail ? (
              <Image
                source={{ uri: item.thumbnail || item.imageUrl }}
                style={{ width: 44, height: 44, borderRadius: 12 }}
              />
            ) : undefined
          }
          icon={hasThumbnail ? undefined : 'lucide:film'}
          iconTint="accent"
          title={item.name}
          subtitle={item.groupName ? `In ${item.groupName}` : item.description || undefined}
          chevron
          onPress={() => router.push(`/animes/change-group/${item.id}`)}
          accessibilityLabel={`Anime: ${item.name}`}
        />
      );
    },
    [router]
  );

  return (
    <Screen scroll refreshing={isRefreshing} onRefresh={handleRefresh} padded={false} edges={['bottom']}>
      <View
        style={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: 16,
        }}
        className="px-5"
      >
        <View className="pt-4">
          <ScreenHeader
            title="Dashboard"
            subtitle="Your content at a glance"
            leading="none"
          />
        </View>

        {/* Shortcut bento grid (P7) — 2 columns, no off-palette gradients */}
        <View className="mt-4">
          <View className="flex-row flex-wrap justify-between gap-x-3">
            {shortcuts.map((s) => (
              <PressableScale
                key={s.label}
                className="w-[48%] rounded-2xl p-4 bg-surface border border-border"
                style={shadows.md}
                onPress={() => router.push(s.route)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  s.count != null
                    ? `${s.label}, ${formatCount(s.count)} items. Opens ${s.label}.`
                    : `Opens ${s.label}.`
                }
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: getThemeColor(TINT_SOFT[s.tint], isDark) }}
                >
                  <IconifyIcon
                    name={s.icon}
                    size={20}
                    color={getThemeColor(TINT_ICON[s.tint], isDark)}
                  />
                </View>
                <Text className="text-2xl font-bold text-foreground mt-3">
                  {formatCount(s.count)}
                </Text>
                <Text className="text-sm text-muted mt-0.5">{s.label}</Text>
              </PressableScale>
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {actions.map((a) => (
              <Chip
                key={a.label}
                label={a.label}
                icon={a.icon}
                onPress={() => router.push(a.route)}
              />
            ))}
          </View>
        </View>

        {/* Recently added content */}
        {recentAnimes.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-muted uppercase tracking-wider">
                Recently Added
              </Text>
              <PressableScale
                onPress={() => router.push('/animes')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="See all animes"
              >
                <Text className="text-sm font-medium" style={{ color: getThemeColor('accent', isDark) }}>
                  See all
                </Text>
              </PressableScale>
            </View>
            {animeLoading && recentAnimes.length === 0 ? (
              <View className="py-6 items-center">
                <ActivityIndicator color={getThemeColor('accent', isDark)} />
              </View>
            ) : (
              <View>
                {recentAnimes.map((item) => (
                  <View key={item.id}>
                    {renderAnimeRow({ item })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}
