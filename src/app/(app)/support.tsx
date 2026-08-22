import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function SupportScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const openEmail = () => {
    Haptics.selectionAsync();
    Linking.openURL('mailto:support@nestfeed.app');
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
          <Text className="text-lg font-semibold text-foreground ml-3">Support</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          {/* Hero */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}>
              <IconifyIcon name="lucide:life-buoy" size={40} color={getThemeColor('accent', isDark)} />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">How can we help?</Text>
            <Text className="text-muted text-center max-w-xs">
              We're here to help. Reach out and we'll respond as soon as possible.
            </Text>
          </View>

          {/* Contact Options */}
          <View className="gap-3 mb-6">
            <TouchableOpacity
              className="flex-row items-center bg-surface rounded-xl p-4 border border-border/50"
              onPress={openEmail}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}>
                <IconifyIcon name="lucide:mail" size={22} color={getThemeColor('accent', isDark)} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Email Us</Text>
                <Text className="text-sm text-muted">support@nestfeed.app</Text>
              </View>
              <IconifyIcon name="lucide:chevron-right" size={20} color={getThemeColor('muted', isDark)} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-surface rounded-xl p-4 border border-border/50"
              onPress={() => { Haptics.selectionAsync(); router.push('/support/faq'); }}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${getThemeColor('accent', isDark)}15` }}>
                <IconifyIcon name="lucide:file-question" size={22} color={getThemeColor('accent', isDark)} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">FAQ</Text>
                <Text className="text-sm text-muted">Common questions and answers</Text>
              </View>
              <IconifyIcon name="lucide:chevron-right" size={20} color={getThemeColor('muted', isDark)} />
            </TouchableOpacity>
          </View>

          {/* Response Time */}
          <View className="bg-surface rounded-xl p-4 border border-border/50">
            <View className="flex-row items-center gap-3">
              <IconifyIcon name="lucide:clock" size={20} color={getThemeColor('accent', isDark)} />
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Response Time</Text>
                <Text className="text-sm text-muted">We typically respond within 24-48 hours</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
