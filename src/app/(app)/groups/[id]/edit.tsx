import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Switch as SwitchNative } from 'heroui-native';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { IconPicker } from '@/components/IconPicker';
import { useGroup, useUpdateGroup, useGroups } from '@/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { UpdateGroupRequest } from '@/api/endpoints/groups';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { IconifyIcon } from '@/components/IconifyIcon';

import * as Haptics from 'expo-haptics';

const DEFAULT_CATEGORIES = [
  'Apps & Software', 'Arts', 'Business', 'Education', 'Entertainment',
  'Gaming', 'Lifestyle', 'Music', 'News', 'Science & Technology',
  'Sports', 'Travel',
];

const categoryOptions = DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));

const editGroupSchema = z.object({
  name: z.string().min(1, 'Required').max(50, 'Max 50 chars').regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, underscores'),
  description: z.string().max(200, 'Max 200 chars').optional(),
  category: z.string().min(1, 'Select a category'),
  icon: z.string().min(1, 'Select an icon'),
  parentId: z.string().optional(),
  enableGroupshelf: z.boolean().optional().default(false),
});

type EditGroupForm = z.infer<typeof editGroupSchema>;

export default function EditGroupScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: group, isLoading } = useGroup(id);
  const updateGroup = useUpdateGroup();
  const { data: groupsData } = useGroups({ limit: 100 });
  const { isDark } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditGroupForm>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      name: group?.name || '', description: group?.description || '',
      category: group?.category || '', icon: group?.icon || 'twemoji:rocket',
      parentId: group?.parentId || '', enableGroupshelf: group?.enableGroupshelf ?? false,
    },
  });

  const parentOptions = [
    { value: '', label: 'None (Top-level)', icon: undefined },
    ...(groupsData?.data?.map((g) => ({ value: g.id, label: g.name, icon: g.icon })) ?? []),
  ];

  const onSubmit = async (data: EditGroupForm) => {
    Haptics.selectionAsync();
    try {
      const payload: UpdateGroupRequest = {
        name: data.name, description: data.description, category: data.category,
        icon: data.icon, parentId: data.parentId || undefined, enableGroupshelf: data.enableGroupshelf,
      };
      await updateGroup.mutateAsync({ id, data: payload });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update group');
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
          <Text className="text-lg font-semibold text-foreground">Edit Group</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={updateGroup.isPending} className="px-4 py-1.5 rounded-lg bg-accent">
            <Text className="text-accent-foreground font-semibold text-sm">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="px-5 pt-6 pb-6" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Group Shelf Toggle */}
          <View className="mb-6">
            <Controller control={control} name="enableGroupshelf" render={({ field }) => (
              <View className="bg-surface rounded-xl p-4 border border-border/50">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">Enable Group Shelf</Text>
                    <Text className="text-xs text-muted mt-1">Allow this group to be added to groupshelf, so other users can copy it</Text>
                  </View>
                  <SwitchNative isSelected={field.value} onSelectedChange={field.onChange} />
                </View>
              </View>
            )} />
          </View>

          {/* Info */}
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Name" value={field.value} onChangeText={field.onChange} placeholder="My Group" error={errors.name?.message} />
            )} />
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="Description" value={field.value ?? ''} onChangeText={field.onChange} placeholder="What's this group about?" multiline numberOfLines={4} error={errors.description?.message} />
            )} />
          </View>

          {/* Classification */}
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="category" render={({ field }) => (
              <Select label="Category" value={field.value} onChange={field.onChange} options={categoryOptions} placeholder="Select category" error={errors.category?.message} />
            )} />
            <Controller control={control} name="icon" render={({ field }) => (
              <IconPicker label="Icon" value={field.value} onChange={field.onChange} error={errors.icon?.message} />
            )} />
          </View>

          {/* Organization */}
          <View className="bg-surface rounded-xl p-4 border border-border/50 mb-6">
            <Controller control={control} name="parentId" render={({ field }) => (
              <Select label="Parent Group (Optional)" value={field.value ?? ''} onChange={field.onChange} options={parentOptions} placeholder="None (Top-level)" />
            )} />
            <Text className="text-xs text-muted mt-2">Create subgroups to organize hierarchically</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
