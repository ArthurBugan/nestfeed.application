import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from 'heroui-native';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    Haptics.selectionAsync();
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
            <Text className="text-3xl font-bold text-foreground mb-2">Reset Password</Text>
            <Text className="text-base text-muted">Enter your new password</Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-8">
            {/* Password */}
            <Input
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              returnKeyType="next"
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
            />

            {/* Confirm Password */}
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={handleReset}
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
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

            <TouchableOpacity
              className="bg-accent rounded-xl p-4 items-center"
              onPress={handleReset}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text className="text-accent-foreground text-base font-semibold">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
