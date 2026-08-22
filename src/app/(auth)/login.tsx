import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin, useGoogleLogin, useDiscordLogin, useAppleLogin, useIsOAuthLoading } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import * as AppleAuthentication from 'expo-apple-authentication';
import AdMobManager from '@/components/Admob';
import { Input } from 'heroui-native';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
  const passwordInputRef = useRef<any>(null);

  useEffect(() => {
    async function loadAppOpenAd() {
      await AdMobManager.openAppAd();
    }
    loadAppOpenAd();
  }, []);

  const handleLogin = async () => {
    Haptics.selectionAsync();
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
    Haptics.selectionAsync();
    try {
      await googleLogin.signIn();
    } catch (error) {
      Alert.alert('Google Login Failed', 'Unable to sign in with Google');
    }
  };

  const handleDiscordLogin = async () => {
    Haptics.selectionAsync();
    try {
      await discordLogin.signIn();
    } catch (error) {
      Alert.alert('Discord Login Failed', 'Unable to sign in with Discord');
    }
  };

  const handleAppleLogin = async () => {
    Haptics.selectionAsync();
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
          {/* Header */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back</Text>
            <Text className="text-base text-muted">Sign in to continue to Nestfeed</Text>
          </View>

          {/* Email/Password Form */}
          <View className="gap-4 mb-8">
            <Input
              placeholder="Email"
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            <Input
              ref={(ref) => { passwordInputRef.current = ref as any; }}
              placeholder="Password"
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              className="bg-accent rounded-xl p-4 items-center"
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text className="text-accent-foreground text-base font-semibold">
                {login.isPending ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/forgot-password'); }}>
              <Text className="text-accent text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px" style={{ backgroundColor: getThemeColor('border', isDark) }} />
            <Text className="text-muted text-sm mx-4">or continue with</Text>
            <View className="flex-1 h-px" style={{ backgroundColor: getThemeColor('border', isDark) }} />
          </View>

          {/* Social Login */}
          <View className="gap-3 mb-6">
            <TouchableOpacity
              className="bg-white flex-row items-center rounded-xl p-3.5 border"
              style={{ borderColor: getThemeColor('border', isDark) }}
              onPress={handleGoogleLogin}
              disabled={googleLogin.isLoading || isOAuthLoading}
              activeOpacity={0.7}
            >
              {googleLogin.isLoading || isOAuthLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <IconifyIcon name="mdi:google" size={22} color="black" />
              )}
              <Text className="text-foreground font-medium text-base flex-1 text-center">
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#5865F2] flex-row items-center rounded-xl p-3.5"
              onPress={handleDiscordLogin}
              disabled={discordLogin.isLoading || isOAuthLoading}
              activeOpacity={0.7}
            >
              {discordLogin.isLoading || isOAuthLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconifyIcon name="mdi:discord" size={22} color="white" />
              )}
              <Text className="text-white font-medium text-base flex-1 text-center">
                Sign in with Discord
              </Text>
            </TouchableOpacity>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ height: 50 }}
              onPress={handleAppleLogin}
            />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center pb-8">
            <Text className="text-muted text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/register'); }}>
              <Text className="text-accent text-sm font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
