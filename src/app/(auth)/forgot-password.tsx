import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForgotPassword } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from '@/components/Input';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { getThemeColor } from '@/theme/themeColors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      await forgotPassword.mutateAsync({
        email,
        encrypted_password: email,
      });
      router.replace({
        pathname: '/(auth)/forgot-password-success',
        params: { email },
      });
    } catch {
      Alert.alert('Error', 'Unable to process request');
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
            <Text className="text-xl font-bold text-foreground mb-1">Reset Password</Text>
            <Text className="text-base text-muted">Enter your email to receive reset instructions</Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <Input
              label="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Button
              label="Send Reset Link"
              fullWidth
              loading={forgotPassword.isPending}
              disabled={forgotPassword.isPending}
              onPress={handleSubmit}
              accessibilityLabel="Send Reset Link"
            />
          </View>

          {/* Back to login */}
          <View className="items-center pb-8">
            <PressableScale
              onPress={() => router.push('/(auth)/login')}
              className="flex-row items-center gap-2 py-2 px-3"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Back to Sign In"
            >
              <IconifyIcon name="lucide:chevron-left" size={16} className="text-accent" />
              <Text className="text-accent text-sm font-medium">Back to Sign In</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
