import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForgotPassword } from '@/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Input } from 'heroui-native';
import { getThemeColor } from '@/theme/themeColors';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = async () => {
    Haptics.selectionAsync();
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
            <Text className="text-base text-muted">Enter your email to receive reset instructions</Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-8">
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              placeholderTextColor={getThemeColor('field-placeholder', isDark)}
            />

            <TouchableOpacity
              className="bg-accent rounded-xl p-4 items-center"
              onPress={handleSubmit}
              disabled={forgotPassword.isPending}
              activeOpacity={0.7}
            >
              <Text className="text-accent-foreground text-base font-semibold">
                {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to login */}
          <View className="items-center pb-8">
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/login'); }}>
              <View className="flex-row items-center gap-2">
                <IconifyIcon name="lucide:chevron-left" size={16} color={getThemeColor('accent', isDark)} />
                <Text className="text-accent text-sm font-medium">Back to Sign In</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
