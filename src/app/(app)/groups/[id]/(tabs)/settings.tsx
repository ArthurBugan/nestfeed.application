import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroup, useDeleteGroup } from '@/hooks';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const deleteGroup = useDeleteGroup();
  const { isDark } = useTheme();

  const handleDelete = () => {
    Haptics.selectionAsync();
    Alert.alert('Delete Group', `Are you sure you want to delete "${group?.name}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroup.mutateAsync(id);
            router.replace('/groups');
          } catch {
            Alert.alert('Error', 'Failed to delete group');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: getThemeColor('border', isDark) }}>
          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); router.back(); }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getThemeColor('surface', isDark) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Settings</Text>
          <View className="w-10" />
        </View>

        <View className="px-5 pt-6 pb-6">
          {/* Management Section */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50 flex-1">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Management</Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5"
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/edit`); }}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                <IconifyIcon name="lucide:pencil" size={18} color={getThemeColor('foreground', isDark)} />
              </View>
              <Text className="flex-1 text-base font-medium text-foreground">Edit Group</Text>
              <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
            </TouchableOpacity>
            <View className="h-px mx-4" style={{ backgroundColor: getThemeColor('separator', isDark) }} />
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5"
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/share`); }}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                <IconifyIcon name="lucide:share-2" size={18} color={getThemeColor('foreground', isDark)} />
              </View>
              <Text className="flex-1 text-base font-medium text-foreground">Share Group</Text>
              <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View className="bg-surface rounded-2xl overflow-hidden border border-danger/20">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-danger uppercase tracking-wider">Danger Zone</Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5"
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-danger/10">
                <IconifyIcon name="lucide:trash-2" size={18} color={getThemeColor('danger', isDark)} />
              </View>
              <Text className="flex-1 text-base font-medium text-danger">Delete Group</Text>
              <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('danger', isDark)} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}
