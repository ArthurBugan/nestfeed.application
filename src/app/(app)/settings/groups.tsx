import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ListGroup, ListRow } from '@/components/ui/ListRow';

export default function GroupsSettingsScreen() {
  const router = useRouter();

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Groups" className="pt-4" />

      <ListGroup className="mt-4">
        <View className="px-1 pb-1">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider">
            Manage Groups
          </Text>
        </View>
        <ListRow
          icon="lucide:folder"
          title="My Groups"
          subtitle="View and manage your groups"
          onPress={() => router.push('/groups')}
        />
        <ListRow
          icon="lucide:plus-circle"
          title="Create Group"
          onPress={() => router.push('/groups/new')}
        />
      </ListGroup>
    </Screen>
  );
}
