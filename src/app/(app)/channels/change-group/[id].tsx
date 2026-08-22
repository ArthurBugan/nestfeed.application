import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useChannel, useGroups, useUpdateChannel } from '@/hooks';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import AdMobManager from '@/components/Admob';

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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background p-4">
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <Text className="text-accent">← Back</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-bold text-foreground mb-4">Change Group</Text>

        {channel?.data?.groupName && (
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-muted">Current group:</Text>
            <View className="flex-row items-center gap-2 bg-default px-3 py-1 rounded-lg">
              <IconifyIcon name={getGroupIcon(channel?.data?.groupIcon)} size={14} />
              <Text className="text-foreground text-sm">{channel.data.groupName}</Text>
            </View>
          </View>
        )}

        <View className="flex-row items-center gap-3 bg-surface rounded-xl p-4 mb-6">
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

        <Text className="text-muted mb-3">Select a group</Text>

        {groupsData?.data.map((group) => (
          <TouchableOpacity
            key={group.id}
            className={`flex-row items-center gap-3 bg-surface rounded-xl p-4 mb-2 ${selectedGroupId === group.id ? 'border-2 border-primary' : ''}`}
            onPress={() => setSelectedGroupId(group.id)}
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
              <IconifyIcon name="mdi:check-circle" size={24} color="color-primary" />
            )}
          </TouchableOpacity>
        ))}

        <Button onPress={handleSave} fullWidth className="mt-4">
          Save
        </Button>
      </SafeAreaView>
    </ScrollView>
  );
}