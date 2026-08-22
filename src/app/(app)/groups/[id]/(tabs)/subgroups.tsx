import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroupSubgroups } from '@/hooks';
import { Button } from 'heroui-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { FlashList } from '@shopify/flash-list';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

export default function GroupSubgroupsScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: subgroupsData } = useGroupSubgroups(id);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const childGroups = subgroupsData || [];

  const renderItem = ({ item }: { item: typeof childGroups[0] }) => (
    <TouchableOpacity
      className="flex-row items-center bg-surface rounded-xl p-4 mb-2 border border-border/50"
      onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${item.id}`); }}
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
        <IconifyIcon name={item.icon || 'lucide:folder'} size={20} color={getThemeColor('foreground', isDark)} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-foreground font-semibold">{item.name}</Text>
      </View>
      <IconifyIcon name="lucide:chevron-right" size={20} color={getThemeColor('muted', isDark)} />
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background" showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3 border-b" style={{ borderColor: getThemeColor('border', isDark) }}>
          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); router.back(); }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getThemeColor('surface', isDark) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground ml-3">Subgroups</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-muted">{childGroups.length} subgroup{childGroups.length !== 1 ? 's' : ''}</Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 mb-5"
            onPress={() => { Haptics.selectionAsync(); router.push(`/groups/new?parentId=${id}`); }}
            activeOpacity={0.7}
          >
            <IconifyIcon name="lucide:plus" size={18} color={getThemeColor('accent', isDark)} />
            <Text className="text-accent font-semibold text-sm">Add Subgroup</Text>
          </TouchableOpacity>

          {childGroups.length === 0 ? (
            <View className="py-12 items-center">
              <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                <IconifyIcon name="lucide:folder-open" size={32} color={getThemeColor('muted', isDark)} />
              </View>
              <Text className="text-muted text-center font-medium">No subgroups yet</Text>
              <Text className="text-xs text-muted text-center mt-1">Create one to organize your content</Text>
            </View>
          ) : (
            <FlashList
              data={childGroups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 16 }}
              estimatedItemSize={60}
            />
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
