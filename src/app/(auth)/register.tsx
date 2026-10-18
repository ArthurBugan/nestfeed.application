import { useState, useRef } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister, useGoogleLogin, useDiscordLogin, useAppleLogin } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Input, type InputHandle } from '@/components/Input';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = useRegister();
  const googleLogin = useGoogleLogin();
  const discordLogin = useDiscordLogin();
  const appleLogin = useAppleLogin();
  const nameInputRef = useRef<InputHandle>(null);
  const emailInputRef = useRef<InputHandle>(null);
  const passwordInputRef = useRef<InputHandle>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await register.mutateAsync({
        name,
        email,
        password,
        encryptedPassword: password,
      });
      router.replace('/(app)');
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert('Registration Failed', 'Unable to create account');
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

          {/* Back button */}
          <PressableScale
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center mb-8 bg-surface"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </PressableScale>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-1">Create Account</Text>
            <Text className="text-base text-muted">Join us today and start organizing</Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <Input
              ref={nameInputRef}
              label="Name"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
            <Input
              ref={emailInputRef}
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
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <Button
              label="Sign Up"
              fullWidth
              loading={register.isPending}
              disabled={register.isPending}
              onPress={handleRegister}
              accessibilityLabel="Sign Up"
            />
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
              disabled={googleLogin.isLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              {googleLogin.isLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <IconifyIcon name="mdi:google" size={22} color="#1F1F1F" />
              )}
              <Text className="text-[#1F1F1F] font-medium text-base flex-1 text-center">
                Sign up with Google
              </Text>
            </PressableScale>

            <PressableScale
              className="bg-[#5865F2] flex-row items-center rounded-xl p-3.5"
              onPress={handleDiscordLogin}
              disabled={discordLogin.isLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign up with Discord"
            >
              {discordLogin.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconifyIcon name="mdi:discord" size={22} color="white" />
              )}
              <Text className="text-white font-medium text-base flex-1 text-center">
                Sign up with Discord
              </Text>
            </PressableScale>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ height: 50 }}
              onPress={handleAppleLogin}
            />
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center pb-8 items-center">
            <Text className="text-muted text-sm">Already have an account? </Text>
            <PressableScale
              onPress={() => router.push('/(auth)/login')}
              className="py-2 px-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text className="text-accent text-sm font-medium">Sign In</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
