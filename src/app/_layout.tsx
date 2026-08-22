import '../../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { Uniwind } from 'uniwind';
import { useHandleOAuthCallback } from '@/hooks';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';
import AdMobManager from '@/components/Admob';
import * as Sentry from "@sentry/react-native";
import { HeroUINativeProvider } from 'heroui-native';

Sentry.init({
  dsn: `${process.env.EXPO_PUBLIC_SENTRY_DSN}`,
  sendDefaultPii: true,
  tracesSampleRate: 0,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

function AppContent() {
  const url = Linking.useURL();
  const { handleCallback } = useHandleOAuthCallback();
  const initialUrlHandled = useRef(false);

  useEffect(() => {
    const handleInitialUrl = async () => {
      if (initialUrlHandled.current) return;

      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && (initialUrl.includes('oauth') || initialUrl.includes('token='))) {
        initialUrlHandled.current = true;
        const result = await handleCallback(initialUrl);
        if (result.success) {
          router.replace('/(app)');
        }
      }
    };

    handleInitialUrl();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', async (event) => {
      if (event.url.includes('oauth') || event.url.includes('token=')) {
        const result = await handleCallback(event.url);
        if (result.success) {
          router.replace('/(app)');
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const handleUrlCallback = async () => {
      if (url && (url.includes('oauth') || url.includes('token='))) {
        const result = await handleCallback(url);
        if (result.success) {
          router.replace('/(app)');
        }
      }
    };
    handleUrlCallback();
  }, [url]);

  return <Slot />;
}

function AppContentWithTheme() {
  const { isDark } = useTheme();

  useEffect(() => {
    console.log('[AppContentWithTheme] isDark:', isDark, '-> Uniwind.setTheme:', isDark ? 'dark' : 'light');
    Uniwind.setTheme(isDark ? 'dark' : 'light');
  }, [isDark]);

  return <AppContent />;
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GestureHandlerRootView>
          <Host>
            <HeroUINativeProvider>
              <QueryClientProvider client={queryClient}>
                <AppContentWithTheme />
                <AdMobManager style={{ marginTop: 10 }} />
              </QueryClientProvider>
            </HeroUINativeProvider>
          </Host>
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
