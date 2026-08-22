import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function PrivacyScreen() {
  const router = useRouter();
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
          <Text className="text-lg font-semibold text-foreground ml-3">Privacy Policy</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          {/* Last Updated */}
          <View className="flex-row items-center gap-2 mb-6">
            <IconifyIcon name="lucide:shield-check" size={20} color={getThemeColor('accent', isDark)} />
            <Text className="text-sm text-muted">Last updated: May 2025</Text>
          </View>

          {/* Content */}
          <View className="gap-5">
            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:lock" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Data Collection</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                We collect your email and name for account purposes only. We do not share your data with third parties.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:database" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Data Storage</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                Your data is stored securely using industry-standard encryption. We retain your data only as long as your account is active.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:user-x" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Your Rights</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                You can request deletion of your data at any time. Contact us at support@nestfeed.app to exercise your rights.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:mail" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Contact</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                If you have any questions about this privacy policy, please contact us at support@nestfeed.app.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
