import { useState } from 'react';
import { View, Text, Alert, Share } from 'react-native';
import { useShareLinks, useUpdateShareLink, useDeleteShareLink } from '@/hooks';
import { buildShareUrl } from '@/api/endpoints/shareLinks';

import type { ShareLink } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { getThemeColor } from '@/theme/themeColors';
import { alpha } from '@/theme/alpha';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/Input';
import { Toast } from '@/components/ui/Toast';
import { tap } from '@/theme/haptics';

const PERMISSION_OPTIONS = ['all', 'visualize', 'collaborate', 'none'] as const;
const LINK_TYPE_OPTIONS = ['all', 'visualize', 'collaborate'] as const;
export default function ShareLinksScreen() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useShareLinks();
  const data = response?.data;
  const updateShareLink = useUpdateShareLink();
  const deleteShareLink = useDeleteShareLink();
  const { isDark } = useTheme();

  const [editing, setEditing] = useState<ShareLink | null>(null);
  const [editLinkCode, setEditLinkCode] = useState('');
  const [editLinkType, setEditLinkType] = useState<string>('visualize');
  const [editPermission, setEditPermission] = useState<string>('visualize');
  const [saving, setSaving] = useState(false);

  const label = (link: ShareLink) => link.groupName || link.linkType || 'Share link';

  const handleEdit = (link: ShareLink) => {
    tap();
    setEditing(link);
    setEditLinkCode(link.linkCode ?? '');
    setEditLinkType(link.linkType ?? 'visualize');
    setEditPermission(link.permission ?? 'visualize');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateShareLink.mutateAsync({
        id: editing.id,
        data: {
          linkCode: editLinkCode.trim() || editing.linkCode,
          linkType: editLinkType,
          permission: editPermission,
        },
      });
      Toast.success('Share link updated');
      setEditing(null);
    } catch {
      Toast.error('Failed to update share link');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (link: ShareLink) => {
    tap();
    const url =
      link.linkCode && link.linkType ? buildShareUrl(link.linkType, link.linkCode) : undefined;
    if (!url) return;
    try {
      await Share.share({ message: url });
    } catch {
      Toast.error('Failed to share');
    }
  };

  const handleDelete = (id: string, name: string) => {
    tap();
    Alert.alert('Delete Share Link', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteShareLink.mutateAsync(id);
            Toast.success('Share link deleted');
          } catch {
            Toast.error('Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={['top']} scroll contentContainerStyle={{ paddingBottom: 24 }}>
      <ScreenHeader
        title="Share Links"
        size="compact"
        className="pt-4 pb-3 border-b border-border"
      />

      <View className="pt-6">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <LoadingState variant="skeleton" rows={3} label="Loading share links" />
        ) : data?.length === 0 ? (
          <EmptyState
            icon="lucide:link-2-off"
            title="No share links yet"
            description="Create a group or channel to generate a share link"
          />
        ) : (
          <View className="gap-3">
            {data?.map((link: ShareLink) => (
              <Card key={link.id}>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl items-center justify-center bg-default">
                    <IconifyIcon name="lucide:link" size={20} className="text-foreground" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      {label(link)}
                    </Text>
                    <Text className="text-muted text-xs" numberOfLines={1}>
                      {link.linkCode ?? '—'}
                      {link.permission ? ` · ${link.permission}` : ''}
                    </Text>
                  </View>
                  <PressableScale
                    onPress={() => handleEdit(link)}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: alpha(getThemeColor('accent', isDark), 0.08) }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${label(link)}`}
                  >
                    <IconifyIcon name="lucide:pencil" size={16} className="text-accent" />
                  </PressableScale>
                  <PressableScale
                    onPress={() => handleShare(link)}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: alpha(getThemeColor('accent', isDark), 0.08) }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Share ${label(link)} link`}
                  >
                    <IconifyIcon name="lucide:share-2" size={16} className="text-accent" />
                  </PressableScale>
                  <PressableScale
                    onPress={() => handleDelete(link.id, label(link))}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: alpha(getThemeColor('danger', isDark), 0.08) }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${label(link)} link`}
                  >
                    <IconifyIcon name="lucide:trash-2" size={16} className="text-danger" />
                  </PressableScale>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit share link"
        snapPoints={['50%']}
      >
        {editing ? (
          <View>
            <Input
              value={editLinkCode}
              onChangeText={setEditLinkCode}
              label="Link code"
              autoCapitalize="characters"
              testID="sharelink-code-input"
            />
            <Input
              value={editLinkType}
              onChangeText={setEditLinkType}
              label="Link type"
              testID="sharelink-type-input"
            />
            <Input
              value={editPermission}
              onChangeText={setEditPermission}
              label="Permission"
              testID="sharelink-permission-input"
            />
            <Button onPress={handleSave} disabled={saving} className="mt-2">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
