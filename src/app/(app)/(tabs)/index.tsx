import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboard } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useState, useCallback } from 'react';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

const shortcuts = [
  { label: 'Groups', count: 'groups', route: '/groups', icon: 'lucide:folder', gradient: 'from-rose-400/80 to-pink-500/80' },
  { label: 'Channels', count: 'channels', route: '/channels', icon: 'lucide:tv', gradient: 'from-violet-400/80 to-purple-500/80' },
  { label: 'Animes', count: 'animeChannels', route: '/animes', icon: 'lucide:film', gradient: 'from-amber-400/80 to-orange-500/80' },
  { label: 'Websites', count: 'websites', route: '/websites', icon: 'lucide:globe', gradient: 'from-emerald-400/80 to-teal-500/80' },
  { label: 'Group Shelf', count: null, route: '/groupshelf', icon: 'lucide:library', gradient: 'from-sky-400/80 to-cyan-500/80' },
  { label: 'Share Links', count: null, route: '/share-links', icon: 'lucide:link-2', gradient: 'from-indigo-400/80 to-blue-500/80' },
];

const actions = [
  { label: 'New Group', route: '/groups/new', icon: 'lucide:plus-circle' },
  { label: 'Add Channel', route: '/channels', icon: 'lucide:tv-minimal-play' },
  { label: 'Add Anime', route: '/animes', icon: 'lucide:clapperboard' },
  { label: 'Settings', route: '/settings', icon: 'lucide:settings' },
  { label: 'Blog', route: '/blog', icon: 'lucide:newspaper' },
];

export default function DashboardHomeScreen() {
  const router = useRouter();
  const { data: dashboard, isLoading } = useDashboard();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const getCount = (key: string | null) => {
    if (!key) return '';
    if (isLoading) return '—';
    return dashboard?.[key as keyof typeof dashboard] ?? 0;
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-background"
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
      <View style={{ paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
          <Text className="text-base text-muted mt-1">Your content at a glance</Text>
        </View>

        {/* Shortcut cards */}
        <View className="px-5 pb-8">
          <View className="flex-row flex-wrap justify-between">
            {shortcuts.map((s) => (
              <TouchableOpacity
                key={s.label}
                className={`w-[48%] rounded-2xl p-4 bg-gradient-to-br ${s.gradient} mb-3`}
                onPress={() => { Haptics.selectionAsync(); router.push(s.route); }}
                activeOpacity={0.7}
              >
                <IconifyIcon name={s.icon} size={22} color="rgba(255,255,255,0.85)" />
                {s.count ? (
                  <>
                    <Text className="text-2xl font-bold text-white mt-3">{getCount(s.count)}</Text>
                    <Text className="text-sm text-white/70 mt-0.5">{s.label}</Text>
                  </>
                ) : (
                  <Text className="text-base font-semibold text-white mt-3">{s.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <View className="px-5">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {actions.map((a) => (
              <TouchableOpacity
                key={a.label}
                className="flex-row items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3"
                onPress={() => { Haptics.selectionAsync(); router.push(a.route); }}
                activeOpacity={0.7}
              >
                <IconifyIcon name={a.icon} size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-sm font-medium text-foreground">{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
