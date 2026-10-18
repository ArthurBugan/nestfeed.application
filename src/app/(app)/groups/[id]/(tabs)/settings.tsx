import { Alert, Text, View } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroup, useDeleteGroup } from '@/hooks';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Button } from '@/components/ui/Button';
import { tap } from '@/theme/haptics';
import { Toast } from '@/components/ui/Toast';

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const deleteGroup = useDeleteGroup();

  const handleDelete = () => {
    tap();
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup.mutateAsync(id);
              Toast.success('Group deleted');
              router.replace('/groups');
            } catch {
              Toast.error('Failed to delete group');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <ScreenHeader title="Group Settings" subtitle={group?.name} className="pt-2" />

      <ListGroup className="mt-4">
        <ListRow
          icon="lucide:pencil"
          title="Edit Group"
          subtitle="Name, icon, description and category"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/edit`);
          }}
        />
        <ListRow
          icon="lucide:share-2"
          title="Share Group"
          subtitle="Invite others with a link"
          onPress={() => {
            tap();
            router.push(`/groups/${id}/share`);
          }}
        />
      </ListGroup>

      <ListGroup className="mt-6">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-danger uppercase tracking-wider">
            Danger Zone
          </Text>
        </View>
        <ListRow
          icon="lucide:trash-2"
          iconTint="danger"
          title="Delete Group"
          subtitle="This action cannot be undone"
          chevron={false}
          onPress={handleDelete}
        />
      </ListGroup>

      <View className="flex-1" />
      <Button
        label="Delete Group"
        variant="danger"
        icon="lucide:trash-2"
        fullWidth
        onPress={handleDelete}
        className="mb-6"
      />
    </Screen>
  );
}
