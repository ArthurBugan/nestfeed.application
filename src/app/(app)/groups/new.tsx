import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { IconPicker } from '@/components/IconPicker';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useCreateGroup, useGroups } from '@/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CreateGroupRequest } from '@/api/endpoints/groups';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { Switch } from 'heroui-native';
import * as Haptics from 'expo-haptics';

const DEFAULT_CATEGORIES = [
  'Apps & Software', 'Arts', 'Business', 'Education', 'Entertainment',
  'Gaming', 'Lifestyle', 'Music', 'News', 'Science & Technology',
  'Sports', 'Travel',
];

const categoryOptions = DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));

const createGroupSchema = z.object({
  name: z.string().min(1, 'Required').max(50, 'Max 50 chars').regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, underscores'),
  description: z.string().max(200, 'Max 200 chars').optional(),
  category: z.string().min(1, 'Select a category'),
  icon: z.string().min(1, 'Select an icon'),
  parentId: z.string().optional(),
  enableGroupshelf: z.boolean().optional().default(false),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroupScreen() {
  const router = useRouter();
  const createGroup = useCreateGroup();
  const { data: groupsData } = useGroups({ limit: 100 });
  const { isDark } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '', description: '', category: '', icon: 'twemoji:rocket', parentId: '', enableGroupshelf: false,
    },
  });

  const parentOptions = [
    { value: '', label: 'None (Top-level)', icon: undefined },
    ...(groupsData?.data?.map((g) => ({ value: g.id, label: g.name, icon: g.icon })) ?? []),
  ];

  const onSubmit = async (data: CreateGroupForm) => {
    Haptics.selectionAsync();
    try {
      const payload: CreateGroupRequest = {
        name: data.name, description: data.description, category: data.category,
        icon: data.icon, parentId: data.parentId || undefined, enableGroupshelf: data.enableGroupshelf,
      };
      await createGroup.mutateAsync(payload);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create group');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} className="bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b" style={{ borderColor: getThemeColor('border', isDark) }}>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} className="p-1.5 -ml-1 rounded-full" style={{ backgroundColor: getThemeColor('surface', isDark) }}>
            <IconifyIcon name="lucide:x" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Create Group</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={createGroup.isPending} className="px-4 py-1.5 rounded-lg bg-accent">
            <Text className="text-accent-foreground font-semibold text-sm">Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="px-5 pt-6 pb-6" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Info Section */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Info</Text>
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Name" value={field.value} onChangeText={field.onChange} placeholder="My Group" error={errors.name?.message} />
            )} />
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="Description" value={field.value ?? ''} onChangeText={field.onChange} placeholder="What's this group about?" multiline numberOfLines={3} error={errors.description?.message} />
            )} />
          </View>

          {/* Classification */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Classification</Text>
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="category" render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} options={categoryOptions} placeholder="Select category" error={errors.category?.message} />
            )} />
            <Controller control={control} name="icon" render={({ field }) => (
              <IconPicker value={field.value} onChange={field.onChange} error={errors.icon?.message} />
            )} />
          </View>

          {/* Organization */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Organization</Text>
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="parentId" render={({ field }) => (
              <Select value={field.value ?? ''} onChange={field.onChange} options={parentOptions} placeholder="None (Top-level)" />
            )} />
            <Text className="text-xs text-muted mt-2">Create subgroups to organize hierarchically</Text>
          </View>

          {/* Visibility */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Visibility</Text>
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="enableGroupshelf" render={({ field }) => (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground text-base font-medium">Group Shelf</Text>
                  <Text className="text-xs text-muted mt-0.5">Allow others to discover and copy this group</Text>
                </View>
                <Switch value={field.value} onValueChange={field.onChange} />
              </View>
            )} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
