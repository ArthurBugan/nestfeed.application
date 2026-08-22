import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { useAnime, useGroups } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { IconifyIcon } from '@/components/IconifyIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function EditAnimeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: anime, isLoading } = useAnime(id);
  const { data: groupsData } = useGroups();
  const { isDark } = useTheme();

  const [name, setName] = useState(anime?.name || '');
  const [description, setDescription] = useState(anime?.description || '');
  const [groupId, setGroupId] = useState(anime?.groupId || '');

  const groupOptions = groupsData?.data.map((g) => ({ value: g.id, label: g.name })) || [];

  const handleSubmit = async () => {
    Haptics.selectionAsync();
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
    return <View className="flex-1 bg-background items-center justify-center"><Text className="text-muted">Loading...</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} className="bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b" style={{ borderColor: getThemeColor('border', isDark) }}>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} className="p-1.5 -ml-1 rounded-full" style={{ backgroundColor: getThemeColor('surface', isDark) }}>
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Edit Anime</Text>
          <TouchableOpacity onPress={handleSubmit} className="px-4 py-1.5 rounded-lg bg-accent">
            <Text className="text-accent-foreground font-semibold text-sm">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="px-5 pt-6 pb-6" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Input label="Anime Name" value={name} onChangeText={setName} placeholder="Enter anime name" />
            <Input label="Description" value={description} onChangeText={setDescription} placeholder="Enter description" multiline numberOfLines={3} />
            <Select label="Group" value={groupId} onChange={setGroupId} options={groupOptions} placeholder="Select group" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
