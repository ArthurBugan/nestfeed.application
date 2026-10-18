import { View, Text, Alert, Share } from 'react-native';
import { useShareLinks, useDeleteShareLink } from '@/hooks';

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
import { tap } from '@/theme/haptics';

export default function ShareLinksScreen() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useShareLinks();
  const data = response?.data;
  const deleteShareLink = useDeleteShareLink();
  const { isDark } = useTheme();

  const handleShare = async (url: string) => {
    tap();
    try {
      await Share.share({ message: url });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    tap();
    Alert.alert('Delete Share Link', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteShareLink.mutateAsync(id);
          } catch {
            Alert.alert('Error', 'Failed to delete');
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
                    <Text className="text-base font-semibold text-foreground capitalize">{link.type}</Text>
                    <Text className="text-muted text-xs" numberOfLines={1}>{link.shareUrl}</Text>
                  </View>
                  <PressableScale
                    onPress={() => link.shareUrl && handleShare(link.shareUrl)}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: alpha(getThemeColor('accent', isDark), 0.08) }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Share ${link.type} link`}
                  >
                    <IconifyIcon name="lucide:share-2" size={16} className="text-accent" />
                  </PressableScale>
                  <PressableScale
                    onPress={() => handleDelete(link.id, link.type)}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: alpha(getThemeColor('danger', isDark), 0.08) }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${link.type} link`}
                  >
                    <IconifyIcon name="lucide:trash-2" size={16} className="text-danger" />
                  </PressableScale>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
