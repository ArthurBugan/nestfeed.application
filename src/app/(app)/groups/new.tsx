import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { IconPicker } from '@/components/IconPicker';
import { useCreateGroup, useGroups } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CreateGroupRequest } from '@/api/endpoints/groups';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { tap } from '@/theme/haptics';

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

function SectionLabel({ children, className = '' }: { children: string; className?: string }) {
  return (
    <Text className={`text-xs font-semibold text-muted uppercase tracking-wider mb-3 ${className}`}>
      {children}
    </Text>
  );
}

export default function CreateGroupScreen() {
  const router = useRouter();
  const createGroup = useCreateGroup();
  const { data: groupsData } = useGroups({ limit: 100 });
  const insets = useSafeAreaInsets();

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
    tap();
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      className="bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1">
        <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 120 }}>
          <ScreenHeader title="Create Group" className="pt-2" />

          {/* Info */}
          <SectionLabel className="mt-4">Info</SectionLabel>
          <Card className="mb-6">
            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Name" value={field.value} onChangeText={field.onChange} placeholder="My Group" error={errors.name?.message} />
            )} />
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="Description" value={field.value ?? ''} onChangeText={field.onChange} placeholder="What's this group about?" multiline numberOfLines={3} error={errors.description?.message} />
            )} />
          </Card>

          {/* Classification */}
          <SectionLabel>Classification</SectionLabel>
          <Card className="mb-6">
            <Controller control={control} name="category" render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} options={categoryOptions} placeholder="Select category" error={errors.category?.message} />
            )} />
            <Controller control={control} name="icon" render={({ field }) => (
              <IconPicker value={field.value} onChange={field.onChange} error={errors.icon?.message} />
            )} />
          </Card>

          {/* Organization */}
          <SectionLabel>Organization</SectionLabel>
          <Card className="mb-6">
            <Controller control={control} name="parentId" render={({ field }) => (
              <Select value={field.value ?? ''} onChange={field.onChange} options={parentOptions} placeholder="None (Top-level)" />
            )} />
            <Text className="text-xs text-muted mt-2">Create subgroups to organize hierarchically</Text>
          </Card>

          {/* Visibility */}
          <SectionLabel>Visibility</SectionLabel>
          <Controller control={control} name="enableGroupshelf" render={({ field }) => (
            <ListRow
              icon="lucide:copy"
              title="Group Shelf"
              subtitle="Allow others to discover and copy this group"
              chevron={false}
              switchValue={field.value}
              onSwitchChange={field.onChange}
              accessibilityLabel="Group Shelf"
            />
          )} />
        </Screen>

        {/* Sticky submit bar */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            label="Create"
            fullWidth
            loading={createGroup.isPending}
            onPress={() => { void handleSubmit(onSubmit)(); }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
