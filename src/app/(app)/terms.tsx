import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function TermsScreen() {
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
          <Text className="text-lg font-semibold text-foreground ml-3">Terms of Service</Text>
        </View>

        <View className="px-5 pt-6 pb-6">
          <View className="flex-row items-center gap-2 mb-6">
            <IconifyIcon name="lucide:scale" size={20} color={getThemeColor('accent', isDark)} />
            <Text className="text-sm text-muted">Last updated: May 2025</Text>
          </View>

          <View className="gap-5">
            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:file-text" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Acceptance of Terms</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:user-check" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">User Responsibilities</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:shield" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Privacy</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our service, you consent to our privacy practices.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:ban" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Prohibited Activities</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                You may not use our service for any illegal activities, distribute harmful content, or attempt to gain unauthorized access to our systems or other users' accounts.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border/50">
              <View className="flex-row items-center gap-2 mb-3">
                <IconifyIcon name="lucide:circle-alert" size={18} color={getThemeColor('accent', isDark)} />
                <Text className="text-base font-semibold text-foreground">Termination</Text>
              </View>
              <Text className="text-muted leading-relaxed">
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
