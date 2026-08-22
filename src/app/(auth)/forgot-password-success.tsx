import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordSuccessScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* Back button */}
        <TouchableOpacity 
          onPress={() => { Haptics.selectionAsync(); router.back(); }}
          className="w-10 h-10 rounded-full items-center justify-center mt-4 mb-8"
          style={{ backgroundColor: getThemeColor('surface', isDark) }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${getThemeColor('accent', isDark)}20` }}>
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

        <TouchableOpacity 
          className="bg-accent rounded-xl p-4 items-center mb-4" 
          onPress={() => { Haptics.selectionAsync(); router.replace('/(auth)/login'); }}
          activeOpacity={0.7}
        >
          <Text className="text-accent-foreground text-base font-semibold">
            Back to Sign In
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mb-8">
          <Text className="text-sm text-muted">Didn't receive the email? </Text>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }}>
            <Text className="text-sm text-accent font-medium">Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
