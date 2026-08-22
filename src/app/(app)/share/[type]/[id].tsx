import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function SharedContentScreen() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const { isDark } = useTheme();

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
          <Text className="text-lg font-semibold text-foreground ml-3">Shared Content</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          <View className="bg-surface rounded-xl p-5 border border-border/50 mb-5">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}>
                <IconifyIcon name="lucide:share-2" size={24} color={getThemeColor('accent', isDark)} />
              </View>
              <View>
                <Text className="text-base font-semibold text-foreground capitalize">{type || 'Content'}</Text>
                <Text className="text-xs text-muted">ID: {id}</Text>
              </View>
            </View>
            <Text className="text-muted text-sm leading-relaxed">
              This content was shared with you. You can view the details and interact with it as needed.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
