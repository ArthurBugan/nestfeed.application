import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/theme/ThemeProvider';
import { getThemeColor } from '@/theme/themeColors';
import apiClient from '@/api/client';

export default function Index() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      console.log('[Index] Checking auth, isDark:', isDark);
      await apiClient.loadAuthToken();
      await checkAuth();
      console.log('[Index] Auth check done, isAuthenticated:', isAuthenticated, 'isDark:', isDark);
      setIsLoading(false);
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={getThemeColor('accent', isDark)} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}