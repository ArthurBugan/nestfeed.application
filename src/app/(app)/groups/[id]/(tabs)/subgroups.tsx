import { View, Text } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useGroupSubgroups } from '@/hooks';
import { FlashList } from '@shopify/flash-list';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';

export default function GroupSubgroupsScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: subgroupsData } = useGroupSubgroups(id);

  const childGroups = subgroupsData || [];

  const renderItem = ({ item }: { item: typeof childGroups[0] }) => (
    <ListRow
      icon={item.icon || 'lucide:folder'}
      title={item.name}
      className="mb-2"
      accessibilityLabel={`Subgroup: ${item.name}`}
      onPress={() => router.push(`/groups/${item.id}`)}
    />
  );

  return (
    <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <ScreenHeader
        title="Subgroups"
        size="compact"
        className="pt-4 pb-3 border-b border-border"
      />

      <View className="pt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-muted">{childGroups.length} subgroup{childGroups.length !== 1 ? 's' : ''}</Text>
        </View>

        <Button
          label="Add Subgroup"
          icon="lucide:plus"
          variant="outline"
          fullWidth
          className="mb-5"
          onPress={() => router.push(`/groups/new?parentId=${id}`)}
        />

        {childGroups.length === 0 ? (
          <View className="py-12 items-center">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4 bg-default">
              <IconifyIcon name="lucide:folder-open" size={32} className="text-muted" />
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
          />
        )}
      </View>
    </Screen>
  );
}
