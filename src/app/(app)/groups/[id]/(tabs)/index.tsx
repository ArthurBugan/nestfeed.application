import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroup } from '@/hooks';
import { Card, Button } from 'heroui-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';

export default function GroupOverviewScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const { isDark } = useTheme();

  const getGroupIcon = (icon?: string) => {
    if (icon) return icon;
    return 'lucide:folder';
  };

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        message: `Check out this group: ${group?.name}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleDelete = () => {
    Haptics.selectionAsync();
    Alert.alert('Delete Group', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // TODO: call delete API
          router.replace('/groups');
        },
      },
    ]);
  };

  const handleItemPress = (item: any) => {
    if (item.url) {
      Linking.openURL(item.url).catch((error) => {
        console.error('Failed to open URL:', error);
      });
      return;
    }
    if (item.id) {
      Haptics.selectionAsync();
      router.push(`/groups/${item.id}`);
    }
  };

  if (!group) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background" showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
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
          <Text className="text-lg font-semibold text-foreground">{group.name}</Text>
          <TouchableOpacity 
            onPress={handleShare}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getThemeColor('surface', isDark) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconifyIcon name="lucide:share-2" size={18} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5 pb-4">
          {/* Group Header */}
          <View className="flex-row items-start gap-4 mb-5">
            <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: getThemeColor('accent', isDark) }}>
              <IconifyIcon name={getGroupIcon(group.icon)} size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{group.name}</Text>
              {group.category && (
                <View className="mt-2">
                  <View className="bg-accent/10 px-3 py-1 rounded-lg self-start">
                    <Text className="text-xs font-medium text-accent">{group.category}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {group.description && (
            <Card className="mb-5 rounded-xl">
                <Text className="text-muted text-sm leading-relaxed">{group.description}</Text>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Button
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/add-channel`); }}
              className="flex-1"
              variant='outline'
            >
              <View className='flex-row justify-center items-center gap-2'>
                <IconifyIcon name="lucide:plus" size={18} />
                <Text className="text-sm text-foreground font-semibold">Add Channel</Text>
              </View>
            </Button>
            <Button
              variant="outline"
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/edit`); }}
              className="flex-1"
            >
              <View className='flex-row justify-center items-center gap-2'>
                <IconifyIcon name="lucide:pencil" size={18} />
                <Text className="text-sm text-foreground font-semibold">Edit</Text>
              </View>
            </Button>
          </View>

          {/* Channels */}
          {group.channels && group.channels.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-foreground">
                  Channels ({group.channels.length})
                </Text>
              </View>
              <View className="gap-2">
                {group.channels.map((channel) => (
                  <TouchableOpacity
                    key={channel.id}
                    className="flex-row items-center gap-3 bg-surface p-3 rounded-xl"
                    onPress={() => handleItemPress(channel)}
                    activeOpacity={0.7}
                  >
                    {channel.thumbnail || channel.imageUrl ? (
                      <Image
                        source={{ uri: channel.thumbnail || channel.imageUrl }}
                        className="w-11 h-11 rounded-xl"
                      />
                    ) : (
                      <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                        <IconifyIcon name="lucide:tv" size={20} color={getThemeColor('foreground', isDark)} />
                      </View>
                    )}
                    <View className="flex-1 min-w-0">
                      <Text className="text-foreground font-medium" numberOfLines={1}>{channel.name}</Text>
                      {channel.description && (
                        <Text className="text-muted text-xs" numberOfLines={1}>{channel.description}</Text>
                      )}
                    </View>
                    <IconifyIcon name="lucide:chevron-right" size={16} color={getThemeColor('muted', isDark)} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bottom actions */}
          <View className="pb-6 gap-3">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5"
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/edit`); }}
              activeOpacity={0.7}
            >
              <IconifyIcon name="lucide:pencil" size={18} color={getThemeColor('foreground', isDark)} />
              <Text className="text-foreground font-medium">Edit Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5"
              onPress={() => { Haptics.selectionAsync(); router.push(`/groups/${id}/share`); }}
              activeOpacity={0.7}
            >
              <IconifyIcon name="lucide:share-2" size={18} color={getThemeColor('foreground', isDark)} />
              <Text className="text-foreground font-medium">Share Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 bg-danger/10 border border-danger/20 rounded-xl py-3.5"
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <IconifyIcon name="lucide:trash-2" size={18} color={getThemeColor('danger', isDark)} />
              <Text className="text-danger font-medium">Delete Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
