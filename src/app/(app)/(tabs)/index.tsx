import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboard } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { ErrorState } from '@/components/states';
import { useState, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { getThemeColor } from '@/theme/themeColors';
import { shadows } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { tap } from '@/theme/haptics';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Chip } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';

/** Brand-true tile tints (spec 005, P8) — tokens only, no off-palette gradients. */
type ShortcutTint = 'accent' | 'teal' | 'success' | 'lime' | 'warning' | 'rose';

interface Shortcut {
  label: string;
  count: string | null;
  route: string;
  icon: string;
  tint: ShortcutTint;
}

const shortcuts: Shortcut[] = [
  { label: 'Groups', count: 'groups', route: '/groups', icon: 'lucide:folder', tint: 'accent' },
  { label: 'Channels', count: 'channels', route: '/channels', icon: 'lucide:tv', tint: 'teal' },
  { label: 'Animes', count: 'animeChannels', route: '/animes', icon: 'lucide:film', tint: 'warning' },
  { label: 'Websites', count: 'websites', route: '/websites', icon: 'lucide:globe', tint: 'lime' },
  { label: 'Group Shelf', count: null, route: '/groupshelf', icon: 'lucide:library', tint: 'success' },
  { label: 'Share Links', count: null, route: '/share-links', icon: 'lucide:link-2', tint: 'rose' },
];

const actions = [
  { label: 'New Group', route: '/groups/new', icon: 'lucide:plus-circle' },
  { label: 'Add Channel', route: '/channels', icon: 'lucide:tv-minimal-play' },
  { label: 'Add Anime', route: '/animes', icon: 'lucide:clapperboard' },
  { label: 'Import', route: '/import-youtube', icon: 'lucide:youtube' },
  { label: 'Settings', route: '/settings', icon: 'lucide:settings' },
  { label: 'Blog', route: '/blog', icon: 'lucide:newspaper' },
];

export default function DashboardHomeScreen() {
  const router = useRouter();
  const { data: dashboard, isLoading, isError, refetch } = useDashboard();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  /** Spec 008 FR-A1: accessibility content sizes stack the bento in one
   *  column — two-up cards would force mid-word breaks at 200%+. */
  const stacked = useWindowDimensions().fontScale >= 1.35;

  const handleRefresh = useCallback(async () => {
    tap();
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const getCount = (key: string | null) => {
    if (!key) return '';
    if (isLoading) return '—';
    return dashboard?.[key as keyof typeof dashboard] ?? 0;
  };

  /** Saturated icon color for each tint chip (native prop → token color). */
  const tintForeground: Record<ShortcutTint, string> = {
    accent: getThemeColor('accent', isDark),
    teal: getThemeColor('teal', isDark),
    success: getThemeColor('success', isDark),
    lime: getThemeColor('lime', isDark),
    warning: getThemeColor('warning', isDark),
    rose: getThemeColor('danger', isDark),
  };

  return (
    <Screen scroll refreshing={isRefreshing} onRefresh={handleRefresh} padded={false} edges={['top']}>
      <View style={{ paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <ScreenHeader
            title="Dashboard"
            subtitle="Your content at a glance"
            leading="none"
          />
        </View>

        {/* Shortcut bento grid (P7) */}
        {isError && !dashboard ? (
          <View className="px-5 pb-8">
            <ErrorState
              title="Couldn't load your dashboard"
              onRetry={() => refetch()}
            />
          </View>
        ) : (
          <View className="px-5 pb-8">
            <View className={stacked ? 'gap-3' : 'flex-row flex-wrap justify-between'}>
            {shortcuts.map((s) => (
              <PressableScale
                key={s.label}
                className={`rounded-3xl p-4 mb-3 bg-surface border border-border ${
                  stacked ? '' : 'w-[48%]'
                }`}
                style={shadows.md}
                onPress={() => router.push(s.route)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  s.count
                    ? `${s.label}, ${getCount(s.count)} items. Opens ${s.label}.`
                    : `Opens ${s.label}.`
                }
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: getThemeColor(`${s.tint === 'rose' ? 'danger' : s.tint}-soft`, isDark) }}
                >
                  <IconifyIcon name={s.icon} size={20} color={tintForeground[s.tint]} />
                </View>
                {s.count ? (
                  <>
                    <Text className="text-2xl font-bold text-foreground mt-3">{getCount(s.count)}</Text>
                    <Text className="text-sm text-muted mt-0.5">{s.label}</Text>
                  </>
                ) : (
                  <Text className="text-base font-semibold text-foreground mt-3">{s.label}</Text>
                )}
              </PressableScale>
            ))}
            </View>
          </View>
        )}

        {/* Quick actions */}
        <View className="px-5">
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
      </View>
    </Screen>
  );
}
