import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useShareLinks, useDeleteShareLink } from '@/hooks';
import { Card, Button } from 'heroui-native';

import DashboardHeader from '@/components/DashboardHeader';
import type { ShareLink } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import * as Haptics from 'expo-haptics';

export default function ShareLinksScreen() {
  const router = useRouter();
  const { data: response } = useShareLinks();
  const data = response?.data;
  const deleteShareLink = useDeleteShareLink();
  const { isDark } = useTheme();

  const handleShare = async (url: string) => {
    Haptics.selectionAsync();
    try {
      await Share.share({ message: url });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Haptics.selectionAsync();
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background" showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3 border-b" style={{ borderColor: getThemeColor('border', isDark) }}>
          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); router.back(); }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getThemeColor('surface', isDark) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground ml-3">Share Links</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          {data?.length === 0 ? (
            <View className="py-12 items-center">
              <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                <IconifyIcon name="lucide:link-2-off" size={32} color={getThemeColor('muted', isDark)} />
              </View>
              <Text className="text-muted text-center font-medium">No share links yet</Text>
              <Text className="text-muted text-xs text-center mt-1">Create a group or channel to generate a share link</Text>
            </View>
          ) : (
            <View className="gap-3">
              {data?.map((link: ShareLink) => (
                <Card key={link.id}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: getThemeColor('default', isDark) }}>
                      <IconifyIcon name="lucide:link" size={20} color={getThemeColor('foreground', isDark)} />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-base font-semibold text-foreground capitalize">{link.type}</Text>
                      <Text className="text-muted text-xs" numberOfLines={1}>{link.shareUrl}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => link.shareUrl && handleShare(link.shareUrl)}
                      className="w-9 h-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <IconifyIcon name="lucide:share-2" size={16} color={getThemeColor('accent', isDark)} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(link.id, link.type)}
                      className="w-9 h-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: `${getThemeColor('danger', isDark)}15` }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <IconifyIcon name="lucide:trash-2" size={16} color={getThemeColor('danger', isDark)} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
