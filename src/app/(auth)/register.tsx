import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister, useGoogleLogin, useDiscordLogin, useAppleLogin } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Input } from 'heroui-native';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
  const nameInputRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  const handleRegister = async () => {
    Haptics.selectionAsync();
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
          {/* Back button */}
          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); router.back(); }}
            className="w-10 h-10 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: getThemeColor('surface', isDark) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-foreground mb-2">Create Account</Text>
            <Text className="text-base text-muted">Join us today and start organizing</Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-8">
            <Input
              ref={(ref) => { nameInputRef.current = ref as any; }}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
            />
            <Input
              ref={(ref) => { emailInputRef.current = ref as any; }}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
            />
            <Input
              ref={(ref) => { passwordInputRef.current = ref as any; }}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
            />

            <TouchableOpacity
              className="bg-accent rounded-xl p-4 items-center"
              onPress={handleRegister}
              disabled={register.isPending}
              activeOpacity={0.7}
            >
              <Text className="text-accent-foreground text-base font-semibold">
                {register.isPending ? 'Creating account...' : 'Sign Up'}
              </Text>
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
              disabled={googleLogin.isLoading}
              activeOpacity={0.7}
            >
              {googleLogin.isLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <IconifyIcon name="mdi:google" size={22} color="black" />
              )}
              <Text className="text-foreground font-medium text-base flex-1 text-center">
                Sign up with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#5865F2] flex-row items-center rounded-xl p-3.5"
              onPress={handleDiscordLogin}
              disabled={discordLogin.isLoading}
              activeOpacity={0.7}
            >
              {discordLogin.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconifyIcon name="mdi:discord" size={22} color="white" />
              )}
              <Text className="text-white font-medium text-base flex-1 text-center">
                Sign up with Discord
              </Text>
            </TouchableOpacity>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ height: 50 }}
              onPress={handleAppleLogin}
            />
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center pb-8">
            <Text className="text-muted text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/login'); }}>
              <Text className="text-accent text-sm font-medium">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
