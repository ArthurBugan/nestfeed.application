import { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin, useGoogleLogin, useDiscordLogin, useAppleLogin, useIsOAuthLoading } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import * as AppleAuthentication from 'expo-apple-authentication';
import AdMobManager from '@/components/Admob';
import { Input, type InputHandle } from '@/components/Input';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const discordLogin = useDiscordLogin();
  const appleLogin = useAppleLogin();
  const isOAuthLoading = useIsOAuthLoading();
  const passwordInputRef = useRef<InputHandle>(null);

  useEffect(() => {
    async function loadAppOpenAd() {
      await AdMobManager.openAppAd();
    }
    loadAppOpenAd();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login.mutateAsync({ email, password });
      router.replace('/(app)');
    } catch {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin.signIn();
    } catch (error) {
      Alert.alert('Google Login Failed', 'Unable to sign in with Google');
    }
  };

  const handleDiscordLogin = async () => {
    try {
      await discordLogin.signIn();
    } catch (error) {
      Alert.alert('Discord Login Failed', 'Unable to sign in with Discord');
    }
  };

  const handleAppleLogin = async () => {
    try {
      await appleLogin.signIn();
    } catch (error) {
      Alert.alert('Apple Login Failed', 'Unable to sign in with Apple');
    }
  };

  const isLoading = login.isPending || isOAuthLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top, 24), paddingHorizontal: 24 }}>
          {/* Brand Hero */}
          <View className="flex-row items-center gap-2.5 mb-8">
            <View className="w-11 h-11 rounded-2xl bg-accent items-center justify-center">
              <IconifyIcon name="lucide:layers" size={22} color={getThemeColor('accent-foreground', isDark)} />
            </View>
            <Text className="text-3xl font-bold text-foreground">Nestfeed</Text>
          </View>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-1">Welcome Back</Text>
            <Text className="text-base text-muted">Sign in to continue to Nestfeed</Text>
          </View>

          {/* Email/Password Form */}
          <View className="mb-8">
            <Input
              label="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            <Input
              ref={passwordInputRef}
              label="Password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button
              label="Sign In"
              fullWidth
              loading={login.isPending}
              disabled={isLoading}
              onPress={handleLogin}
              accessibilityLabel="Sign In"
            />
          </View>

          {/* Forgot Password */}
          <View className="items-center mb-8">
            <PressableScale
              onPress={() => router.push('/(auth)/forgot-password')}
              className="py-2 px-3"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Forgot Password"
            >
              <Text className="text-accent text-sm font-medium">Forgot Password?</Text>
            </PressableScale>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted text-sm mx-4">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Login */}
          <View className="gap-3 mb-6">
            <PressableScale
              className="bg-white flex-row items-center rounded-xl p-3.5 border border-black/10"
              onPress={handleGoogleLogin}
              disabled={googleLogin.isLoading || isOAuthLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              {googleLogin.isLoading || isOAuthLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <IconifyIcon name="mdi:google" size={22} color="#1F1F1F" />
              )}
              <Text className="text-[#1F1F1F] font-medium text-base flex-1 text-center">
                Sign in with Google
              </Text>
            </PressableScale>

            <PressableScale
              className="bg-[#5865F2] flex-row items-center rounded-xl p-3.5"
              onPress={handleDiscordLogin}
              disabled={discordLogin.isLoading || isOAuthLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign in with Discord"
            >
              {discordLogin.isLoading || isOAuthLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconifyIcon name="mdi:discord" size={22} color="white" />
              )}
              <Text className="text-white font-medium text-base flex-1 text-center">
                Sign in with Discord
              </Text>
            </PressableScale>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ height: 50 }}
              onPress={handleAppleLogin}
            />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center pb-8 items-center">
            <Text className="text-muted text-sm">Don't have an account? </Text>
            <PressableScale
              onPress={() => router.push('/(auth)/register')}
              className="py-2 px-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
            >
              <Text className="text-accent text-sm font-medium">Sign Up</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
