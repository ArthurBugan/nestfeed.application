import { View, Text, Image, Linking, Alert, Share } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroup } from '@/hooks';

import { IconifyIcon } from '@/components/IconifyIcon';
import { LoadingState } from '@/components/states';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { IconButton, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { tap } from '@/theme/haptics';

export default function GroupOverviewScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);

  const getGroupIcon = (icon?: string) => {
    if (icon) return icon;
    return 'lucide:folder';
  };

  const handleShare = async () => {
    tap();
    try {
      await Share.share({
        message: `Check out this group: ${group?.name}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleDelete = () => {
    tap();
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
      tap();
      router.push(`/groups/${item.id}`);
    }
  };

  if (!group) {
    return (
      <Screen className="items-center justify-center">
        <LoadingState label="Loading group" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} scroll contentContainerStyle={{ paddingBottom: 8 }}>
      <ScreenHeader
        title={group.name}
        size="compact"
        className="pt-4 pb-3 border-b border-border"
        right={
          <IconButton
            name="lucide:share-2"
            label={`Share ${group?.name || 'group'}`}
            size={44}
            onPress={handleShare}
          />
        }
      />

      {/* Group Header */}
      <View className="flex-row items-start gap-4 mt-5 mb-5">
        <View className="w-16 h-16 rounded-2xl items-center justify-center bg-accent">
          <IconifyIcon name={getGroupIcon(group.icon)} size={32} className="text-accent-foreground" />
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
        <Card className="mb-5">
          <Text className="text-muted text-sm leading-relaxed">{group.description}</Text>
        </Card>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-6">
        <Button
          label="Add Channel"
          icon="lucide:plus"
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/add-channel`);
          }}
        />
        <Button
          label="Edit"
          icon="lucide:pencil"
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/edit`);
          }}
        />
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
              <ListRow
                key={channel.id}
                title={channel.name}
                subtitle={channel.description || undefined}
                accessibilityLabel={`Channel: ${channel.name}`}
                className="shadow-sm"
                onPress={() => handleItemPress(channel)}
                leading={
                  channel.thumbnail || channel.imageUrl ? (
                    <Image
                      source={{ uri: channel.thumbnail || channel.imageUrl }}
                      className="w-11 h-11 rounded-xl"
                    />
                  ) : (
                    <View className="w-11 h-11 rounded-xl items-center justify-center bg-default">
                      <IconifyIcon name="lucide:tv" size={20} className="text-foreground" />
                    </View>
                  )
                }
              />
            ))}
          </View>
        </View>
      )}

      {/* Bottom actions */}
      <View className="pb-6 gap-3">
        <Button
          label="Edit Group"
          icon="lucide:pencil"
          variant="outline"
          fullWidth
          accessibilityLabel="Edit Group"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/edit`);
          }}
        />
        <Button
          label="Share Group"
          icon="lucide:share-2"
          variant="outline"
          fullWidth
          accessibilityLabel="Share Group"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/share`);
          }}
        />
        <Button
          label="Delete Group"
          icon="lucide:trash-2"
          variant="danger"
          fullWidth
          accessibilityLabel="Delete Group"
          onPress={handleDelete}
        />
      </View>
    </Screen>
  );
}
