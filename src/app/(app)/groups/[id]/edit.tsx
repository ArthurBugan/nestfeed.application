import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { IconPicker } from '@/components/IconPicker';
import { useGroup, useUpdateGroup, useGroups } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UpdateGroupRequest } from '@/api/endpoints/groups';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { LoadingState } from '@/components/states';
import { tap } from '@/theme/haptics';

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
  const insets = useSafeAreaInsets();

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
    tap();
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
      <View className="flex-1">
        <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 120 }}>
          <ScreenHeader title="Edit Group" className="pt-2" />

          {/* Group Shelf Toggle */}
          <Controller control={control} name="enableGroupshelf" render={({ field }) => (
            <ListRow
              icon="lucide:copy"
              title="Enable Group Shelf"
              subtitle="Allow this group to be added to groupshelf, so other users can copy it"
              chevron={false}
              switchValue={field.value}
              onSwitchChange={field.onChange}
              accessibilityLabel="Enable Group Shelf"
              className="mt-4"
            />
          )} />

          {/* Info */}
          <Card className="mt-4 mb-6">
            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Name" value={field.value} onChangeText={field.onChange} placeholder="My Group" error={errors.name?.message} />
            )} />
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="Description" value={field.value ?? ''} onChangeText={field.onChange} placeholder="What's this group about?" multiline numberOfLines={4} error={errors.description?.message} />
            )} />
          </Card>

          {/* Classification */}
          <Card className="mb-6">
            <Controller control={control} name="category" render={({ field }) => (
              <Select label="Category" value={field.value} onChange={field.onChange} options={categoryOptions} placeholder="Select category" error={errors.category?.message} />
            )} />
            <Controller control={control} name="icon" render={({ field }) => (
              <IconPicker label="Icon" value={field.value} onChange={field.onChange} error={errors.icon?.message} />
            )} />
          </Card>

          {/* Organization */}
          <Card className="mb-6">
            <Controller control={control} name="parentId" render={({ field }) => (
              <Select label="Parent Group (Optional)" value={field.value ?? ''} onChange={field.onChange} options={parentOptions} placeholder="None (Top-level)" />
            )} />
            <Text className="text-xs text-muted mt-2">Create subgroups to organize hierarchically</Text>
          </Card>
        </Screen>

        {/* Sticky submit bar */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            label="Save"
            fullWidth
            loading={updateGroup.isPending}
            onPress={() => { void handleSubmit(onSubmit)(); }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
