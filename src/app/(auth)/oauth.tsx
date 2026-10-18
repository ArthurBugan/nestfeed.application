import { useEffect } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useHandleOAuthCallback } from '@/hooks';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import { Screen } from '@/components/ui/Screen';

export default function OAuthCallback() {
  const { token } = useGlobalSearchParams();
  const router = useRouter();
  const { handleCallback } = useHandleOAuthCallback();
  const { isDark } = useTheme();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await WebBrowser.dismissBrowser();
      } catch (error) {
        console.error('Error dismissing browser:', error);
      }

      const result = await handleCallback(token as string);
      if (result.success) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login?error=oauth_failed');
      }
    };

    processCallback();
  }, [token]);

  return (
    <Screen padded={false}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4 bg-accent/10">
          <ActivityIndicator size="large" color={getThemeColor('accent', isDark)} />
        </View>
        <Text className="text-foreground text-lg font-medium">
          Completing login...
        </Text>
        <Text className="text-muted text-sm mt-2">
          Please wait a moment
        </Text>
      </View>
    </Screen>
  );
}
