import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Avatar, Separator, Text } from 'heroui-native';
import { useCurrentUser } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/theme/ThemeProvider';
import { IconifyIcon } from '@/components/IconifyIcon';
import { getThemeColor } from '@/theme/themeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Switch } from 'heroui-native';
import * as Haptics from 'expo-haptics';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    Haptics.selectionAsync();
    Alert.alert('Success', 'Profile updated');
  };

  const handleLogout = async () => {
    Haptics.selectionAsync();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        <View style={{ paddingTop: insets.top }} className="px-5 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity 
              onPress={() => { Haptics.selectionAsync(); router.back(); }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: getThemeColor('surface', isDark) }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconifyIcon name="lucide:arrow-left" size={20} color={getThemeColor('foreground', isDark)} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Account</Text>
            <TouchableOpacity onPress={handleSave} className="px-4 py-1.5 rounded-lg bg-accent">
              <Text className="text-accent-foreground font-semibold text-sm">Save</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-2xl p-5 mb-5 border border-border/50 items-center">
            <View className="relative mb-4">
              <Avatar name={user?.name} size="xl" />
              <View className="absolute bottom-0 right-0 bg-accent rounded-full p-1.5 border-2 border-background">
                <IconifyIcon name="lucide:camera" size={14} color="white" />
              </View>
            </View>
            <Text className="text-lg font-semibold text-foreground">{user?.name || 'User'}</Text>
            <Text className="text-sm text-muted">{user?.email}</Text>
          </View>

          {/* Personal Info */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Personal Information</Text>
            </View>
            <View className="px-4 py-3">
              <Input label="Name" value={name} onChangeText={setName} placeholder="Enter your name" />
            </View>
            <Separator className="mx-4" />
            <View className="px-4 py-3">
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Enter your email" />
            </View>
          </View>

          {/* Security */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-border/50">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wider">Security</Text>
            </View>
            <View className="px-4 py-3">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <IconifyIcon name="lucide:bell" size={18} color={getThemeColor('foreground', isDark)} />
                    <Text className="text-base font-medium text-foreground">Push Notifications</Text>
                  </View>
                  <Text className="text-xs text-muted">Receive push notifications</Text>
                </View>
                <Switch isSelected={notifications} onSelectedChange={setNotifications} />
              </View>
              <Separator className="mx-0" />
              <View className="flex-row items-center justify-between mt-4 mb-4">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <IconifyIcon name="lucide:shield" size={18} color={getThemeColor('foreground', isDark)} />
                    <Text className="text-base font-medium text-foreground">Two-Factor Authentication</Text>
                  </View>
                  <Text className="text-xs text-muted">Add an extra layer of security</Text>
                </View>
                <Switch isSelected={twoFactor} onSelectedChange={setTwoFactor} />
              </View>
              <Separator className="mx-0" />
              <TouchableOpacity className="flex-row items-center justify-between py-3" onPress={() => { Haptics.selectionAsync(); router.push('/settings/account/change-password'); }} activeOpacity={0.7}>
                <View className="flex-row items-center gap-2">
                  <IconifyIcon name="lucide:key" size={18} color={getThemeColor('foreground', isDark)} />
                  <Text className="text-base font-medium text-foreground">Change Password</Text>
                </View>
                <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('muted', isDark)} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="bg-surface rounded-2xl overflow-hidden mb-5 border border-danger/20">
            <View className="px-4 py-3">
              <Text className="text-xs font-semibold text-danger uppercase tracking-wider">Danger Zone</Text>
            </View>
            <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.')} activeOpacity={0.7}>
              <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-danger/10">
                <IconifyIcon name="lucide:trash-2" size={18} color={getThemeColor('danger', isDark)} />
              </View>
              <Text className="flex-1 text-base font-medium text-danger">Delete Account</Text>
              <IconifyIcon name="lucide:chevron-right" size={18} color={getThemeColor('danger', isDark)} />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-danger/10 border border-danger/20 rounded-xl py-3.5 mb-6"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <IconifyIcon name="lucide:log-out" size={20} color={getThemeColor('danger', isDark)} />
            <Text className="text-danger font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
