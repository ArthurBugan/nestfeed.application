import { Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';

export default function ForgotPasswordSuccessScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <Screen edges={['top', 'bottom']} padded={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
      <View className="flex-1 items-center justify-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-accent/10">
          <IconifyIcon name="lucide:mail-check" size={40} color={getThemeColor('accent', isDark)} />
        </View>

        <Text className="text-2xl font-bold text-foreground mb-4 text-center">
          Check Your Email
        </Text>

        <Text className="text-base text-muted mb-2 text-center">
          We've sent reset instructions to
        </Text>
        <Text className="text-accent font-semibold mb-8">{email}</Text>

        <Text className="text-sm text-muted text-center mb-10 max-w-[280px]">
          Check your inbox and follow the instructions to reset your password
        </Text>
      </View>

      <Button
        label="Back to Sign In"
        fullWidth
        onPress={() => router.replace('/(auth)/login')}
        accessibilityLabel="Back to Sign In"
        className="mb-4"
      />

      <View className="flex-row justify-center items-center mb-8">
        <Text className="text-sm text-muted">Didn't receive the email? </Text>
        <PressableScale
          onPress={() => router.back()}
          className="py-2 px-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text className="text-sm text-accent font-medium">Try again</Text>
        </PressableScale>
      </View>
    </Screen>
  );
}
