import { Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { getThemeColor } from '@/theme/themeColors';
import { alpha } from '@/theme/alpha';
import { useTheme } from '@/theme/ThemeProvider';

export default function SharedContentScreen() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const { isDark } = useTheme();

  return (
    <Screen scroll edges={['top']} padded={false} className="bg-background">
      <ScreenHeader
        title="Shared Content"
        size="compact"
        className="px-5 pt-2 pb-3 border-b border-border"
        onBack={() => router.back()}
      />

      <View className="px-5 pt-6 pb-6">
        <Card className="rounded-xl border border-border/50 mb-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: alpha(getThemeColor('accent', isDark), 0.08) }}
            >
              <IconifyIcon name="lucide:share-2" size={24} color={getThemeColor('accent', isDark)} />
            </View>
            <View>
              <Text className="text-base font-semibold text-foreground capitalize">
                {type || 'Content'}
              </Text>
              <Text className="text-xs text-muted">ID: {id}</Text>
            </View>
          </View>
          <Text className="text-muted text-sm leading-relaxed">
            This content was shared with you. You can view the details and interact with it as
            needed.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
