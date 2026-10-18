import { View, Text } from 'react-native';
import { Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useChannel, useGroups, useUpdateChannel } from '@/hooks';
import { IconifyIcon } from '@/components/IconifyIcon';
import AdMobManager from '@/components/Admob';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';

export default function ChangeChannelGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: channel, isLoading } = useChannel(id);
  const { data: groupsData } = useGroups({ limit: 100 });
  const [selectedGroupId, setSelectedGroupId] = useState(channel?.data?.groupId || '');
  const updateChannel = useUpdateChannel();

  const handleSave = async () => {
    await updateChannel.mutateAsync({
      id,
      data: { id, name: channel?.data?.name || '', url: channel?.data?.url || '', groupId: selectedGroupId },
    });
    await AdMobManager.loadRewardedAd();
    router.back();
  };

  const getGroupIcon = (icon?: string) => {
    if (icon) return icon;
    return 'lucide:folder';
  };

  return (
    <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Change Group" className="pt-2" />

      {channel?.data?.groupName && (
        <View className="flex-row items-center gap-2 mt-3 mb-4">
          <Text className="text-muted">Current group:</Text>
          <View className="flex-row items-center gap-2 bg-default px-3 py-1 rounded-lg">
            <IconifyIcon name={getGroupIcon(channel?.data?.groupIcon)} size={14} />
            <Text className="text-foreground text-sm">{channel.data.groupName}</Text>
          </View>
        </View>
      )}

      <Card className="mb-6">
        <View className="flex-row items-center gap-3">
          {channel?.data?.thumbnail || channel?.data?.imageUrl ? (
            <Image source={{ uri: channel?.data?.thumbnail || channel?.data?.imageUrl }} style={{ width: 64, height: 64, borderRadius: 12 }} />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-default items-center justify-center">
              <IconifyIcon name="lucide:tv" size={24} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{channel?.data?.name}</Text>
            {channel?.data?.description && (
              <Text className="text-sm text-muted" numberOfLines={2}>
                {channel.description}
              </Text>
            )}
          </View>
        </View>
      </Card>

      <Text className="text-muted mb-3">Select a group</Text>

      {groupsData?.data.map((group) => (
        <PressableScale
          key={group.id}
          className={`flex-row items-center gap-3 bg-surface rounded-card p-4 mb-2 ${
            selectedGroupId === group.id ? 'border-2 border-accent' : ''
          }`}
          onPress={() => setSelectedGroupId(group.id)}
          accessible
          accessibilityRole="button"
          accessibilityState={{ selected: selectedGroupId === group.id }}
          accessibilityLabel={`Group: ${group.name}`}
        >
          <View className="w-10 h-10 rounded-lg bg-default items-center justify-center">
            <IconifyIcon name={getGroupIcon(group.icon)} size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-foreground">{group.name}</Text>
            {group.description && (
              <Text className="text-sm text-muted" numberOfLines={1}>
                {group.description}
              </Text>
            )}
          </View>
          {selectedGroupId === group.id && (
            <IconifyIcon name="mdi:check-circle" size={24} className="text-accent" />
          )}
        </PressableScale>
      ))}

      <Button label="Save" fullWidth className="mt-4" onPress={handleSave} />
    </Screen>
  );
}
