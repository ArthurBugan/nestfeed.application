import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { useAnime, useGroups } from '@/hooks';
import { LoadingState } from '@/components/states';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { tap } from '@/theme/haptics';

export default function EditAnimeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: anime, isLoading } = useAnime(id);
  const { data: groupsData } = useGroups();

  const [name, setName] = useState(anime?.name || '');
  const [description, setDescription] = useState(anime?.description || '');
  const [groupId, setGroupId] = useState(anime?.groupId || '');

  const groupOptions = groupsData?.data.map((g) => ({ value: g.id, label: g.name })) || [];

  const handleSubmit = async () => {
    tap();
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      // TODO: call update API
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update anime');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LoadingState label="Loading" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      className="bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Screen edges={['top', 'bottom']} scroll padded={false}>
        <ScreenHeader
          title="Edit Anime"
          size="compact"
          className="px-5 pt-2 pb-3 border-b border-border"
          right={
            <Button label="Save" size="sm" onPress={() => void handleSubmit()} testID="save" />
          }
        />

        <View className="px-5 pt-6">
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Input
              label="Anime Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter anime name"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
            <Select
              label="Group"
              value={groupId}
              onChange={setGroupId}
              options={groupOptions}
              placeholder="Select group"
            />
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
