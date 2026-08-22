import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroup } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function ShareGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group } = useGroup(id);
  const { isDark } = useTheme();

  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        message: `Check out this group: ${group?.name} - ${group?.description || ''}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
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
          <Text className="text-lg font-semibold text-foreground ml-3">Share Group</Text>
        </View>

        <View className="px-5 pt-8 pb-6">
          {group && (
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}>
                <IconifyIcon name="lucide:share-2" size={40} color={getThemeColor('accent', isDark)} />
              </View>
              <Text className="text-xl font-bold text-foreground mb-1">{group.name}</Text>
              {group.description && (
                <Text className="text-muted text-center max-w-xs">{group.description}</Text>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={handleShare}
            className="bg-accent rounded-xl py-4 items-center"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <IconifyIcon name="lucide:share-2" size={20} color="white" />
              <Text className="text-accent-foreground font-semibold text-base">Share Group</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
