import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from '@/components/Input';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Error', 'Unable to reset password');
    } finally {
      setIsLoading(false);
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
            <Text className="text-base text-muted">Enter your new password</Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            {/* Password */}
            <Input
              label="New Password"
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleReset}
            />

            {/* Password match indicator */}
            {confirmPassword && password !== confirmPassword && (
              <View className="flex-row items-center gap-2 bg-danger/10 rounded-lg px-3 py-2">
                <IconifyIcon name="lucide:alert-circle" size={16} color={getThemeColor('danger', isDark)} />
                <Text className="text-xs text-danger">Passwords do not match</Text>
              </View>
            )}
            {confirmPassword && password === confirmPassword && (
              <View className="flex-row items-center gap-2 bg-success/10 rounded-lg px-3 py-2">
                <IconifyIcon name="lucide:check-circle" size={16} color={getThemeColor('success', isDark)} />
                <Text className="text-xs text-success">Passwords match</Text>
              </View>
            )}

            <Button
              label="Reset Password"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              onPress={handleReset}
              accessibilityLabel="Reset Password"
              className="mt-4"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
